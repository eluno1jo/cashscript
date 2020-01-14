import * as path from 'path';
import { Contract, Instance, Sig } from '../../src';
import {
  alicePk,
  alice,
} from '../fixture/vars';
import { getTxOutputs } from '../test-util';
import { FailedTransactionError } from '../../src/Errors';

describe('BoundedBytes', () => {
  let bbInstance: Instance;
  beforeAll(() => {
    const BoundedBytes = Contract.import(path.join(__dirname, '..', 'fixture', 'bounded_bytes.json'), 'testnet');
    bbInstance = BoundedBytes.new();
  });

  describe('send (to one)', () => {
    it('should fail when using incorrect function parameters', async () => {
      // given
      const to = bbInstance.address;
      const amount = 10000;

      // then
      const expectPromise = expect(
        bbInstance.functions
          .spend(Buffer.from('12345678', 'hex'), 1000)
          .send(to, amount),
      );
      expectPromise.rejects.toThrow(FailedTransactionError);
      expectPromise.rejects.toThrow('Script evaluated without error but finished with a false/empty top stack element');

      // then
      const expectPromise2 = expect(
        bbInstance.functions
          .spend(Buffer.from('000003e8', 'hex'), 1000)
          .send(to, amount),
      );
      await expectPromise2.rejects.toThrow(FailedTransactionError);
      await expectPromise2.rejects.toThrow('Script evaluated without error but finished with a false/empty top stack element');
    });

    it('should succeed when using correct function parameters', async () => {
      // given
      const to = bbInstance.address;
      const amount = 10000;

      // when
      const tx = await bbInstance.functions
        .spend(Buffer.from('e8030000', 'hex'), 1000)
        .send(to, amount);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});

describe('Simple Covenant', () => {
  let covenant: Instance;
  beforeAll(() => {
    const Covenant = Contract.import(path.join(__dirname, '..', 'fixture', 'simple_covenant.json'), 'testnet');
    covenant = Covenant.new();
  });

  describe('send', () => {
    it('should succeed', async () => {
      // given
      const to = covenant.address;
      const amount = 1000;

      // when
      const tx = await covenant.functions
        .spend(alicePk, new Sig(alice))
        .send(to, amount);

      // then
      const txOutputs = getTxOutputs(tx);
      expect(txOutputs).toEqual(expect.arrayContaining([{ to, amount }]));
    });
  });
});
