var FundingHub = artifacts.require("./contracts/FundingHub.sol");
var Project = artifacts.require("./contracts/Project.sol");

contract("FundingHub", function(accounts) {

    xit("Should return the project created during migration", function() {

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
    });

    //the required test
    it("Should allow a contributor to reclaim their contribution", function() {
        var initialBalance = web3.eth.getBalance(accounts[1]);
        console.log("Initial account balance is:", web3.fromWei(initialBalance.valueOf(), 'ether'), " ether");
        return FundingHub.deployed().then(function(hub) {
            return hub.getProjectAt(0).then(function (projectAddress) {
                return Project.at(projectAddress).then(function (project) {
                    return project.campaign().then(function (campaign) {
                        console.log("Project funding goal is: ", web3.fromWei(campaign[1].valueOf(), 'ether'), " ether");
                        return hub.contribute.sendTransaction(projectAddress, {from:accounts[1], value:web3.toWei(0.5, 'ether'), gas:2000000}).then(function(trxHash) {
                            return web3.eth.getTransactionReceiptMined(trxHash).then(function() {
                                var newBalance = web3.eth.getBalance(accounts[1]);
                                console.log("New account balance is:", web3.fromWei(newBalance.valueOf(), 'ether'));
                                var projectBalance = web3.eth.getBalance(projectAddress);
                                console.log("New project balance is:", web3.fromWei(projectBalance.valueOf(), 'ether'));
                                return project.refund.sendTransaction({from: accounts[1], gas: 2000000}).then(function() {
                                    var refundedBalance = web3.eth.getBalance(accounts[1]);
                                    console.log("Account balance after refund is:", web3.fromWei(refundedBalance.valueOf(), 'ether'));
                                    var newProjectBalance = web3.eth.getBalance(projectAddress);
                                    console.log("Project balance after refund is:", web3.fromWei(newProjectBalance.valueOf(), 'ether'));
                                    assert.isBelow((web3.fromWei(initialBalance.valueOf()) - web3.fromWei(refundedBalance.valueOf())), 0.05, "Difference between initial and refunded balance is too high");
                                    assert.equal(newProjectBalance.valueOf(), 0, "Project balance not zero after refund")
                                    //N.B.: of course, not the entire amount gets refunded, as the transactions themselves costed gas
                                })
                            })
                        })
                    })
                })
            })
        })
    });

    xit("Should return all funds to respective funders when deadline passes without reaching funding goal", function() {
        //N.B.: this test requires that the initial project created during migration has a deadline of 5 seconds
        this.timeout(10000);
        var initialBalance = web3.eth.getBalance(accounts[1]);
        console.log("Initial account balance is:", web3.fromWei(initialBalance.valueOf(), 'ether'));
        return FundingHub.deployed().then(function(hub) {
            return hub.getProjectAt(0).then(function(projectAddress) {
                return Project.at(projectAddress).then(function(project) {
                    return project.campaign().then(function(campaign) {
                        console.log("The project campaign deadline is: ", (1000 * campaign[2].valueOf() - Date.now()), " milliseconds from now");
                        assert.isAtMost(campaign[2].valueOf() - 5, Math.floor(Date.now() / 1000), "The campaign deadline is within 5 seconds from now");
                        return project.fund.sendTransaction(accounts[1], {from: accounts[1], value: web3.toWei(.7, 'ether')}).then(function(trxHash) {
                            return web3.eth.getTransactionReceiptMined(trxHash).then(function() {
                                var newBalance = web3.eth.getBalance(accounts[1]);
                                console.log("New account balance is:", web3.fromWei(newBalance.valueOf(), 'ether'));
                                var projectBalance =  web3.eth.getBalance(projectAddress);
                                console.log("New project balance is:", web3.fromWei(projectBalance.valueOf(), 'ether'));
                                //wait for the project to expire, then try to fund again
                                setTimeout(function() {
                                    return project.fund.sendTransaction(accounts[1], {from: accounts[1], value: web3.toWei(.5, 'ether')}).then(function(trxHash) {
                                        return web3.eth.getTransactionReceiptMined(trxHash).then(function() {
                                            projectBalance =  web3.eth.getBalance(projectAddress);
                                            console.log("Project balance after refund is:", web3.fromWei(projectBalance.valueOf(), 'ether'));
                                            assert.equal(projectBalance.valueOf(), 0, "The project balance is not empty");
                                            var refundedBalance = web3.eth.getBalance(accounts[1]);
                                            console.log("Account balance after refund is: ", web3.fromWei(refundedBalance.valueOf(), 'ether'));
                                            assert.isAbove(refundedBalance, newBalance, 'Refunded balance is not higher than before refund');
                                            assert.isBelow((web3.fromWei(initialBalance.valueOf()) - web3.fromWei(refundedBalance.valueOf())), 0.05, "Difference between initial and refunded balance is too high")
                                            //N.B.: of course, not the entire amount gets refunded, as the transactions themselves costed gas
                                        })
                                    })
                                }, 6000);
                            })
                        })
                    })
                })
            })
        })
    });

    xit("Should be able to create a new project", function() {

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
});

// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt === null) {
                setTimeout(function () {
                    transactionReceiptAsync(txnHash, resolve, reject);
                }, interval);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };

    return new Promise(function (resolve, reject) {
        transactionReceiptAsync(txnHash, resolve, reject);
    });
};