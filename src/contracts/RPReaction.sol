// SPDX-License-Identifier: MIT

pragma solidity ^0.7;

contract RPReaction {

  address payable public ikp;

  uint256 affectedDomainPayout = 5 ether; 
  uint256 reporterPayout = 5 ether;

  // This contract must be deployed using IKP contract address to ensure no cheating by others  
	constructor (address payable _ikp) {
	    ikp = _ikp;
	}

	function trigger (address payable detector, address payable ca,  address payable domain) public payable {
    // Only IKP contract can invoke this function
    require(msg.sender == ikp, "Permission denined");
    domain.transfer(affectedDomainPayout); 
    detector.transfer(reporterPayout);
    ca.transfer(msg.value - affectedDomainPayout - reporterPayout);
	}

}