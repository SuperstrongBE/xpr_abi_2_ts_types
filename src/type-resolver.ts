import { getPrimitiveMapping } from './primitives';
import { TypeRegistry } from './type-registry';
import { typeFieldTemplate } from './templates';

interface ParsedType {
  baseType: string;
  isArray: boolean;
  isOptional: boolean;
}

function parseTypeSuffix(typeName: string): ParsedType {
  let baseType = typeName;
  let isOptional = false;
  let isArray = false;

  // Check optional suffix first (e.g., "uint64?")
  if (baseType.endsWith('?')) {
    isOptional = true;
    baseType = baseType.slice(0, -1);
  }

  // Check array suffix (e.g., "uint64[]")
  if (baseType.endsWith('[]')) {
    isArray = true;
    baseType = baseType.slice(0, -2);
  }

  return { baseType, isArray, isOptional };
}

function wrapType(ts: string, isArray: boolean, isOptional: boolean): string {
  let result = ts;
  if (isArray) {
    // Wrap complex types in parens for correct array syntax
    result = ts.includes(' ') || ts.includes('|') ? `(${ts})[]` : `${ts}[]`;
  }
  if (isOptional) {
    result = `${result} | undefined`;
  }
  return result;
}

export function resolveType(
  typeName: string,
  registry: TypeRegistry,
  cache: Map<string, string> = new Map(),
  resolving: Set<string> = new Set()
): string {
  const { baseType, isArray, isOptional } = parseTypeSuffix(typeName);

  // Check cache
  if (cache.has(baseType)) {
    return wrapType(cache.get(baseType)!, isArray, isOptional);
  }

  // Cycle detection
  if (resolving.has(baseType)) {
    return wrapType('unknown', isArray, isOptional);
  }
  resolving.add(baseType);

  let resolved: string;

  // 1. Primitive?
  const primitive = getPrimitiveMapping(baseType);
  if (primitive) {
    resolved = primitive;
  }
  // 2. Type alias?
  else if (registry.getAlias(baseType) !== undefined) {
    resolved = resolveType(registry.getAlias(baseType)!, registry, cache, resolving);
  }
  // 3. Variant?
  else if (registry.getVariant(baseType) !== undefined) {
    const members = registry.getVariant(baseType)!;
    const resolvedMembers = members.map(m =>
      resolveType(m, registry, cache, resolving)
    );
    // Deduplicate (e.g., many int types all map to "number")
    resolved = [...new Set(resolvedMembers)].join(' | ');
  }
  // 4. Struct?
  else if (registry.getStruct(baseType) !== undefined) {
    const struct = registry.getStruct(baseType)!;
    const fields = struct.fields.map(f => {
      const fieldType = resolveType(f.type, registry, cache, resolving);
      return typeFieldTemplate(f.name, fieldType);
    });
    resolved = `{\n  ${fields.join(';\n  ')}\n}`;
  }
  // 5. Unknown
  else {
    resolved = 'unknown';
  }

  resolving.delete(baseType);
  cache.set(baseType, resolved);
  return wrapType(resolved, isArray, isOptional);
}

export function resolveFields(
  lookupField: string,
  registry: TypeRegistry,
  cache: Map<string, string> = new Map(),
  resolving: Set<string> = new Set()
): string[] {
  const struct = registry.getStruct(lookupField);
  if (!struct) return [];
  return struct.fields.map(field => {
    const fieldType = resolveType(field.type, registry, cache, resolving);
    return typeFieldTemplate(field.name, fieldType);
  });
}
