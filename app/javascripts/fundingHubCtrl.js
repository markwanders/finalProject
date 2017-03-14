// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import fundinghub_artifacts from '../../build/contracts/FundingHub.json'
import project_artifacts from '../../build/contracts/Project.json'

// FundingHub is our usable abstraction, which we'll use through the code below.
var FundingHub = contract(fundinghub_artifacts);
var Project = contract(project_artifacts);

var app = angular.module('fundingHubApp', []);

app.controller("fundingHubCtrl", [ '$scope', '$window', '$timeout', function($scope, $window, $timeout) {

	$scope.accounts = [];
	$scope.account;
	$scope.projects = [];
	$scope.totalAmount = 95;
	$scope.deadline = 95;

	$scope.fetchProjects = function() {
		var hub;
		FundingHub.deployed().then(function(instance) {
			hub = instance;
			hub.getProjectCount().then(function(count) {
				if(count.valueOf() > 0) {
					$scope.projects = [];
					for (var i = 0; i < count.valueOf(); i++) {
						hub.getProjectAt(i).
						then(function(result) {
							$timeout(function() {
								$scope.projects.push(result);								
							})
						});
					}
				}
			})
			.catch(function(e) {
				console.log(e);
				$scope.setStatus("Error getting projects; see log.");
			})
		});
	}

	$scope.getDetails = function(index) {
		var address = $scope.projects[index];
		Project.at(address)
		.then(function(project) {
			$timeout(function() {
				return web3.eth.getBalance(address, function(error, result) {
		  			if(!error) {
		        		$scope.projectBalance = result.valueOf()
		  			} else {
		        		$scope.setStatus(error)
		    		}
	    		});
  			});
			project.campaign().then(function(result) {
				$timeout(function() {
					$scope.projectAddress = address;
					$scope.projectOwner = result[0];
					$scope.projectAmount = result[1].valueOf();
					$scope.projectDeadline = result[2].valueOf();
					$scope.showDetails = true;  
				})  
			})
		})
		.catch(function(e) {
			console.log(e);
			$scope.setStatus("Error getting project details; see log.");
		});
	}

	$scope.createProject = function() {
	    var hub;

	    FundingHub.deployed().then(function(instance) {
	      hub = instance;
	      return hub.createProject.sendTransaction($scope.totalAmount, $scope.deadline, {from: $scope.account, gas: 2000000})
	      .then(function(value) {
	        $scope.receipt = value.valueOf();
	      })
	    }).catch(function(e) {
	      console.log(e);
	      $scope.setStatus("Error creating project; see log.");
	    });
	}

	$scope.contribute = function() {
		if($scope.contribution !== 0) {
			FundingHub.deployed().then(function(hub) {
				return hub.contribute.sendTransaction($scope.projectAddress, {from: $scope.account, value:web3.toWei($scope.contribution, 'ether')})
				.then(function(trxHash) {
					console.log(trxHash);
				})
			});
		}
	}

	$window.onload = function () {
		if (typeof web3 !== 'undefined') {
    		console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    		// Use Mist/MetaMask's provider
    		window.web3 = new Web3(web3.currentProvider);
  		} else {
    		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  		}

		FundingHub.setProvider(web3.currentProvider);
		Project.setProvider(web3.currentProvider);

		web3.eth.getAccounts(function(err, accs) {
			if (err != null) {
				alert("There was an error fetching your accounts.");
				return;
			}

			if (accs.length == 0) {
				alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
				return;
			}

			$scope.accounts = accs;
			$scope.account = $scope.accounts[0];

			$timeout(function() {
				return web3.eth.getBalance($scope.account, function(error, result) {
		  			if(!error) {
		        		$scope.accountBalance = result.valueOf()
		  			}
		    		else {
		        		$scope.setStatus(error)
		    		}
	    		});
  			});

			$scope.fetchProjects();
		})
	}

	$scope.setStatus = function(message) {
		$scope.status = message;
  	}

}]);
