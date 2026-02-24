import { Abi, AbiStruct } from './types';

export class TypeRegistry {
  readonly aliases: Map<string, string>;
  readonly structs: Map<string, AbiStruct>;
  readonly variants: Map<string, string[]>;

  constructor(abi: Abi) {
    this.aliases = new Map();
    this.structs = new Map();
    this.variants = new Map();

    if (abi.types) {
      for (const t of abi.types) {
        this.aliases.set(t.new_type_name, t.type);
      }
    }

    if (abi.structs) {
      for (const s of abi.structs) {
        this.structs.set(s.name, s);
      }
    }

    if (abi.variants) {
      for (const v of abi.variants) {
        this.variants.set(v.name, v.types);
      }
    }
  }

  getAlias(name: string): string | undefined {
    return this.aliases.get(name);
  }

  getStruct(name: string): AbiStruct | undefined {
    return this.structs.get(name);
  }

  getVariant(name: string): string[] | undefined {
    return this.variants.get(name);
  }
}
