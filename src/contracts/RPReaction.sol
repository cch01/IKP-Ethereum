// SPDX-License-Identifier: MIT

pragma solidity ^0.7;


contract RPReaction {

    address payable private ikp;
 
    uint256 affectedDomainPayout = 5 ether; // affected-domain payout
    uint256 detectionFee = 5 ether; // detection payout \detectionFee

	constructor (address payable _ikp) {
	    ikp = _ikp;
	}

	function trigger (address payable detector, address payable ca,  address payable domain) public payable {
		require(msg.sender == ikp, "Permission denined");
		    domain.transfer(affectedDomainPayout); // affected-domain payout
		    detector.transfer(detectionFee); // detection payout
        ca.transfer(msg.value - affectedDomainPayout - detectionFee);
	}

}