export function typeFieldTemplate(name: string, type: string): string {
  return `${name}:${type}`;
}

export function formatDefinition(definitionName: string, fields: string[]): string {
  let str = '  "' + definitionName + '": ';
  str += '{\n';
  str += '    ';
  str += fields.join(';\n    ');
  str += '\n  }';
  return str;
}

export function wrapTypes(typeName: string, content: string): string {
  let str = 'type ';
  str += typeName + ' = ';
  str += '{\n';
  str += content;
  str += '\n}';
  str += '\n';
  return str;
}

export function actionsTypeTemplate(contractName: string, content: string): string {
  return `export const ${contractName} = {\n ${content} \n} `;
}

export function actionFunctionTemplate(
  contractName: string,
  name: string,
  actionName: string
): string {
  const safeName = actionName.replace(/\./g, '_');
  return ` ${safeName}:(authorization:Authorization[],data:${name}_Actions['${actionName}']):XPRAction<'${actionName}'>=>({\n\taccount:'${contractName}',\n\tname:'${actionName}',\n\tauthorization,\n\tdata})`;
}

export function helperTypes(contract: string, name: string): string {
  return `
    export type Authorization = {
      actor: string;
      permission: "active"|"owner"|string;
  }

    export type XPRAction<A extends keyof (${name}_Actions)>={
      account: '${contract}';
      name: A;
      authorization: Authorization[];
      data: ${name}_Actions[A];
    }

export type Tables<TableName extends keyof (${name}_Tables)> = ${name}_Tables[TableName];
export type Actions<ActionName extends keyof (${name}_Actions)> = ${name}_Actions[ActionName];
export function ${name}_actionParams<ActionName extends keyof (${name}_Actions)>(actionPrams: ${name}_Actions[ActionName]):(object|number|string |number[]|string[])[]{return Object.values(actionPrams)}`;
}
