var Project = artifacts.require("./Project.sol");
var FundingHub = artifacts.require("./FundingHub.sol");

module.exports = function(deployer) {
  deployer.deploy(FundingHub).then(function() {
  	return FundingHub.deployed().then(function(instance) {
  		//1 ether and ten seconds, for easier testing of refund functionality
  		instance.createProject(1000000000000000000, 10);
  	})  
  });
};
