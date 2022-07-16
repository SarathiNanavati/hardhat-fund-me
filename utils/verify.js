const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verifying contract... : ", contractAddress);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    console.log("Verifying contract failed...", JSON.stringify(error));
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log(error);
    }
  }
}

module.exports = { verify };
