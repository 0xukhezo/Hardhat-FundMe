const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther("1"); // 1 ETH

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        const contractAddress = await deployments.fixture(["all"]);
        fundMe = await ethers.getContractAt(
          "FundMe",
          contractAddress.FundMe.address,
          deployer.address
        );
      });

      describe("fund", function () {
        it("Test 01 - allows people to fund and withdraw", async () => {
          await fundMe.fund({ value: sendValue });
          await fundMe.withdraw();
          const endingBalance = await fundMe.provider.getBalance(
            contractAddress.FundMe.address
          );
          assert.equal(endingBalance.toString(), "0");
        });
      });
    });
