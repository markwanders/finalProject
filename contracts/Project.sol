pragma solidity ^0.4.2;

contract Project {

	struct Campaign {
		address owner;

		uint goal;

		uint deadline;
	}

	Campaign public campaign;

	mapping (address => uint) balances;
	address[] funders;

	bool private passedDeadline;
	bool private funded;
	bool private inactive;

	function Project(address owner, uint goal, uint deadline) {
	//Project is the contract that stores all the data of each project. Project should have a constructor and a struct to store the following information:
	//the address of the owner of the project
	//the amount to be raised (eg 100000 wei)
	//the deadline, i.e. the time until when the amount has to be raised
		campaign = Campaign(owner, goal, deadline);
	}

	function fund(address funder) payable public {
	// This is the function called when the FundingHub receives a contribution. The function must keep track of the contributor and the individual amount contributed. If the contribution was sent after the deadline of the project passed, or the full amount has been reached, the function must return the value to the originator of the transaction and call one of two functions. If the full funding amount has been reached, the function must call payout. If the deadline has passed without the funding goal being reached, the function must call refund.

		passedDeadline = (now >= campaign.deadline);
		funded = (this.balance >= campaign.goal);

		if(balances[funder] == 0) { //this is a new funder, add to the tracking list. This introduces a slight 'bug' in that a user who contributes and then refunds would get added to the list of contributors again, resulting in duplicate entries in the array. However, since the balances are kept in a mapping (i.e. with a unique entry), this does not cause any practical issues
			funders.push(funder);
		}
		balances[funder] += msg.value;

		if(inactive) {
			refund(funder, msg.value); //Project already funded or expired, refund entire contribution
		} else if (funded && !passedDeadline) {
			inactive = true;
			refund(funder, (this.balance - campaign.goal)); //only refund the part of the contribution that puts the campaign over the goal
			payout();
		} else if(passedDeadline) {
			refundAll();
			inactive = true;
		}
	}

	function payout() private {
	//This is the function that sends all funds received in the contract to the owner of the project.
	//We could also selfdestruct() the contract here, but then people might still send ether to it from the frontend, which would then be lost forever
		if(this.balance != 0 && !campaign.owner.send(this.balance)) {
			throw;
		}
	}

	function refundAll() private {
	//This function sends all individual contributions back to the respective contributor
		for(uint i = 0; i < funders.length; i++) {
			refund(funders[i], balances[funders[i]]);
		}
	}

	function refund(address receiver, uint amount) private {
	//This function sends an individual contribution back to the respective contributor
		balances[receiver] -= amount; // Prevent re-entry by updating balance first
		if(!receiver.send(amount)) {
			throw;
		}
	}

	function refund() public {
	//This function lets an individual contributor refund their contribution
		if(balances[msg.sender] > 0) {
			refund(msg.sender, balances[msg.sender]);
		}
	}
}