import { getBlockData } from "./utils"
import Ganache from "ganache-core";
import Web3 from "web3";
import BigNumber from "bignumber.js";


describe("Testing util functions", async () => {
  let accounts;
  let web3;
  let originalAcct1Balance

  beforeAll(async () => {

    const provider = Ganache.provider();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();

    originalAcct1Balance = new BigNumber(await web3.eth.getBalance(accounts[1]))
    await web3.eth.sendTransaction({from: accounts[0], to: accounts[1], value: web3.utils.toWei("0.5", "ether")})

  })

  test("should show that 0.5 ETH was transferred", async () => {
    // const acct0Balance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const acct1Balance = new BigNumber(await web3.eth.getBalance(accounts[1])) 
    console.log(acct1Balance)
    expect(acct1Balance.minus(originalAcct1Balance).toString()).toEqual(web3.utils.toWei(("0.5")))
  })
})