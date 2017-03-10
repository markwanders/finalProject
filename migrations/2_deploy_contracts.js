var Project = artifacts.require("./Project.sol");
var FundingHub = artifacts.require("./FundingHub.sol");

module.exports = function(deployer) {
  deployer.deploy(FundingHub).then(function() {
  	return FundingHub.deployed().then(function(instance) {
  		instance.createProject(10, 10);
  	})  
  });
  // deployer.link(Project, FundingHub);
  // deployer.deploy(Project, 10, 10);
};
