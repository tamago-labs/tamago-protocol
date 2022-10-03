const hre = require("hardhat");

async function main() {

    const wait = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 20000)
        })
    }

    const Paymaster = await hre.ethers.getContractFactory("Paymaster")

    const paymaster = await Paymaster.deploy("0x1EDEc4992FF273c6f14ab720EF46c6Ea7CB1240a")

    console.log("Paymaster deployed to:", paymaster.address);

    await paymaster.setRelayHub("0x6C28AfC105e65782D9Ea6F2cA68df84C9e7d750d")
    await paymaster.setTrustedForwarder("0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d")
    await paymaster.setTarget("0xea06f999Efb940BcEd3bB3b25C6fafD96D6eb869")


    await wait()

    await hre.run("verify:verify", {
        address: paymaster.address,
        constructorArguments: ["0x1EDEc4992FF273c6f14ab720EF46c6Ea7CB1240a"],
    });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
