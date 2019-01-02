/**
 * @jest-environment node
 */

import { getBlockData, getTotalWeiTransferred, getTransactions } from "./utils";
import Ganache from "ganache-core";
import Web3 from "web3";
import BigNumber from "bignumber.js";

describe("Testing util functions", async () => {
  let accounts;
  let web3;
  let originalAcct1Balance;
  let currentBlock;
  let transactions;

  beforeAll(async () => {
    const provider = Ganache.provider();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();

    originalAcct1Balance = new BigNumber(
      await web3.eth.getBalance(accounts[1])
    );
    const res = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: web3.utils.toWei("0.5", "ether")
    });

    console.log("res", res);

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[2],
      value: web3.utils.toWei("1", "ether")
    });
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[2],
      value: web3.utils.toWei("1", "ether")
    });
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[2],
      value: web3.utils.toWei("1", "ether")
    });

    currentBlock = await web3.eth.getBlockNumber();
    console.log("current block", currentBlock);
    console.log("accounts", accounts);

    transactions = await getTransactions(
      Array.from({ length: currentBlock + 1 }, (_, i) => i),
      web3
    );
    console.log("transactions", transactions);
  });

  test("should show that 0.5 ETH was transferred", async () => {
    const acct1Balance = new BigNumber(await web3.eth.getBalance(accounts[1]));
    console.log("acct1Balance", acct1Balance);
    expect(acct1Balance.minus(originalAcct1Balance).toString()).toEqual(
      web3.utils.toWei("0.5")
    );
  });

  test("should show that 1.5 ETH total was transferred", async () => {
    const totalWeiTransferred = getTotalWeiTransferred(transactions);
    console.log(totalWeiTransferred);
    expect(totalWeiTransferred).toEqual(web3.utils.toWei("3.5"));
  });
});
