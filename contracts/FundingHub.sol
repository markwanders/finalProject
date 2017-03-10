pragma solidity ^0.4.2;

import "./Project.sol";

contract Bla {

}

contract FundingHub {

	address[] private projects;

	event ProjectAdded(address project);

	function FundingHub() {
		//FundingHub is the registry of all Projects to be funded. FundingHub should have a constructor
	}

	function createProject(uint amount, uint deadline) returns(address newProject) {
		// This function should allow a user to add a new project to the FundingHub. The function should deploy a new Project contract and keep track of its address. The createProject() function should accept all constructor values that the Project contract requires.
		newProject = new Project(amount, deadline);
		projects.push(newProject);
		ProjectAdded(newProject);		
		return newProject;
	}

	function contribute(address project, uint amount) {
		//This function allows users to contribute to a Project identified by its address. contribute calls the fund() function in the individual Project contract and passes on all value attached to the function call.
	}

	function getProjectCount() constant returns (uint length) {
		return projects.length;
	}

	function getProjectAt(uint index) constant returns (address project) {
		return projects[index];
	}
}