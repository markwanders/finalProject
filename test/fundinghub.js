var FundingHub = artifacts.require("./contracts/FundingHub.sol");
var Project = artifacts.require("./contracts/Project.sol");

contract("FundingHub", function(accounts) {

    it("Should return the project created during migration", function() {

        return FundingHub.deployed().then(function(hub) {
          // now check the count
          return hub.getProjectCount()
          .then(function(_count) {
              console.log("The Project count is", _count.valueOf());
              assert.isAbove(_count,"0x0", "The projects are empty");
              return hub.getProjectAt(0)
              .then(function(_address) {
                console.log("The Project address is", _address);
                assert.isAbove(_address,"0x0", "The address is empty");
              })
            })
        })
    })

    it("Should return an address when successfully creating a new project", function() {

        return FundingHub.deployed().then(function(hub) {
          // now check the count
          return hub.getProjectCount()
          .then(function(_count) {
              console.log("The Project count is", _count.valueOf());
              assert.isAbove(_count,"0x0", "The projects are empty");
              return hub.createProject(1, 1)
                .then(function(_address) {
                console.log("The new Project address is", _address);
                assert.isAbove(_address,"0x0", "The new address is empty");
                return hub.getProjectCount()
                .then(function(_count) {
                  console.log("The new Project count is", _count.valueOf());
                  assert.isAbove(_count,"0x1", "The new project hasn't been added");
                  return hub.getProjectAt(1)
                  .then(function(_newAddress) {
                    console.log("The new Project address in the array is", _newAddress.valueOf());
                    assert.isAbove(_newAddress,"0x0", "The new address in the array is empty");
                    return Project.at(_newAddress)
                    .then(function(projectInstance) {
                      return projectInstance.campaign()
                      .then(function(campaign) {
                        console.log("The new project campaign is ", campaign);
                        assert.equal(campaign[1].valueOf(), 1, "The new campaign amount is not 1")
                      })
                    })
                  })
                }) 
              })
            })
          })
        })
    })