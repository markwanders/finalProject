pragma solidity ^0.4.2;

contract Project {

	struct Campaign {
		address owner;

		uint amount;

		uint deadline;
	}

	event ProjectCreated(address owner);

	event FundsReceived(address funder, uint amount);

	Campaign public campaign;

	function Project(address owner, uint amount, uint deadline) {
		//Project is the contract that stores all the data of each project. Project should have a constructor and a struct to store the following information:
		//the address of the owner of the project
		//the amount to be raised (eg 100000 wei)
		//the deadline, i.e. the time until when the amount has to be raised
		campaign = Campaign(owner, amount, deadline);
		ProjectCreated(owner);
	}

	mapping (address => uint) balances;

	function fund(address funder) payable {
		// This is the function called when the FundingHub receives a contribution. The function must keep track of the contributor and the individual amount contributed. If the contribution was sent after the deadline of the project passed, or the full amount has been reached, the function must return the value to the originator of the transaction and call one of two functions. If the full funding amount has been reached, the function must call payout. If the deadline has passed without the funding goal being reached, the function must call refund.
		FundsReceived(funder, msg.value);
		balances[funder] += msg.value;
		bool passedDeadline = (now >= campaign.deadline);
		bool funded = (this.balance >= campaign.amount);
		if (funded) {
			payout();
		} else if(passedDeadline) {
			refund();
		}
		
	}

	function payout() {
		//This is the function that sends all funds received in the contract to the owner of the project.
	}

	function refund() {
		//This function sends all individual contributions back to the respective contributor, or lets all contributors retrieve their contributions.
	}
}