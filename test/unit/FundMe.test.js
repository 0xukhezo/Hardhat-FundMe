const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1"); // 1 ETH

  beforeEach(async () => {
    // const accounts = await ethers.getSigners()
    // deployer = accounts[0]
    deployer = (await getNamedAccounts()).deployer;
    const contractAddress = await deployments.fixture(["all"]);
    mockV3Aggregator = await ethers.getContractAt(
      "MockV3Aggregator",
      contractAddress.MockV3Aggregator.address,
      deployer.address
    );
    fundMe = await ethers.getContractAt(
      "FundMe",
      contractAddress.FundMe.address,
      deployer.address
    );
  });

  describe("constructor", function () {
    it("Test 01 - sets the aggregator addresses correctly", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, parseInt(mockV3Aggregator.address));
    });
  });

  describe("fund", function () {
    it("Test 02 - fails if you dont send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough!");
    });
    it("Test 03 - updated the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("Test 04 - add funders to funders array", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.funders(0);
      4;
      assert.equal(response, deployer);
    });
  });

  describe("withdraw", function () {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("Test 05 - withdraw ETH from a single founder", async () => {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      const txResponse = await fundMe.withdraw();
      const txReceipt = await txResponse.wait(1);

      const { gasUsed, effectiveGasPrice } = txReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingDeployerBalance.add(startingFundMeBalance).toString()
      );
    });

    it("Test 06 - withdraw ETH from a multiple founders", async () => {
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContractAccounts = await fundMe.connect(
          accounts[i]
        );
        await fundMeConnectedContractAccounts.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      const txResponse = await fundMe.withdraw();
      const txReceipt = await txResponse.wait(1);

      const { gasUsed, effectiveGasPrice } = txReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        endingDeployerBalance.add(gasCost).toString(),
        startingDeployerBalance.add(startingFundMeBalance).toString()
      );
      await expect(fundMe.funders(0)).to.be.reverted;
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
    it("Test 07 - only allows the owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];

      const attackerConectedContract = await fundMe.connect(attacker);

      await expect(attackerConectedContract.withdraw()).to.be.reverted;
    });
  });
});
