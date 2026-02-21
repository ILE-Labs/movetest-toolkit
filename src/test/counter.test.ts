import "dotenv/config";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { movetest } from "../movetest";
import { execSync } from "child_process";

describe("MyCounter", () => {
  it("increments value on-chain", async () => {
  
    const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: "http://127.0.0.1:8080/v1",
        faucet: "http://127.0.0.1:8081",
    });
    const aptos = new Aptos(config);

    const { account } = await movetest.createFundedAccount(aptos);
    const addr = account.accountAddress.toString();


    execSync(
      `aptos move compile --package-dir ./move --named-addresses my_counter=${addr} --save-metadata`,
      { stdio: "inherit" }
    );

    await movetest.publishModule({
      aptos,
      account,
      metadataPath: "./move/build/MyCounter/package-metadata.bcs",
      modulePath: "./move/build/MyCounter/bytecode_modules/my_counter.mv",
    });

    await movetest.callEntryFunction({
      aptos,
      account,
      func: `${addr}::my_counter::init_counter`,
    });

    await movetest.callEntryFunction({
      aptos,
      account,
      func: `${addr}::my_counter::increment`,
    });

    const value = await movetest.readCounterValue(aptos, addr);

    expect(value).toBe(1);
  });
});