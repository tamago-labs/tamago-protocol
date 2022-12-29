const hre = require("hardhat");

async function main() {

    const wait = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 20000)
        })
    }

    const Novel = await hre.ethers.getContractFactory("Novel")

    const novel = await Novel.deploy(
        "0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d",
        "0x1EDEc4992FF273c6f14ab720EF46c6Ea7CB1240a"
    )

    console.log("Novel deployed to:", novel.address);

    await wait()

    await hre.run("verify:verify", {
        address: novel.address,
        constructorArguments: ["0xdA78a11FD57aF7be2eDD804840eA7f4c2A38801d", "0x1EDEc4992FF273c6f14ab720EF46c6Ea7CB1240a"],
    });

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});