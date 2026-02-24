import { Abi } from './types';
import { TypeRegistry } from './type-registry';
import { resolveFields } from './type-resolver';
import {
  formatDefinition,
  wrapTypes,
  actionsTypeTemplate,
  actionFunctionTemplate,
  helperTypes,
} from './templates';

export function generateOutput(abi: Abi, contract: string, name: string): string {
  const registry = new TypeRegistry(abi);
  const cache = new Map<string, string>();
  const resolving = new Set<string>();

  const parts: string[] = [];

  // 1. Actions type
  const actionDefinitions = abi.actions
    .map(action =>
      formatDefinition(
        action.name,
        resolveFields(action.name, registry, cache, resolving)
      )
    )
    .join(',\n');
  parts.push(wrapTypes(`${name}_Actions`, actionDefinitions));

  // 2. Action builder functions
  const actionFunctions = abi.actions
    .map(action => actionFunctionTemplate(contract, name, action.name))
    .join(',\n');
  parts.push(actionsTypeTemplate(name, actionFunctions));

  // 3. Tables type
  const tableDefinitions = abi.tables
    .map(table =>
      formatDefinition(
        table.type,
        resolveFields(table.type, registry, cache, resolving)
      )
    )
    .join(',\n');
  parts.push(wrapTypes(`${name}_Tables`, tableDefinitions));

  // 4. Helper types
  parts.push(helperTypes(contract, name));

  return parts.join('\n');
}
