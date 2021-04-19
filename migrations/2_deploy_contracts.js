var DCPChecker= artifacts.require("./DCPChecker.sol");
var IKP = artifacts.require("./IKP.sol");
var RPReaction = artifacts.require("./RPReaction.sol");

module.exports = async function(deployer) {
  await deployer.deploy(DCPChecker);
  const ikpInstance = await deployer.deploy(IKP);
  await deployer.deploy(RPReaction, ikpInstance.address);
};
