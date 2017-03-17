pragma solidity ^0.4.8;

contract Project {

	struct Campaign {
		address owner;

		uint amount;

		uint deadline;
	}

	Campaign public campaign;

	mapping (address => uint) balances;
	mapping (uint => address) balanceIndex;

	bool private passedDeadline;
	bool private funded;

	function Project(address owner, uint amount, uint deadline) {
		//Project is the contract that stores all the data of each project. Project should have a constructor and a struct to store the following information:
		//the address of the owner of the project
		//the amount to be raised (eg 100000 wei)
		//the deadline, i.e. the time until when the amount has to be raised
		campaign = Campaign(owner, amount, deadline);
	}

	function fund(address funder) payable public {
		// This is the function called when the FundingHub receives a contribution. The function must keep track of the contributor and the individual amount contributed. If the contribution was sent after the deadline of the project passed, or the full amount has been reached, the function must return the value to the originator of the transaction and call one of two functions. If the full funding amount has been reached, the function must call payout. If the deadline has passed without the funding goal being reached, the function must call refund.

		passedDeadline = (now >= campaign.deadline);
		funded = (this.balance >= campaign.amount);
		if (funded) {
			refund(funder, msg.value);
			payout();
		} else if(passedDeadline) {
			refund();
		} else {
			balances[funder] += msg.value;
		}
	}

	function payout() private {
		//This is the function that sends all funds received in the contract to the owner of the project.
		if(!campaign.owner.send(this.balance)) {
			throw;
		}
	}

	function refund() private {
		//This function sends all individual contributions back to the respective contributor, or lets all contributors retrieve their contributions.
	}

	function refund(address receiver, uint amount) private {
		//This function sends an individual contribution back to the respective contributor
		if(!receiver.send(amount)) {
			throw;
		}
	}
}