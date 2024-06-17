#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const { Command } = require("commander");
const axios = require('axios').default;
const { RpcInterfaces, Serialize, Api } = require("eosjs");
const packageJson = require("../package.json");
const fs = require("fs");
const TN_EP = 'https://testnet.rockerone.io';
const MN_EP = 'https://api.rockerone.io';
const program = new Command();
const typesMaps = [
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
const TYPE_FIELD_TEMPLATE = (name, type, level = 0) => `${name}:${type}`.padStart(level, "  ");
const MODULE_FIELD_TEMPLATE = (module, content, level = 0) => `export type ${module} = {${content}}`.padStart(level, "  ");
const ACTIONS_TYPE_TEMPLATE = (contractName, content) => `export const ${contractName} = {\n ${content} \n} `;
const ACTION_FUNCTION_TEMPLATE = (contractName, name, actionName) => ` ${actionName.replace('.', '_')}:(authorization:Authorization[],data:${name}_Actions['${actionName}']):XPRAction<'${actionName}'>=>({\n\taccount:'${contractName}',\n\tname:'${actionName}',\n\tauthorization,\n\data})`;
async function loadAbi(account_name, rpcUrl) {
    return axios({
        method: 'post',
        url: `${rpcUrl}/v1/chain/get_abi`,
        data: {
            account_name,
        }
    }).then((data) => ({
        account_name,
        abi: { ...data.data.abi },
    }));
    // return fetch(`${rpcUrl}/v1/chain/get_abi`, {
    //   cache:'no-cache',
    //   headers:myHeaders,
    //   method: "POST",
    //   body: JSON.stringify({
    //     account_name,
    //     r:now
    //   }),
    // })
    //   .then(async res => {
    //     const response = await res.json();
    //     return {
    //       account_name,
    //       abi: {...response.abi},
    //     };
    //   })
    //   .catch(e => {
    //     console.log("Error while fetching the ABI");
    //     return null
    //   });
}
async function loadLocalAbi(account_name, abi_path) {
    return new Promise((resolve, reject) => {
        fs.readFile(abi_path, "utf8", (error, data) => {
            if (error) {
                return reject(null);
            }
            return resolve({
                account_name,
                abi: JSON.parse(data)
            });
        });
    });
}
function getFields(lookupField, abiStructs) {
    const findStruct = abiStructs.findLast((struct) => struct.name == lookupField);
    if (!findStruct)
        return [];
    return findStruct.fields.map((field) => {
        return TYPE_FIELD_TEMPLATE(field.name, transformType(field.type, abiStructs));
    });
}
function transformType(type, abiStructs) {
    const rawType = type.replace("[]", "");
    const arrayTypeRegexp = /\[\]$/g;
    const isArray = arrayTypeRegexp.test(type);
    const suffix = isArray ? "[]" : "";
    const foundMap = typesMaps.findLast(map => map.types.indexOf(rawType) >= 0);
    if (foundMap) {
        return `${foundMap.target}${suffix}`;
    }
    const customType = getFields(type, abiStructs);
    return `{\n  ${customType.join(";\n")}  \n}${suffix}`;
}
//TODO create a template string const function
function formatDefinition(definitionName, field) {
    let str = '  "' + definitionName + '": ';
    str += "{\n";
    str += "    ";
    str += field.join(";\n    ");
    str += "\n  }";
    return str;
}
function formateActionsFunction(contractName, name, actionName) {
    return ACTION_FUNCTION_TEMPLATE(contractName, name, actionName);
}
function wrapActionsModule(contractName, content) {
    return ACTIONS_TYPE_TEMPLATE(contractName, content);
}
function wrapTypes(typeName, content) {
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
    .option("-f, --file <char>")
    .option("-r, --rename <char>")
    .arguments("<contract>")
    .action(async (contract, options) => {
    const endpoint = options.testnet
        ? TN_EP
        : MN_EP;
    const name = options.rename ? options.rename : contract;
    let abi = (options.file) ? await loadLocalAbi(contract, options.file) : await loadAbi(contract, endpoint);
    if (!abi)
        return;
    const actionDefinitions = abi.abi.actions
        .map((action) => {
        return formatDefinition(action.name, getFields(action.name, abi.abi.structs));
    })
        .join(",\n");
    console.log(wrapTypes(`${name}_Actions`, actionDefinitions));
    const actionFunctionsDefinitions = abi.abi.actions
        .map((action) => {
        return formateActionsFunction(contract, name, action.name);
    })
        .join(",\n");
    console.log(wrapActionsModule(name, actionFunctionsDefinitions));
    const tableDefinitions = abi.abi.tables
        .map((table) => {
        return formatDefinition(table.type, getFields(table.type, abi.abi.structs));
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
      account: '${contract}';
      name: A;
      authorization: Authorization[];
      data: ${name}_Actions[A]; 
    }
  `);
    console.log(`export type Tables<TableName extends keyof (${name}_Tables)> = ${name}_Tables[TableName];`);
    console.log(`export type Actions<ActionName extends keyof (${name}_Actions)> = ${name}_Actions[ActionName];`);
    console.log(`export function ${name}_actionParams<ActionName extends keyof (${name}_Actions)>(actionPrams: ${name}_Actions[ActionName]):(object|number|string |number[]|string[])[]{return Object.values(actionPrams)}`);
})
    .parse(process.argv);
