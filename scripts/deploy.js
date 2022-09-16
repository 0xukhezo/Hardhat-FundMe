const { ethers, run, network } = require("hardhat");

const main = async () => {
  const fundMeFactory = await ethers.getContractFactory("FundMe");

  console.log("Deploying contract...");

  const fundMe = await fundMeFactory.deploy();
  await fundMe.deployed();

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API) {
    await fundMe.deployTransaction.wait(6);
    await verify(fundMe.address, []);
  }
};

const verify = async (contractAddress, args) => {
  console.log("Verifying the contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(error);
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
