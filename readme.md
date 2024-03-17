# XPR ABI 2 TS types 
It's simple but usefull tool that pull abi from a contract and turn it to a set of types. 
This is the beta version, feel free to modify it and make a PR.

## How to use 
Run `yarn build` to compile from source
Then run `npx ./dist/pull.js > ./path/to/folder/definition.ts nameofthecontract` and "Boom" it generate types from the smart contract `nameofthecontract`

## TODO
- Add support for testnet with flag
- Add .env file to make it more convenient
- Fix some missing types conversion
