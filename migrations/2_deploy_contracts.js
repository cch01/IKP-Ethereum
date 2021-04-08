var Greeter = artifacts.require("./Greeter.sol");
var DCPChecker= artifacts.require("./DCPChecker.sol");
var IKP = artifacts.require("./IKP.sol");
var RPReaction = artifacts.require("./RPReaction.sol");
// var BLib = artifacts.require("./BytesLib.sol");
// var X509 = artifacts.require("./X509.sol")

module.exports = async function(deployer) {
  await deployer.deploy(Greeter);
  // await deployer.deploy(BLib);
  // await deployer.link(BLib, X509);
  // await deployer.deploy(X509);
  // await deployer.link(X509, [IKP, DCPChecker]);
  await deployer.deploy(DCPChecker);
  const ikpInstance = await deployer.deploy(IKP);
  await deployer.deploy(RPReaction, ikpInstance.address);
  console.log('ikpInstance', ikpInstance);
};
