# XPR ABI 2 TS types 

TODO: Need a better readme

It's simple but usefull tool that pull abi from a XPRNertwork smart contract and map it to a set of types. 
This is the beta version, feel free to modify it and make a PR.

## How to use 

### Install  
```bash 
yarn add @rockerone/abi2ts
``` 
to install the package

#### Mainnet 
```npx abi2ts nameofthecontract > ./your/path/to/definition.ts```

#### Testnet 
Use the `-t` flag if your contract is on testnet
```npx abi2ts nameofthecontract -t > ./your/path/to/definition.ts```

#### Local 
Use the `-f` flag to generate from a local ABI file. Usefull for test suite
```npx abi2ts nameofthecontract -f path/to/the/abifile.abi > ./your/path/to/definition.ts```


### Done!
"Boom" you have now generate types from the smart contract `nameofthecontract`
Now you can use 
```const someAction = nameofthecontract.nameOfTheAction(authorizationsArray,actionData)``` 
where both `authorizationsArray` and `actionData` are typed accordingly to the ABI file

Enjoy and api building !
