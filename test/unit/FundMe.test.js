const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChain } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer, mockV3Aggregator;
      // const sendValue = "10000000000000000000";
      const sendValue1 = ethers.utils.parseEther("0.025");
      const sendValue2 = ethers.utils.parseEther("0.032");

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async () => {
        it("set the aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
          //   await expect(fundMe.fund()).to.be.revertedWith("Didn't send Enough");
          await expect(fundMe.fund()).to.be.reverted;
        });
        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue1 });

          const response = await fundMe.getAddressToAmountFunded(deployer);
          //   console.log("Hi", response.toString(), sendValue1.toString());
          assert.equal(response.toString(), sendValue1.toString());
        });
        it("Adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue1 });
          const response = await fundMe.getFunder(0);
          assert.equal(response, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue1 });
          await fundMe.fund({ value: sendValue2 });
        });
        it("withdraw ETH from a single founder", async () => {
          //   console.log("FundMe Contract Address", fundMe.address);
          //   console.log("FundMe Owner", await fundMe.getOwner());

          // arrange
          const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Starting Balance ",
          //     "Contract Balance",
          //     startingFundBalance.toString(),
          //     " Deployer Balance ",
          //     startingDeployerBalance.toString()
          //   );
          // act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // assert

          const endingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Ending Balance ",
          //     "Contract Balance",
          //     endingFundBalance.toString(),
          //     " Deployer Balance ",
          //     endingDeployerBalance.toString(),
          //     "gasCost",
          //     gasCost.toString(),
          //     startingFundBalance.add(startingDeployerBalance).toString(),
          //     endingDeployerBalance.add(gasCost).toString()
          //   );

          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("cheaper withdraw ETH from a single founder", async () => {
          //   console.log("FundMe Contract Address", fundMe.address);
          //   console.log("FundMe Owner", await fundMe.getOwner());

          // arrange
          const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Starting Balance ",
          //     "Contract Balance",
          //     startingFundBalance.toString(),
          //     " Deployer Balance ",
          //     startingDeployerBalance.toString()
          //   );
          // act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // assert

          const endingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Ending Balance ",
          //     "Contract Balance",
          //     endingFundBalance.toString(),
          //     " Deployer Balance ",
          //     endingDeployerBalance.toString(),
          //     "gasCost",
          //     gasCost.toString(),
          //     startingFundBalance.add(startingDeployerBalance).toString(),
          //     endingDeployerBalance.add(gasCost).toString()
          //   );

          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("allow us to withdraw with multiple funders", async () => {
          // arrange
          const accounts = await ethers.getSigners();
          for (let index = 1; index < 16; index++) {
            const fundMeConnectedContract = await fundMe.connect(
              accounts[index]
            );
            await fundMeConnectedContract.fund({
              value: ethers.utils.parseEther((Math.random() * 1).toString()),
            });
          }
          //   for (let index = 1; index < 16; index++) {
          //     const initialAmt = await fundMe.getAddressToAmountFunded(accounts[index].address);
          //     console.log(`Account ${accounts[index].address} : ${ethers.utils.formatEther(initialAmt)}`);
          //   }

          const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Starting Balance ",
          //     "Contract Balance",
          //     startingFundBalance.toString(),
          //     " Deployer Balance ",
          //     startingDeployerBalance.toString()
          //   );

          //Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // assert
          const endingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Ending Balance ",
          //     "Contract Balance",
          //     endingFundBalance.toString(),
          //     " Deployer Balance ",
          //     endingDeployerBalance.toString(),
          //     "gasCost",
          //     gasCost.toString(),
          //     startingFundBalance.add(startingDeployerBalance).toString(),
          //     endingDeployerBalance.add(gasCost).toString()
          //   );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.rejected;
          for (let index = 1; index < 16; index++) {
            const updatedAmt = await fundMe.getAddressToAmountFunded(
              accounts[index].address
            );
            // console.log(`Account ${accounts[index].address} : ${ethers.utils.formatEther(updatedAmt)}`);
            assert.equal(updatedAmt, 0);
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          //   await expect(attackerConnectedContract.withdraw()).to.be.reverted;
          //   await attackerConnectedContract.withdraw();
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
          //    ("FundMe__NotOwner");
        });
        it("allow us to cheaper withdraw with multiple funders", async () => {
          // arrange
          const accounts = await ethers.getSigners();
          for (let index = 1; index < 16; index++) {
            const fundMeConnectedContract = await fundMe.connect(
              accounts[index]
            );
            await fundMeConnectedContract.fund({
              value: ethers.utils.parseEther((Math.random() * 1).toString()),
            });
          }
          //   for (let index = 1; index < 16; index++) {
          //     const initialAmt = await fundMe.getAddressToAmountFunded(accounts[index].address);
          //     console.log(`Account ${accounts[index].address} : ${ethers.utils.formatEther(initialAmt)}`);
          //   }

          const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Starting Balance ",
          //     "Contract Balance",
          //     startingFundBalance.toString(),
          //     " Deployer Balance ",
          //     startingDeployerBalance.toString()
          //   );

          //Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // assert
          const endingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   console.log(
          //     "Ending Balance ",
          //     "Contract Balance",
          //     endingFundBalance.toString(),
          //     " Deployer Balance ",
          //     endingDeployerBalance.toString(),
          //     "gasCost",
          //     gasCost.toString(),
          //     startingFundBalance.add(startingDeployerBalance).toString(),
          //     endingDeployerBalance.add(gasCost).toString()
          //   );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.rejected;
          for (let index = 1; index < 16; index++) {
            const updatedAmt = await fundMe.getAddressToAmountFunded(
              accounts[index].address
            );
            // console.log(`Account ${accounts[index].address} : ${ethers.utils.formatEther(updatedAmt)}`);
            assert.equal(updatedAmt, 0);
          }
        });
      });
    });
