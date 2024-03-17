#!/usr/bin/env node

const {Command} = require("commander");
const {RpcInterfaces, Serialize, Api} = require("eosjs");
const packageJson = require("../package.json");

const program = new Command();

async function loadAbi(account_name:string, rpcUrl:string):Promise< void | { account_name:string,abi: any}> {
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

function getActionFields(actionName:string, abiStructs:any) {
  const findStruct = abiStructs.findLast((struct:any) => struct.name == actionName);
  const fields = {};
  return findStruct.fields.map((field:{name:string,type:string}) => {
    return "" + field.name + ":" + transformType(field.type) + ";";
  });
}

function transformType(type:string) {
  switch (type) {
    case "string":
      return "string";
    case "string[]":
      return "string[]";
    case "name":
      return "string";
    case "name[]":
      return "string[]";
    case "asset":
      return "string";
    case "asset[]":
      return "string[]";
    case "symbol":
      return "string";
    case "symbol[]":
      return "string[]";
    case "uint8":
      return "number";
    case "int8":
      return "number";
    case "uint32":
      return "number";
    case "int32":
      return "number";
    case "float32":
      return "number";
    case "uint64":
      return "number";
    case "int64":
      return "number";
    case "float64":
      return "number";
    case "uint128":
      return "number";
    case "int128":
      return "number";
    case "float128":
      return "number";
    case "uint256":
      return "number";
    case "int256":
      return "number";
    case "float256":
      return "number";
    case "uint512":
      return "number";
    case "int512":
      return "number";
    case "float512":
      return "number";
    case "uint8[]":
      return "number[]";
    case "int8[]":
      return "number[]";
    case "uint32[]":
      return "number[]";
    case "int32[]":
      return "number[]";
    case "float32[]":
      return "number[]";
    case "uint64[]":
      return "number[]";
    case "int64[]":
      return "number[]";
    case "float64[]":
      return "number[]";
    case "uint128[]":
      return "number[]";
    case "int128[]":
      return "number[]";
    case "float128[]":
      return "number[]";
    case "uint256[]":
      return "number[]";
    case "int256[]":
      return "number[]";
    case "float256[]":
      return "number[]";
    case "uint512[]":
      return "number[]";
    case "int512[]":
      return "number[]";
    case "float512[]":
      return "number[]";
  }
}

function formatDefinition(definitionName:string, field:string[]):string {
  let str = '  "' + definitionName.replace(".", "_") + '": ';
  str += "{\n";
  str += "    ";
  str += field.join("\n    ");
  str += "\n  }";
  return str;
}

function wrapTypes(typeName:string, content:string):string {
  let str = "type ";
  str += typeName.replace(".", "_") + " = ";
  str += "{\n";
  str += content;
  str += "\n}";
  str += "\n";
  return str;
}

program
  .version(packageJson.version)
  .description("Description of your CLI tool")
  .arguments("<name>")
  .action(async (name:string) => {
    const abi = await loadAbi(name, "http://node-main.betxpr.com:8888");
    if (!abi || !abi.abi) return 
    const actionDefinitions = abi.abi.actions
      .map((action:any) => {
        return formatDefinition(
          action.name,
          getActionFields(action.name, abi.abi.structs)
        );
      })
      .join(",\n");
    console.log(wrapTypes("Actions", actionDefinitions));

    const tableDefinitions = abi.abi.tables
      .map((table:any) => {
        return formatDefinition(
          table.type,
          getActionFields(table.type, abi.abi.structs)
        );
      })
      .join(",\n");
    console.log(wrapTypes("Tables", tableDefinitions));
  })
  .parse(process.argv);
