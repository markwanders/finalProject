var Project = artifacts.require("./Project.sol");
var FundingHub = artifacts.require("./FundingHub.sol");

module.exports = function(deployer) {
  deployer.then(function() {
  	return FundingHub.new();
  }).then(function(instance) {
  	return instance.createProject(100, 10);
  });
};
