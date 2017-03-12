// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import fundinghub_artifacts from '../../build/contracts/FundingHub.json'
import project_artifacts from '../../build/contracts/Project.json'

// FundingHub is our usable abstraction, which we'll use through the code below.
var FundingHub = contract(fundinghub_artifacts);
var Project = contract(project_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the FundingHub abstraction for Use.
    FundingHub.setProvider(web3.currentProvider);
    Project.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.fetchProjects();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  fetchProjects: function() {
    var self = this;
    var results = [];
    var hub;
    FundingHub.deployed().then(function(instance) {
      hub = instance;
      hub.getProjectCount().then(function(count) {
        if(count.valueOf() > 0) {
          for (var i = 0; i < count.valueOf(); i++) {
            hub.getProjectAt(i).
              then(function(result) {
                results.push(result);
              }).then(function() {
                var projects_element = document.getElementById("projects");
                projects_element.innerHTML = results[0] || 'None';
              }).catch(function(e) {
                console.log(e);
                self.setStatus("Error getting projects; see log.");
              });
          }
        }
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting projects; see log.");
    })
  });
  
  },

  getDetails: function() {
    var address = document.getElementById("projects").innerHTML;
    var proj;
    var project = Project(address);
    Project.deployed().then(function(instance) {
      proj = instance;
      project.campaign().then(function(result) {
        console.log(result);
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error getting project details; see log.");
      });
    });
  },

  createProject: function() {
    var hub;

    FundingHub.deployed().then(function(instance) {
      hub = instance;
      var totalAmount = document.getElementById("totalAmount").value; 
      var deadline = document.getElementById("deadline").value; 
      return hub.createProject.sendTransaction(totalAmount, deadline, {from: account, gas: 2000000})
      .then(function(value) {
        var projectAddress_element = document.getElementById("projectAddress");
        projectAddress_element.innerHTML = value.valueOf();
      })
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error creating project; see log.");
    });
  }

  // sendCoin: function() {
  //   var self = this;

  //   var amount = parseInt(document.getElementById("amount").value);
  //   var receiver = document.getElementById("receiver").value;

  //   this.setStatus("Initiating transaction... (please wait)");

  //   var meta;
  //   MetaCoin.deployed().then(function(instance) {
  //     meta = instance;
  //     return meta.sendCoin(receiver, amount, {from: account});
  //   }).then(function() {
  //     self.setStatus("Transaction complete!");
  //     self.refreshBalance();
  //   }).catch(function(e) {
  //     console.log(e);
  //     self.setStatus("Error sending coin; see log.");
  //   });
  // }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
