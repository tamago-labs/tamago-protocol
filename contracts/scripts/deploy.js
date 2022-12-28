const hre = require("hardhat");

async function main() {

    const wait = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 20000)
        })
    }

    const Prompt = await hre.ethers.getContractFactory("Artwork")
    const Marketplace = await hre.ethers.getContractFactory("Marketplace")

    const prompt = await Prompt.deploy("0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d")
    const marketplace = await Marketplace.deploy(137, "0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d")

    console.log("Prompt deployed to:", prompt.address);
    console.log("Marketplace deployed to:", marketplace.address);

    await wait()

    await hre.run("verify:verify", {
        address: prompt.address,
        constructorArguments: ["0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d"],
    });

    await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [137, "0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d"],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
