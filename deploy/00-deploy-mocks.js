const { network } = require("hardhat");
const {
  deploymentNetworks,
  DECIMALS,
  INICIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (deploymentNetworks.includes(network.name)) {
    log("Local network detected! Deployment mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INICIAL_ANSWER],
    });
    log("Deployed mocks...");
    log("--------------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
