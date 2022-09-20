const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");

describe("FundMe", function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
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
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.priceFeed();
      assert.equal(response, parseInt(mockV3Aggregator.address));
    });
  });
});
