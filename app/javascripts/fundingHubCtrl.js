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
    $scope.account = null;
    $scope.projects = [];
    $scope.totalAmount = 10;
    $scope.deadline = 600;

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
        }).catch(function(e) {
            console.log(e);
            $scope.setStatus("Error getting projects; see log.");
        });
    };

    $scope.getDetails = function(index) {
        var address = $scope.projects[index];
        $scope.selectedProject = index;
        Project.at(address)
            .then(function(project) {
                $timeout(function() {
                    return web3.eth.getBalance(address, function(error, result) {
                        if(!error) {
                            $scope.projectBalance = web3.fromWei(result.valueOf(), 'ether')
                        } else {
                            $scope.setStatus(error)
                        }
                    });
                });
                project.campaign().then(function(result) {
                    $timeout(function() {
                        $scope.projectAddress = address;
                        $scope.projectOwner = result[0];
                        $scope.projectAmount = web3.fromWei(result[1].valueOf(), 'ether');
                        $scope.projectDeadline = timeConverter(result[2].valueOf());
                        $scope.showDetails = true;
                        $scope.deadlinePassed = (result[2].valueOf() <= Math.floor(Date.now() / 1000));
                    })
                })
            })
            .catch(function(e) {
                console.log(e);
                $scope.setStatus("Error getting project details; see log.");
            });
    };

    $scope.createProject = function() {
        var hub;

        FundingHub.deployed().then(function(instance) {
            hub = instance;
            return hub.createProject.sendTransaction(web3.toWei($scope.totalAmount, 'ether'), $scope.deadline, {from: $scope.account, gas: 2000000})
                .then(function(value) {
                    $timeout(function() {
                        $scope.receipt = value.valueOf();
                        $scope.fetchProjects();
                    });
                })
        }).catch(function(e) {
            console.log(e);
            $scope.setStatus("Error creating project; see log.");
        });
    };

    $scope.contribute = function() {
        if($scope.contribution !== 0) {
            FundingHub.deployed().then(function(hub) {
                return hub.contribute.sendTransaction($scope.projectAddress, {from: $scope.account, value:web3.toWei($scope.contribution, 'ether'), gas: 2000000})
                    .then(function() {
                        //refresh balance and project
                        $scope.getDetails($scope.selectedProject);
                        $scope.getAccountBalance();
                    })
            }).catch(function(e) {
                console.log(e);
                $scope.setStatus("Error contributing funds; see log.");
            });
        }
    };

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
            if (err !== null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length === 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            $scope.accounts = accs;
            $scope.account = $scope.accounts[1];

            $scope.getAccountBalance();
            $scope.fetchProjects();
        })
    };

    $scope.setStatus = function(message) {
        $timeout(function() {
            $scope.showStatus = true;
            $scope.status = message;
        })

    };

    $scope.getAccountBalance = function() {
        $timeout(function() {
            return web3.eth.getBalance($scope.account, function(error, result) {
                if(!error) {
                    $scope.accountBalance = web3.fromWei(result.valueOf(), 'ether')
                }
                else {
                    $scope.setStatus(error)
                }
            });
        });
    };

    //found at http://stackoverflow.com/a/6078873
    function timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
        var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }
}]);
