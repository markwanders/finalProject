pragma solidity ^0.4.8;

import "./Project.sol";

contract FundingHub {

	address[] public projects;

	function FundingHub() {
		//FundingHub is the registry of all Projects to be funded. FundingHub should have a constructor
	}

	function createProject(uint amount, uint deadline) returns(address project) {
		// This function should allow a user to add a new project to the FundingHub. The function should deploy a new Project contract and keep track of its address. The createProject() function should accept all constructor values that the Project contract requires.
		project = new Project(msg.sender, amount, now + deadline);
		projects.push(project);
		return project;
	}

	function contribute(address projectAddress) payable returns(bool) {
		//This function allows users to contribute to a Project identified by its address. contribute calls the fund() function in the individual Project contract and passes on all value attached to the function call.
		Project project = Project(projectAddress);
		project.fund.value(msg.value)(msg.sender);
				
	}

	function getProjectCount() constant returns (uint length) {
		return projects.length;
	}

	function getProjectAt(uint index) constant returns (address project) {
		return projects[index];
	}
}