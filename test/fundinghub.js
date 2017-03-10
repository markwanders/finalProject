var FundingHub = artifacts.require("./contracts/FundingHub.sol");

contract("FundingHub", function(accounts) {

    it("Should return the projected created during migration", function() {

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
                  })
                }) 
              })
            })
          })
        })
    })

// A handy tool to ensure mining is complete
// https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6

web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txnHash);
            if (receipt == null) {
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

    if (Array.isArray(txnHash)) {
        var promises = [];
        txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
        });
        return Promise.all(promises);
    } else {
        return new Promise(function (resolve, reject) {
                transactionReceiptAsync(txnHash, resolve, reject);
        });
    }
};