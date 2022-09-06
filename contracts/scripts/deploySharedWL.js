const hre = require("hardhat");

async function main() {

    const wait = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 10000)
        })
    }

    const Ticket = await hre.ethers.getContractFactory("Ticket")

    const ticket = await Ticket.deploy()

    console.log("ticket deployed to:", ticket.address);

    await wait()

    await hre.run("verify:verify", {
        address: ticket.address,
        constructorArguments: [],
      });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  