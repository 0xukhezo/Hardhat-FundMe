const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const contractAddress = await deployments.fixture(["all"]);
  const fundMe = await ethers.getContractAt(
    "FundMe",
    contractAddress.FundMe.address,
    deployer.address
  );
  console.log("Funding contract...");
  const txResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });

  await txResponse.wait(1);
  console.log("Funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
