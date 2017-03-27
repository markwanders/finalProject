var FundingHub = artifacts.require("./contracts/FundingHub.sol");
var Project = artifacts.require("./contracts/Project.sol");

contract("FundingHub", function(accounts) {

    //the required test
    it("Should allow a contributor to reclaim their contribution", function () {
        var initialBalance = web3.eth.getBalance(accounts[1]);
        console.log("Initial account balance is:", web3.fromWei(initialBalance.valueOf(), 'ether'), " ether");
        return FundingHub.deployed().then(function (hub) {
            return hub.getProjectAt(0).then(function (projectAddress) {
                return Project.at(projectAddress).then(function (project) {
                    return project.campaign().then(function (campaign) {
                        console.log("Project funding goal is: ", web3.fromWei(campaign[1].valueOf(), 'ether'), " ether");
                        return hub.contribute.sendTransaction(projectAddress, {
                            from: accounts[1],
                            value: web3.toWei(0.5, 'ether'),
                            gas: 2000000
                        }).then(function (trxHash) {
                            return web3.eth.getTransactionReceiptMined(trxHash).then(function () {
                                var newBalance = web3.eth.getBalance(accounts[1]);
                                console.log("New account balance is:", web3.fromWei(newBalance.valueOf(), 'ether'));
                                var projectBalance = web3.eth.getBalance(projectAddress);
                                console.log("New project balance is:", web3.fromWei(projectBalance.valueOf(), 'ether'));
                                return project.refund.sendTransaction({
                                    from: accounts[1],
                                    gas: 2000000
                                }).then(function () {
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