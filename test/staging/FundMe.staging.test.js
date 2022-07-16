const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer;
      //   const sendValue = ethers.utils.parseEther((Math.random() * 0.1).toString());
      const sendValue = ethers.utils.parseEther("0.05");
      console.log(ethers.utils.formatEther(sendValue));
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allow people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        const transactionResponse = await fundMe.withdraw();
        const transactionReceipt = await transactionResponse.wait(1);
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
