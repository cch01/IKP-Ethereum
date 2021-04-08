// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

// import "./X509.sol";

contract DCPChecker {
  constructor(){}
    function check (string[] memory ligitimateKeys, string memory key, string[] memory caPubKeys ) public pure returns(bool) { 
        bool isKeyLigitimate = false;
        for(uint i = 0; i < ligitimateKeys.length; i++){
          isKeyLigitimate = keccak256(abi.encodePacked(ligitimateKeys[i])) == keccak256(abi.encodePacked(key));
          if(isKeyLigitimate) break;
        }
        for(uint j = 0; j < caPubKeys.length; j++){
          isKeyLigitimate = keccak256(abi.encodePacked(caPubKeys[j])) == keccak256(abi.encodePacked(key));
          if(isKeyLigitimate) break;
        }
        if(!isKeyLigitimate) return false;
        return true;
    }

}