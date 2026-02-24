# @rockerone/abi2ts

A CLI tool that generates TypeScript type definitions from XPR Network (Proton) smart contract ABIs. Supports complex types including type aliases, variants (union types), nested structs, and deep typedef chains.

## Installation

```bash
npm install -g @rockerone/abi2ts
```

Or use it locally in a project:

```bash
npm install @rockerone/abi2ts
```

## Usage

```
abi2ts [options] <contract>
abi2ts version
```

### Arguments

| Argument     | Description                                       |
| ------------ | ------------------------------------------------- |
| `<contract>` | The account name of the smart contract (required) |

### Commands

| Command   | Description               |
| --------- | ------------------------- |
| `version` | Print the current version |

### Options

| Option                | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `-t, --testnet`       | Fetch the ABI from the **testnet** endpoint instead of mainnet       |
| `-f, --file <path>`   | Load the ABI from a **local JSON file** instead of fetching from RPC |
| `-r, --rename <name>` | Override the contract identifier used in the generated types         |
| `-V, --version`       | Display the current version                                          |
| `-h, --help`          | Display help                                                         |

### RPC Endpoints

| Network | URL                            |
| ------- | ------------------------------ |
| Mainnet | `https://api.rockerone.io`     |
| Testnet | `https://testnet.rockerone.io` |

## Examples

### Generate types from mainnet

```bash
abi2ts eosio.token > eosio_token.ts
```

Dots in contract names are automatically replaced with underscores in generated identifiers (e.g. `eosio.token` becomes `eosio_token_Actions`).

### Generate types from testnet

```bash
abi2ts -t mycontract > mycontract.ts
```

### Generate types from a local ABI file

```bash
abi2ts -f ./mycontract.abi mycontract > mycontract.ts
```

### Override the generated type name

```bash
abi2ts -r MyToken eosio.token > mytoken.ts
```

This generates types prefixed with `MyToken` (e.g. `MyToken_Actions`, `MyToken_Tables`) instead of the auto-sanitized `eosio_token`.

### Run without installing

```bash
npm run build
node bin/cli.js eosio.token > eosio_token.ts
node bin/cli.js -f ./path/to/abi.json mycontract > mycontract.ts
```

## Generated Output

The CLI outputs the following TypeScript definitions to **stdout**:

### 1. `<Name>_Actions`

A type mapping each action name to its parameter types. Complex types (type aliases, variants, nested structs) are fully resolved.

```typescript
type eosio_token_Actions = {
  transfer: {
    from: string;
    to: string;
    quantity: string;
    memo: string;
  };
  issue: {
    to: string;
    quantity: string;
    memo: string;
  };
};
```

For contracts with complex types like `atomicassets`, nested types are fully expanded:

```typescript
type atomicassets_Actions = {
  createcol: {
    author: string;
    collection_name: string;
    allow_notify: boolean;
    authorized_accounts: string[];
    notify_accounts: string[];
    market_fee: number;
    data: {
      key: string;
      value: number | string | Uint8Array | number[] | string[];
    }[];
  };
  // ...
};
```

### 2. Action Builders

A const object with a builder function for each action, returning a fully-typed `XPRAction` object ready for transaction submission.

```typescript
export const eosio_token = {
  transfer: (
    authorization: Authorization[],
    data: eosio_token_Actions["transfer"],
  ): XPRAction<"transfer"> => ({
    account: "eosio.token",
    name: "transfer",
    authorization,
    data,
  }),
  // ...
};
```

### 3. `<Name>_Tables`

A type mapping each table name to its row structure.

```typescript
type eosio_token_Tables = {
  account: {
    balance: string;
  };
  currency_stats: {
    supply: string;
    max_supply: string;
    issuer: string;
  };
};
```

### 4. Helper Types

```typescript
// Authorization for transaction signing
export type Authorization = {
  actor: string;
  permission: "active" | "owner" | string;
};

// Typed action wrapper
export type XPRAction<A extends keyof eosio_token_Actions> = {
  account: "eosio.token";
  name: A;
  authorization: Authorization[];
  data: eosio_token_Actions[A];
};

// Table row accessor
export type Tables<TableName extends keyof eosio_token_Tables> =
  eosio_token_Tables[TableName];

// Action params accessor
export type Actions<ActionName extends keyof eosio_token_Actions> =
  eosio_token_Actions[ActionName];
```

### 5. `<Name>_actionParams` Helper

A utility function that extracts action parameter values as an array:

```typescript
export function eosio_token_actionParams<
  ActionName extends keyof eosio_token_Actions,
>(
  actionParams: eosio_token_Actions[ActionName],
): (object | number | string | number[] | string[])[] {
  return Object.values(actionParams);
}
```

## ABI Type Mapping

### Primitives

| ABI Type                                                                                                                                                         | TypeScript Type |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `uint8`, `int8`, `uint16`, `int16`, `uint32`, `int32`, `uint64`, `int64`, `uint128`, `int128`, `uint256`, `int256`, `uint512`, `int512`, `varuint32`, `varint32` | `number`        |
| `float32`, `float64`, `float128`, `float256`                                                                                                                     | `number`        |
| `string`, `name`, `asset`, `symbol`, `symbol_code`                                                                                                               | `string`        |
| `time_point`, `time_point_sec`, `block_timestamp_type`                                                                                                           | `string`        |
| `checksum160`, `checksum256`, `checksum512`                                                                                                                      | `string`        |
| `public_key`, `signature`, `extended_asset`                                                                                                                      | `string`        |
| `bool`                                                                                                                                                           | `boolean`       |
| `bytes`                                                                                                                                                          | `Uint8Array`    |

### Complex Types

| ABI Pattern                | TypeScript Output                     | Example                                                                  |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| Custom structs             | Inlined object `{ field: type; ... }` | `FORMAT` -> `{ name: string; type: string }`                             |
| Array types                | `[]` suffix                           | `uint64[]` -> `number[]`, `FORMAT[]` -> `{ ... }[]`                      |
| Type aliases (`abi.types`) | Resolved recursively                  | `DOUBLE_VEC` -> `float64[]` -> `number[]`                                |
| Variants (`abi.variants`)  | Union type with `\|`                  | `ATOMIC_ATTRIBUTE` -> `number \| string \| Uint8Array \| ...`            |
| Optional types             | `\| undefined` suffix                 | `uint64?` -> `number \| undefined`                                       |
| Deep typedef chains        | Fully resolved                        | `ATTRIBUTE_MAP` -> `({ key: string; value: number \| string \| ... })[]` |

## Architecture

```
src/
  cli.ts              # CLI entry point (commander setup)
  abi-loader.ts       # ABI fetching (HTTP) and local file loading
  types.ts            # Shared TypeScript interfaces (Abi, AbiStruct, etc.)
  primitives.ts       # Primitive ABI-to-TS type map
  type-registry.ts    # Indexes abi.types, abi.structs, abi.variants into Maps
  type-resolver.ts    # Recursive type resolver with caching and cycle detection
  code-generator.ts   # Assembles final TypeScript output
  templates.ts        # String template functions for output formatting
test/
  fixtures/           # Saved ABI JSON files (atomicassets, eosio.token)
  type-resolver.test.ts
  code-generator.test.ts
  integration.test.ts
```

### Internal Flow

1. Parse CLI arguments via `commander`
2. Sanitize the type name (replace `.` with `_`)
3. Load ABI: fetch from RPC endpoint (`/v1/chain/get_abi`) or read from a local file
4. Build a `TypeRegistry` indexing all type aliases, structs, and variants
5. Resolve each action's fields through the type resolver (aliases -> variants -> structs -> primitives)
6. Generate `<Name>_Actions` type, action builder functions, `<Name>_Tables` type
7. Output helper types (`Authorization`, `XPRAction`, `Tables`, `Actions`, `actionParams`)
8. All output goes to stdout for piping/redirection

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node bin/cli.js <contract>

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```
