// SPDX-License-Identifier: MIT

pragma solidity ^0.7;


contract RPReaction {

    address payable private ikp;
 
    uint256 affectedDomainPayout = 5 ether; // affected-domain payout
    uint256 higherDetectionFee = 5 ether; // detection payout \higherDetectionFee
    uint256 lowerDetectionFee = 3 ether; // if detector reports misbehavior by an unregistered CA, it receives a smaller payout

	constructor (address payable _ikp) {
	    ikp = _ikp;
	}

	function trigger (address payable detector, address payable ca,  address payable domain, bool isRegisteredCa) public payable {
		require(msg.sender == ikp, "Permission denined");
		if (isRegisteredCa) {
		    domain.transfer(affectedDomainPayout); // affected-domain payout
		    detector.transfer(higherDetectionFee); // detection payout
        ca.transfer(msg.value - affectedDomainPayout - higherDetectionFee);
		}
		else {
		    detector.transfer(lowerDetectionFee); // detection payout
        ca.transfer(msg.value - lowerDetectionFee);
		}

	}

}