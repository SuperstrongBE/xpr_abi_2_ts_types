# XPR ABI 2 TS types 
It's simple but usefull tool that pull abi from a contract and turn it to a set of types. 
This is the beta version, feel free to modify it and make a PR.

## How to use 
Run `yarn build` to compile from source
Then run `node ./dist/pull.js > ./path/to/folder/definition.ts nameofthecontract` and "Boom" it generate types from the smart contract `nameofthecontract`

## Example
Run `node ./dist/pull.js > ./aa_types.ts atomicassets`;
Create a new file and start with 
```
import { XPRAction } from "./aa_types";
const burnAction:XPRAction<'burnasset'> = {

}
```
Basic action fields will have auto completion with contract name, action name, and data field is typed
Enjoy
