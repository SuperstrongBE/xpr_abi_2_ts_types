#!/usr/bin/env node
require("dotenv").config();
const {Command} = require("commander");
const {RpcInterfaces, Serialize, Api} = require("eosjs");
const packageJson = require("../package.json");

const program = new Command();

type TypeMap = {
  types: string[];
  target: string;
};

const typesMaps: TypeMap[] = [
  {
    types: [
      "uint8",
      "int8",
      "uint32",
      "int32",
      "float32",
      "uint64",
      "int64",
      "float64",
      "uint128",
      "int128",
      "float128",
      "uint256",
      "int256",
      "float256",
      "uint512",
      "int512",
    ],
    target: "number",
  },
  {
    types: ["string", "name", "asset", "symbol"],
    target: "string",
  },
  {
    types: ["bool"],
    target: "boolean",
  },
];

const TYPE_FIELD_TEMPLATE = (name: string, type: string, level: number = 0) =>
  `${name}:${type}`.padStart(level, "  ");
const MODULE_FIELD_TEMPLATE = (
  module: string,
  content: string,
  level: number = 0
) => `export type ${module} = {${content}}`.padStart(level, "  ");

const ACTIONS_TYPE_TEMPLATE = (contractName:string,content:string) => `export const ${contractName} = {\n ${content} \n} `
const ACTION_FUNCTION_TEMPLATE = (contractName:string,actionName:string,) => ` '${actionName}':(authorization:Authorization[],data:${contractName}_Actions['${actionName}']):XPRAction<'${actionName}'>=>({\n\taccount:'${contractName}',\n\tname:'${actionName}',\n\tauthorization,\n\data})`

async function loadAbi(
  account_name: string,
  rpcUrl: string
): Promise<void | {account_name: string; abi: any}> {
  return fetch(`${rpcUrl}/v1/chain/get_abi`, {
    method: "POST",
    body: JSON.stringify({
      account_name,
    }),
  })
    .then(async res => {
      const response = await res.json();
      return {
        account_name,
        abi: {...response.abi},
      };
    })
    .catch(e => {
      console.log("Error while fetching the ABI");
    });
}

function getFields(lookupField: string, abiStructs: any) {
  const findStruct = abiStructs.findLast(
    (struct: any) => struct.name.indexOf(lookupField) > -1
  );
  if (!findStruct) return [];
  return findStruct.fields.map((field: {name: string; type: string}) => {
    return TYPE_FIELD_TEMPLATE(
      field.name,
      transformType(field.type, abiStructs)
    );
  });
}

function transformType(type: string, abiStructs: any): string {
  const rawType = type.replace("[]", "");
  const arrayTypeRegexp = /\[\]$/g;
  const isArray = arrayTypeRegexp.test(type);
  const suffix = isArray ? "[]" : "";
  const foundMap = typesMaps.findLast(map => map.types.indexOf(rawType) >= 0);

  if (foundMap) {
    return `${foundMap.target}${suffix}`;
  }
  const customType = getFields(rawType, abiStructs);
  return `{\n  ${customType.join(";\n")}  \n}${suffix}`;
}

//TODO create a template string const function
function formatCustomFields(field: string[], isArray: boolean): string {
  const suffix = isArray ? "[]" : "";
  return `{\n      ${field.join(",\n    ")}\n      }${suffix}`;
}

//TODO create a template string const function
function formatDefinition(definitionName: string, field: string[]): string {
  let str = '  "' + definitionName + '": ';
  str += "{\n";
  str += "    ";
  str += field.join(";\n    ");
  str += "\n  }";
  return str;
}

function formateActionsFunction(contractName:string,actionName:string): string { 

  return ACTION_FUNCTION_TEMPLATE(contractName, actionName);

}

function wrapActionsModule(contractName: string, content: string): string { 

  return ACTIONS_TYPE_TEMPLATE(contractName, content);

}

function wrapTypes(typeName: string, content: string): string {
  let str = "type ";
  str += typeName + " = ";
  str += "{\n";
  str += content;
  str += "\n}";
  str += "\n";
  return str;
}

program
  .version(packageJson.version)
  .description("Description of your CLI tool")
  .option("-t, --testnet")
  .arguments("<name>")
  .action(async (name: string, options: any) => {
    const endpoint = options.testnet
      ? process.env.TESTNET_EP!
      : process.env.MAINNET_EP!;

    const abi = await loadAbi(name, endpoint);
    if (!abi || !abi.abi) return;
    const actionDefinitions = abi.abi.actions
      .map((action: any) => {
        return formatDefinition(
          action.name,
          getFields(action.name, abi.abi.structs)
        );
      })
      .join(",\n");
    console.log(wrapTypes(`${name}_Actions`, actionDefinitions));
    
    const actionFunctionsDefinitions = abi.abi.actions
      .map((action: any) => {
        return formateActionsFunction(name, action.name)
        
      })
      .join(",\n");
    console.log(wrapActionsModule(name, actionFunctionsDefinitions));

    const tableDefinitions = abi.abi.tables
      .map((table: any) => {
        return formatDefinition(
          table.type,
          getFields(table.type, abi.abi.structs)
        );
      })
      .join(",\n");
    console.log(wrapTypes(`${name}_Tables`, tableDefinitions));

    console.log(`
    export type Authorization = {
      actor: string;
      permission: "active"|"owner"|string;
  }`);

    console.log(`
    export type XPRAction<A extends keyof (${name}_Actions)>={
      account: '${name}';
      name: A;
      authorization: Authorization[];
      data: ${name}_Actions[A]; 
    }
  `);
    console.log(
      `export type Tables<TableName extends keyof (${name}_Tables)> = ${name}_Tables[TableName];`
    );
    console.log(
      `export type Actions<ActionName extends keyof (${name}_Actions)> = ${name}_Actions[ActionName];`
    );
  })
  .parse(process.argv);
