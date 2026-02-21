import {
  Aptos,
  Account,
} from "@aptos-labs/ts-sdk";
import fs from "fs";

export const movetest = {
  async createFundedAccount(aptos: Aptos) {
    const account = Account.generate();

    await aptos.fundAccount({
      accountAddress: account.accountAddress,
      amount: 100_000_000,
    });

    return { account };
  },

  async publishModule({
    aptos,
    account,
    metadataPath,
    modulePath,
  }: {
    aptos: Aptos;
    account: Account;
    metadataPath: string;
    modulePath: string;
  }) {
    const metadataBytes = fs.readFileSync(metadataPath);
    const moduleBytes = fs.readFileSync(modulePath);

    const transaction = await aptos.publishPackageTransaction({
      account: account.accountAddress,
      metadataBytes,
      moduleBytecode: [moduleBytes],
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  },

  async callEntryFunction({
    aptos,
    account,
    func,
  }: {
    aptos: Aptos;
    account: Account;
    func: `${string}::${string}::${string}`;
  }) {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: func,
        functionArguments: [],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    return aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  },

  async readCounterValue(aptos: Aptos, address: string) {
    type CounterResource = { value: string };
    
    const resource = await aptos.getAccountResource<CounterResource>({
      accountAddress: address,
      resourceType: `${address}::counter::Counter`, 
    });

    return parseInt(resource.value, 10);
  },
};