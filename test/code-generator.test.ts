import { describe, it, expect } from 'vitest';
import { generateOutput } from '../src/code-generator';
import atomicassets from './fixtures/atomicassets.abi.json';
import eosioToken from './fixtures/eosio.token.abi.json';
import type { Abi } from '../src/types';

const atomicAbi = atomicassets as unknown as Abi;
const tokenAbi = eosioToken as unknown as Abi;

describe('generateOutput', () => {
  describe('eosio.token (simple ABI)', () => {
    const output = generateOutput(tokenAbi, 'eosio.token', 'eosio_token');

    it('generates Actions type', () => {
      expect(output).toContain('type eosio_token_Actions = {');
      expect(output).toContain('"transfer"');
      expect(output).toContain('from:string');
      expect(output).toContain('to:string');
      expect(output).toContain('quantity:string');
      expect(output).toContain('memo:string');
    });

    it('generates Tables type', () => {
      expect(output).toContain('type eosio_token_Tables = {');
      expect(output).toContain('"account"');
    });

    it('generates action builder functions', () => {
      expect(output).toContain('export const eosio_token = {');
      expect(output).toContain("account:'eosio.token'");
      expect(output).toContain("name:'transfer'");
    });

    it('generates Authorization helper type', () => {
      expect(output).toContain('export type Authorization');
      expect(output).toContain('actor: string');
      expect(output).toContain('permission:');
    });

    it('generates XPRAction helper type', () => {
      expect(output).toContain('export type XPRAction');
      expect(output).toContain("account: 'eosio.token'");
    });

    it('generates Tables and Actions accessor types', () => {
      expect(output).toContain('export type Tables<TableName extends keyof (eosio_token_Tables)>');
      expect(output).toContain('export type Actions<ActionName extends keyof (eosio_token_Actions)>');
    });

    it('generates actionParams helper function', () => {
      expect(output).toContain('export function eosio_token_actionParams');
      expect(output).toContain('Object.values');
    });
  });

  describe('atomicassets (complex ABI)', () => {
    const output = generateOutput(atomicAbi, 'atomicassets', 'atomicassets');

    it('generates Actions type with all actions', () => {
      expect(output).toContain('type atomicassets_Actions = {');
      expect(output).toContain('"createcol"');
      expect(output).toContain('"acceptoffer"');
    });

    it('resolves ATTRIBUTE_MAP in createcol action data field', () => {
      // The data field should NOT be {} or unknown
      // It should contain the resolved pair struct with variant value
      expect(output).toContain('"createcol"');
      // The output should contain the key:string field from the pair struct
      expect(output).toContain('key:string');
    });

    it('does not contain empty object types for complex fields', () => {
      // The old code produced {} for unknown types -- now they should resolve
      // Check that ATTRIBUTE_MAP fields aren't just empty objects
      expect(output).not.toMatch(/"data": \{\s*\}/);
    });

    it('resolves FORMAT[] in config_s table', () => {
      expect(output).toContain('type atomicassets_Tables = {');
      expect(output).toContain('"config_s"');
    });

    it('resolves extended_symbol[] in config_s table', () => {
      expect(output).toContain('sym:string');
      expect(output).toContain('contract:string');
    });

    it('generates action builder functions for atomicassets', () => {
      expect(output).toContain('export const atomicassets = {');
      expect(output).toContain("account:'atomicassets'");
    });
  });

  describe('rename option', () => {
    const output = generateOutput(tokenAbi, 'eosio.token', 'MyToken');

    it('uses renamed type in Actions', () => {
      expect(output).toContain('type MyToken_Actions = {');
    });

    it('uses renamed type in Tables', () => {
      expect(output).toContain('type MyToken_Tables = {');
    });

    it('uses renamed type in action builders', () => {
      expect(output).toContain('export const MyToken = {');
    });

    it('keeps original contract name in account field', () => {
      expect(output).toContain("account:'eosio.token'");
    });

    it('uses renamed type in helper types', () => {
      expect(output).toContain('MyToken_Actions');
      expect(output).toContain('MyToken_Tables');
      expect(output).toContain('export function MyToken_actionParams');
    });
  });
});
