// SPDX-License-Identifier: MIT
pragma solidity ^0.7;

contract Greeter         
{
    address payable creator;     
    string greeting;     

    constructor()   
    {
        creator = msg.sender;
        greeting = "hello";
    }

    function greet() public view returns (string memory)          
    {
        return greeting;
    }
    
    function setGreeting(string memory _newgreeting) public
    {
        greeting = _newgreeting;
    }
    
     /**********
     Standard kill() function to recover funds 
     **********/
    
    function kill() private
    { 
        if (msg.sender == creator)
            selfdestruct(creator);  // kills this contract and sends remaining funds back to creator
    }

}