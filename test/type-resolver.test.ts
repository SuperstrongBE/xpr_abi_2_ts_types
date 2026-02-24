import { describe, it, expect } from 'vitest';
import { TypeRegistry } from '../src/type-registry';
import { resolveType, resolveFields } from '../src/type-resolver';
import atomicassets from './fixtures/atomicassets.abi.json';
import eosioToken from './fixtures/eosio.token.abi.json';
import type { Abi } from '../src/types';

const atomicAbi = atomicassets as unknown as Abi;
const tokenAbi = eosioToken as unknown as Abi;

describe('TypeRegistry', () => {
  it('indexes type aliases from abi.types', () => {
    const registry = new TypeRegistry(atomicAbi);
    expect(registry.getAlias('ATTRIBUTE_MAP')).toBe('pair_string_ATOMIC_ATTRIBUTE[]');
    expect(registry.getAlias('DOUBLE_VEC')).toBe('float64[]');
    expect(registry.getAlias('INT8_VEC')).toBe('bytes');
  });

  it('indexes all 13 type aliases', () => {
    const registry = new TypeRegistry(atomicAbi);
    expect(registry.aliases.size).toBe(13);
  });

  it('indexes structs by name', () => {
    const registry = new TypeRegistry(atomicAbi);
    const pair = registry.getStruct('pair_string_ATOMIC_ATTRIBUTE');
    expect(pair).toBeDefined();
    expect(pair!.fields).toHaveLength(2);
    expect(pair!.fields[0].name).toBe('key');
    expect(pair!.fields[1].name).toBe('value');
  });

  it('indexes variants', () => {
    const registry = new TypeRegistry(atomicAbi);
    const variantName = 'variant_int8_int16_int32_int64_uint8_uint16_uint32_uint64_float32_float64_string_INT8_VEC_INT16_VEC_INT32_VEC_INT64_VEC_UINT8_VEC_UINT16_VEC_UINT32_VEC_UINT64_VEC_FLOAT_VEC_DOUBLE_VEC_STRING_VEC';
    const variant = registry.getVariant(variantName);
    expect(variant).toBeDefined();
    expect(variant).toHaveLength(22);
    expect(variant).toContain('int8');
    expect(variant).toContain('string');
    expect(variant).toContain('STRING_VEC');
  });

  it('handles ABI with no types array', () => {
    const registry = new TypeRegistry(tokenAbi);
    expect(registry.aliases.size).toBe(0);
  });

  it('handles ABI with no variants', () => {
    const registry = new TypeRegistry(tokenAbi);
    expect(registry.variants.size).toBe(0);
  });
});

describe('resolveType', () => {
  describe('primitives', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves uint64 to number', () => {
      expect(resolveType('uint64', registry)).toBe('number');
    });

    it('resolves string to string', () => {
      expect(resolveType('string', registry)).toBe('string');
    });

    it('resolves bool to boolean', () => {
      expect(resolveType('bool', registry)).toBe('boolean');
    });

    it('resolves name to string', () => {
      expect(resolveType('name', registry)).toBe('string');
    });

    it('resolves asset to string', () => {
      expect(resolveType('asset', registry)).toBe('string');
    });

    it('resolves symbol to string', () => {
      expect(resolveType('symbol', registry)).toBe('string');
    });

    it('resolves bytes to Uint8Array', () => {
      expect(resolveType('bytes', registry)).toBe('Uint8Array');
    });
  });

  describe('primitive arrays', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves uint64[] to number[]', () => {
      expect(resolveType('uint64[]', registry)).toBe('number[]');
    });

    it('resolves name[] to string[]', () => {
      expect(resolveType('name[]', registry)).toBe('string[]');
    });

    it('resolves asset[] to string[]', () => {
      expect(resolveType('asset[]', registry)).toBe('string[]');
    });
  });

  describe('optional types', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves uint64? to number | undefined', () => {
      expect(resolveType('uint64?', registry)).toBe('number | undefined');
    });

    it('resolves string? to string | undefined', () => {
      expect(resolveType('string?', registry)).toBe('string | undefined');
    });
  });

  describe('simple structs', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves FORMAT struct', () => {
      const result = resolveType('FORMAT', registry);
      expect(result).toContain('name:string');
      expect(result).toContain('type:string');
    });

    it('resolves extended_symbol struct', () => {
      const result = resolveType('extended_symbol', registry);
      expect(result).toContain('sym:string');
      expect(result).toContain('contract:string');
    });

    it('resolves FORMAT[] as array of struct', () => {
      const result = resolveType('FORMAT[]', registry);
      expect(result).toContain('name:string');
      expect(result).toContain('[]');
    });
  });

  describe('type aliases', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves DOUBLE_VEC to number[]', () => {
      expect(resolveType('DOUBLE_VEC', registry)).toBe('number[]');
    });

    it('resolves FLOAT_VEC to number[]', () => {
      expect(resolveType('FLOAT_VEC', registry)).toBe('number[]');
    });

    it('resolves INT8_VEC to Uint8Array (alias for bytes)', () => {
      expect(resolveType('INT8_VEC', registry)).toBe('Uint8Array');
    });

    it('resolves STRING_VEC to string[]', () => {
      expect(resolveType('STRING_VEC', registry)).toBe('string[]');
    });

    it('resolves INT16_VEC to number[]', () => {
      expect(resolveType('INT16_VEC', registry)).toBe('number[]');
    });

    it('resolves UINT64_VEC to number[]', () => {
      expect(resolveType('UINT64_VEC', registry)).toBe('number[]');
    });
  });

  describe('variant types', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves ATOMIC_ATTRIBUTE through alias to variant as union type', () => {
      const result = resolveType('ATOMIC_ATTRIBUTE', registry);
      // Should be a deduplicated union: number | string | Uint8Array | number[] | string[]
      expect(result).toContain('number');
      expect(result).toContain('string');
      expect(result).toContain('Uint8Array');
      expect(result).toContain('|');
      // Should NOT have duplicate "number" entries
      const parts = result.split(' | ');
      const unique = [...new Set(parts)];
      expect(parts.length).toBe(unique.length);
    });

    it('variant union contains expected types', () => {
      const result = resolveType('ATOMIC_ATTRIBUTE', registry);
      expect(result).toContain('number');
      expect(result).toContain('string');
      expect(result).toContain('Uint8Array');
      expect(result).toContain('number[]');
      expect(result).toContain('string[]');
    });
  });

  describe('deep type chains', () => {
    const registry = new TypeRegistry(atomicAbi);

    it('resolves ATTRIBUTE_MAP through full chain', () => {
      // ATTRIBUTE_MAP → pair_string_ATOMIC_ATTRIBUTE[] → struct with variant field
      const result = resolveType('ATTRIBUTE_MAP', registry);
      // Should be an array of objects with key and value
      expect(result).toContain('key:string');
      expect(result).toContain('value:');
      expect(result).toContain('[]');
      // The value should contain the resolved variant union
      expect(result).toContain('number');
      expect(result).toContain('Uint8Array');
    });

    it('resolves pair_string_ATOMIC_ATTRIBUTE as struct', () => {
      const result = resolveType('pair_string_ATOMIC_ATTRIBUTE', registry);
      expect(result).toContain('key:string');
      expect(result).toContain('value:');
    });
  });

  describe('cycle detection', () => {
    it('handles circular references gracefully', () => {
      const circularAbi: Abi = {
        version: 'eosio::abi/1.1',
        types: [
          { new_type_name: 'TypeA', type: 'TypeB' },
          { new_type_name: 'TypeB', type: 'TypeA' },
        ],
        structs: [],
        actions: [],
        tables: [],
      };
      const registry = new TypeRegistry(circularAbi);
      const result = resolveType('TypeA', registry);
      expect(result).toBe('unknown');
    });
  });

  describe('unknown types', () => {
    it('returns unknown for undefined types', () => {
      const registry = new TypeRegistry(atomicAbi);
      expect(resolveType('nonexistent_type', registry)).toBe('unknown');
    });
  });

  describe('caching', () => {
    it('returns consistent results when called multiple times', () => {
      const registry = new TypeRegistry(atomicAbi);
      const cache = new Map<string, string>();
      const first = resolveType('ATTRIBUTE_MAP', registry, cache);
      const second = resolveType('ATTRIBUTE_MAP', registry, cache);
      expect(first).toBe(second);
    });

    it('populates the cache after resolution', () => {
      const registry = new TypeRegistry(atomicAbi);
      const cache = new Map<string, string>();
      resolveType('FORMAT', registry, cache);
      expect(cache.has('FORMAT')).toBe(true);
    });
  });
});

describe('resolveFields', () => {
  it('resolves fields for eosio.token transfer action', () => {
    const registry = new TypeRegistry(tokenAbi);
    const fields = resolveFields('transfer', registry);
    expect(fields).toHaveLength(4);
    expect(fields[0]).toBe('from:string');
    expect(fields[1]).toBe('to:string');
    expect(fields[2]).toBe('quantity:string');
    expect(fields[3]).toBe('memo:string');
  });

  it('resolves fields for atomicassets createcol action', () => {
    const registry = new TypeRegistry(atomicAbi);
    const fields = resolveFields('createcol', registry);
    expect(fields).toHaveLength(7);
    // author: name -> string
    expect(fields[0]).toBe('author:string');
    // allow_notify: bool -> boolean
    expect(fields[2]).toBe('allow_notify:boolean');
    // authorized_accounts: name[] -> string[]
    expect(fields[3]).toBe('authorized_accounts:string[]');
    // market_fee: float64 -> number
    expect(fields[5]).toBe('market_fee:number');
    // data: ATTRIBUTE_MAP -> complex resolved type
    expect(fields[6]).toContain('data:');
    expect(fields[6]).toContain('key:string');
  });

  it('resolves fields for atomicassets config_s table', () => {
    const registry = new TypeRegistry(atomicAbi);
    const fields = resolveFields('config_s', registry);
    expect(fields).toHaveLength(5);
    // asset_counter: uint64 -> number
    expect(fields[0]).toBe('asset_counter:number');
    // collection_format: FORMAT[] -> resolved struct array
    expect(fields[3]).toContain('collection_format:');
    expect(fields[3]).toContain('name:string');
    expect(fields[3]).toContain('[]');
    // supported_tokens: extended_symbol[] -> resolved struct array
    expect(fields[4]).toContain('supported_tokens:');
    expect(fields[4]).toContain('sym:string');
    expect(fields[4]).toContain('contract:string');
  });

  it('returns empty array for non-existent struct', () => {
    const registry = new TypeRegistry(atomicAbi);
    expect(resolveFields('nonexistent', registry)).toEqual([]);
  });
});
