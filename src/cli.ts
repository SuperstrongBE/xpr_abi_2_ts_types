#!/usr/bin/env node

require('dotenv').config();
const { Command } = require('commander');
const packageJson = require('../package.json');

import { loadAbi, loadLocalAbi, TN_EP, MN_EP } from './abi-loader';
import { generateOutput } from './code-generator';

const program = new Command();

program
  .version(packageJson.version)
  .description(
    'Generate TypeScript types from XPR Network smart contract ABIs'
  );

program
  .command('version')
  .description('Print the current version')
  .action(() => {
    console.log(packageJson.version);
  });

program
  .option('-t, --testnet')
  .option('-f, --file <char>')
  .option('-r, --rename <char>')
  .arguments('<contract>')
  .action(async (contract: string, options: any) => {
    const endpoint = options.testnet ? TN_EP : MN_EP;
    const name = (options.rename ? options.rename : contract).replace(/\./g, '_');
    const abi = options.file
      ? await loadLocalAbi(contract, options.file)
      : await loadAbi(contract, endpoint);
    if (!abi) return;
    console.log(generateOutput(abi.abi, contract, name));
  })
  .parse(process.argv);
