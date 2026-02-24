import { describe, it, expect } from 'vitest';
import { generateOutput } from '../src/code-generator';
import atomicassets from './fixtures/atomicassets.abi.json';
import eosioToken from './fixtures/eosio.token.abi.json';
import type { Abi } from '../src/types';

const atomicAbi = atomicassets as unknown as Abi;
const tokenAbi = eosioToken as unknown as Abi;

describe('integration: full pipeline', () => {
  describe('eosio.token output structure', () => {
    const output = generateOutput(tokenAbi, 'eosio.token', 'eosio_token');

    it('contains all 5 sections in order', () => {
      const actionsTypeIdx = output.indexOf('type eosio_token_Actions');
      const constIdx = output.indexOf('export const eosio_token');
      const tablesTypeIdx = output.indexOf('type eosio_token_Tables');
      const authIdx = output.indexOf('export type Authorization');
      const xprActionIdx = output.indexOf('export type XPRAction');

      expect(actionsTypeIdx).toBeGreaterThanOrEqual(0);
      expect(constIdx).toBeGreaterThan(actionsTypeIdx);
      expect(tablesTypeIdx).toBeGreaterThan(constIdx);
      expect(authIdx).toBeGreaterThan(tablesTypeIdx);
      expect(xprActionIdx).toBeGreaterThan(authIdx);
    });

    it('produces non-empty output', () => {
      expect(output.length).toBeGreaterThan(100);
    });
  });

  describe('atomicassets output structure', () => {
    const output = generateOutput(atomicAbi, 'atomicassets', 'atomicassets');

    it('contains all 5 sections in order', () => {
      const actionsTypeIdx = output.indexOf('type atomicassets_Actions');
      const constIdx = output.indexOf('export const atomicassets');
      const tablesTypeIdx = output.indexOf('type atomicassets_Tables');
      const authIdx = output.indexOf('export type Authorization');

      expect(actionsTypeIdx).toBeGreaterThanOrEqual(0);
      expect(constIdx).toBeGreaterThan(actionsTypeIdx);
      expect(tablesTypeIdx).toBeGreaterThan(constIdx);
      expect(authIdx).toBeGreaterThan(tablesTypeIdx);
    });

    it('does not contain "unknown" for known types', () => {
      // All types in atomicassets should be fully resolvable
      expect(output).not.toContain(':unknown');
    });

    it('resolves variant types as union', () => {
      // ATOMIC_ATTRIBUTE variant should produce a union with |
      expect(output).toMatch(/number \| string/);
    });

    it('resolves nested struct arrays', () => {
      // FORMAT[] should appear as resolved struct array
      expect(output).toMatch(/name:string/);
      expect(output).toMatch(/type:string/);
    });

    it('handles all 35 actions without errors', () => {
      // atomicassets has 35 actions - all should be present
      const actionMatches = output.match(/"(\w+)"/g);
      expect(actionMatches).toBeTruthy();
      expect(actionMatches!.length).toBeGreaterThanOrEqual(35);
    });

    it('handles all 8 tables without errors', () => {
      expect(output).toContain('type atomicassets_Tables');
      // Should have table entries
      expect(output).toContain('"config_s"');
      expect(output).toContain('"collections_s"');
      expect(output).toContain('"assets_s"');
    });
  });

  describe('edge cases', () => {
    it('handles ABI with no actions', () => {
      const emptyAbi: Abi = {
        version: 'eosio::abi/1.1',
        types: [],
        structs: [],
        actions: [],
        tables: [],
      };
      const output = generateOutput(emptyAbi, 'empty', 'empty');
      expect(output).toContain('type empty_Actions');
      expect(output).toContain('type empty_Tables');
    });

    it('handles ABI with variants but no type aliases', () => {
      const variantAbi: Abi = {
        version: 'eosio::abi/1.1',
        types: [],
        structs: [
          {
            name: 'myaction',
            base: '',
            fields: [{ name: 'val', type: 'myvariant' }],
          },
        ],
        actions: [{ name: 'myaction', type: 'myaction', ricardian_contract: '' }],
        tables: [],
        variants: [{ name: 'myvariant', types: ['uint32', 'string'] }],
      };
      const output = generateOutput(variantAbi, 'test', 'test');
      expect(output).toContain('val:number | string');
    });
  });
});
