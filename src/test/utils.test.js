/**
 * @jest-environment node
 */

import {
  getBlocks,
  getBlockData,
  getTotalWeiTransferred,
  getTransactions,
  getTotals,
  getAddressesIsContract
} from "../utils";
import Ganache from "ganache-core";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import compile from "./compile";

describe("Testing util functions", async () => {
  let accounts;
  let web3;
  let originalAcct1Balance;
  let currentBlock;
  let transactions;
  let contractInstance;

  beforeAll(async () => {
    const provider = Ganache.provider();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();

    // compile contract artifact
    const { SimpleStorage } = await compile("SimpleStorage.sol");

    // create initial contract instance
    const instance = new web3.eth.Contract(SimpleStorage.abi);

    // deploy contract and get new deployed instance
    const deployedInstance = await instance
      .deploy({ data: SimpleStorage.evm.bytecode.object })
      .send({ from: accounts[0], gas: 150000 });

    // assign deployed contract instance to variable
    contractInstance = deployedInstance;

    // make contract transaction
    await contractInstance.methods.set(5).send({ from: accounts[0] });

    // make transfers
    originalAcct1Balance = new BigNumber(
      await web3.eth.getBalance(accounts[1])
    );
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: web3.utils.toWei("0.5", "ether")
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
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[2],
      value: web3.utils.toWei("1", "ether")
    });

    currentBlock = await web3.eth.getBlockNumber();
    const blockNums = Array.from({ length: currentBlock + 1 }, (_, i) => i);
    const blocks = await getBlocks(blockNums, web3);

    transactions = await getTransactions(blocks, web3);
  });

  test("should show that 0.5 ETH was transferred", async () => {
    const acct1Balance = new BigNumber(await web3.eth.getBalance(accounts[1]));
    console.log("acct1Balance", acct1Balance);
    expect(acct1Balance.minus(originalAcct1Balance).toString()).toEqual(
      web3.utils.toWei("0.5")
    );
  });

  test("should show that 3.5 ETH total was transferred", async () => {
    const totalWeiTransferred = getTotalWeiTransferred(transactions);
    console.log("totalWeiTransferred", totalWeiTransferred);
    expect(totalWeiTransferred).toEqual(web3.utils.toWei("3.5"));
  });

  test("should return receipient/sender addresses and the total received/sent", async () => {
    const receiverTotals = await getTotals("to", transactions);
    const senderTotals = await getTotals("from", transactions);

    const expectedReceiverTotals = {
      [accounts[1]]: web3.utils.toWei("0.5"),
      [accounts[2]]: web3.utils.toWei("3"),
      [contractInstance._address]: "0",
      null: "0",
    };

    const expectedSenderTotals = {
      [accounts[0]]: web3.utils.toWei("3.5")
    };

    expect(expectedReceiverTotals).toEqual(receiverTotals);
    expect(expectedSenderTotals).toEqual(senderTotals);
  });

  test("should return array of unique addresses and whether or not the address is a contract", async () => {
    const addressesIsContract = await getAddressesIsContract(
      transactions,
      web3
    );
    const expectedAddressesIsContract = {
      [accounts[0]]: false,
      [accounts[1]]: false,
      [accounts[2]]: false,
      [contractInstance._address]: true
    }
    console.log(addressesIsContract)
    expect(expectedAddressesIsContract).toEqual(addressesIsContract)
  });
});
