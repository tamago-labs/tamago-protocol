// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  
  const chainId = 42; // change here

  const Marketplace = await hre.ethers.getContractFactory("Marketplace")
  const Gateway = await hre.ethers.getContractFactory("Gateway")

  const marketplace = await Marketplace.deploy(chainId);
  const gateway = await Gateway.deploy(chainId);

  await marketplace.deployed();
  await gateway.deployed()

  console.log("marketplace deployed to:", marketplace.address);
  console.log("gateway deployed to:", gateway.address);

  await hre.run("verify:verify", {
    address: marketplace.address,
    constructorArguments: [
      chainId
    ],
  });

  await hre.run("verify:verify", {
    address: gateway.address,
    constructorArguments: [
      chainId
    ],
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
