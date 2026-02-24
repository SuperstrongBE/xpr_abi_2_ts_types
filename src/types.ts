export interface AbiType {
  new_type_name: string;
  type: string;
}

export interface AbiField {
  name: string;
  type: string;
}

export interface AbiStruct {
  name: string;
  base: string;
  fields: AbiField[];
}

export interface AbiAction {
  name: string;
  type: string;
  ricardian_contract: string;
}

export interface AbiTable {
  name: string;
  type: string;
  index_type: string;
  key_names: string[];
  key_types: string[];
}

export interface AbiVariant {
  name: string;
  types: string[];
}

export interface Abi {
  version: string;
  types: AbiType[];
  structs: AbiStruct[];
  actions: AbiAction[];
  tables: AbiTable[];
  variants?: AbiVariant[];
}

export interface AbiResponse {
  account_name: string;
  abi: Abi;
}
