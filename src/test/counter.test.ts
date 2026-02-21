import "dotenv/config";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { movetest } from "../movetest";
import { execSync } from "child_process";
import fs from "fs";

describe("MyCounter", () => {
  afterAll(() => {
    fs.rmSync("./move/build", { recursive: true, force: true });
  });

  it("increments value on-chain", async () => {
    const config = new AptosConfig({
      network: Network.DEVNET, 
    });
    const aptos = new Aptos(config);

    const { account } = await movetest.createFundedAccount(aptos);
    const addr = account.accountAddress.toString();


    execSync(
      `aptos move compile --package-dir ./move --named-addresses Counter=${addr} --save-metadata`,
      { stdio: "inherit" }
    );

    
    await movetest.publishModule({
      aptos,
      account,
      
      metadataPath: "./move/build/Counter/package-metadata.bcs",
      modulePath: "./move/build/Counter/bytecode_modules/counter.mv", 
    });

    await movetest.callEntryFunction({
      aptos,
      account,
      func: `${addr}::counter::init_counter`, 
    });

    await movetest.callEntryFunction({
      aptos,
      account,
      func: `${addr}::counter::increment`,
    });

    const value = await movetest.readCounterValue(aptos, addr);

    expect(value).toBe(1);
  }, 60000); 
});