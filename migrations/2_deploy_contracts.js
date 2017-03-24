var Project = artifacts.require("./Project.sol");
var FundingHub = artifacts.require("./FundingHub.sol");

module.exports = function(deployer) {
    deployer.deploy(FundingHub).then(function() {
        return FundingHub.deployed().then(function(instance) {
            //In Truffle, create a migration script that calls the createProject function after FundingHub has been deployed.
            //1 ether and 5 minutes
            instance.createProject(1000000000000000000, 5 * 60);
        })
    });
};
