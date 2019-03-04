/**
 * @jest-environment node
 */

import {
  getBlocks,
  getBlockData,
  getTotalWeiTransferred,
  getTransactions,
  getTotals,
  getAddressesIsContract,
  getPctContract,
  getNumUncles,
  getNumAddresses,
  getNumContracts,
  getNumEvents
} from "../utils";
import Ganache from "ganache-core";
const getWeb3 = require("@drizzle-utils/get-web3")
const createDrizzleUtils = require("@drizzle-utils/core")
const getContractInstance = require("@drizzle-utils/get-contract-instance")
import BigNumber from "bignumber.js";
import compile from "./compile";

describe("Testing util functions", async () => {
  let web3;
  let accounts;
  let blocks;
  let originalAcct1Balance;
  let currentBlock;
  let transactions;
  let contractInstance;
  let receiverTotals;
  let senderTotals;
  let addressesIsContract;

  beforeAll(async () => {
    const provider = Ganache.provider();

    // initialize the tooling
    web3 = await getWeb3({customProvider: provider});
    const drizzleUtils = await createDrizzleUtils({ web3 })
    accounts = await drizzleUtils.getAccounts()
    console.log("accounts", accounts)
    
    // compile contract artifact
    const { SimpleStorage } = await compile("SimpleStorage.sol");

    console.log(SimpleStorage)
    // `instance` is a web3 Contract instance of the deployed contract
    const instance = await getContractInstance({
      web3,
      abi: SimpleStorage.abi
    })

    // deploy contract and get new deployed instance
    const deployedInstance = await instance
      .deploy({ data: SimpleStorage.evm.bytecode.object })
      .send({ from: accounts[0], gas: 150000 });

    console.log("deployed Instance",)

    // assign deployed contract instance to variable
    contractInstance = deployedInstance;

    // store original balance for testing
    originalAcct1Balance = new BigNumber(
      await web3.eth.getBalance(accounts[1])
    );

    // make contract transaction
    await contractInstance.methods.set(5).send({ from: accounts[0] });
    // make transfers
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
    blocks = await getBlocks(blockNums, web3);
    transactions = await getTransactions(blocks, web3);
  });

  // afterAll(async () => {
  //   // clean up provider
  //   provider.stop();
  // });

  test("should show that 0.5 ETH was transferred to accounts[1]", async () => {
    const acct1Balance = new BigNumber(await web3.eth.getBalance(accounts[1]));
    console.log(acct1Balance)
    expect(acct1Balance.minus(originalAcct1Balance).toString()).toEqual(
      web3.utils.toWei("0.5")
    );
  });

  test("should show that 3.5 ETH total was transferred", async () => {
    const totalWeiTransferred = getTotalWeiTransferred(transactions);
    expect(totalWeiTransferred).toEqual(web3.utils.toWei("3.5"));
  });

  test("should return receipient/sender addresses and the total received/sent", async () => {
    receiverTotals = await getTotals("to", transactions);
    senderTotals = await getTotals("from", transactions);

    const expectedReceiverTotals = {
      [accounts[1]]: web3.utils.toWei("0.5"),
      [accounts[2]]: web3.utils.toWei("3"),
      [contractInstance._address]: "0",
      null: "0"
    };

    const expectedSenderTotals = {
      [accounts[0]]: web3.utils.toWei("3.5")
    };

    expect(receiverTotals).toEqual(expectedReceiverTotals);
    expect(senderTotals).toEqual(expectedSenderTotals);
  });

  test("should return array of unique addresses and whether or not the address is a contract", async () => {
    addressesIsContract = await getAddressesIsContract(transactions, web3);
    const expectedAddressesIsContract = {
      [accounts[0]]: false,
      [accounts[1]]: false,
      [accounts[2]]: false,
      [contractInstance._address]: true
    };
    expect(addressesIsContract).toEqual(expectedAddressesIsContract);
  });

  test("should return proper percentage of total transactions being contract transactions", async () => {
    const pctContract = getPctContract(transactions, addressesIsContract);

    expect(pctContract).toEqual((1 / 6) * 100);
  });

  test("should return proper number of uncles", () => {
    const numUncles = getNumUncles(blocks);
    expect(numUncles).toEqual(0);
  });

  test("should return proper number of receiving/sending addresses", () => {
    const numReceivers = getNumAddresses(receiverTotals);
    const numSenders = getNumAddresses(senderTotals);
    expect(numReceivers).toEqual(3);
    expect(numSenders).toEqual(1);
  });

  test("should return proper number of created contracts", () => {
    const numContracts = getNumContracts(transactions);
    expect(numContracts).toEqual(1);
  });

  test("should return proper number of emitted events", async () => {
    const numEvents = await getNumEvents(transactions, web3);
    expect(numEvents).toEqual(1);
  });
});
