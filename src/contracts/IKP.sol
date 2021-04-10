// SPDX-License-Identifier: MIT

pragma solidity ^0.7;
pragma experimental ABIEncoderV2;

import "./DCPChecker.sol";
import "./RPReaction.sol";

contract IKP {

    struct CA {
        string name;
        address payable paymentAccount;
        bool inUse;
    }

    struct DCP {
        string domainName;
        bool inUse;
        address payable paymentAccount;
        DCPChecker checker;
    }

    struct RP {
        string domainName;
        string cname;
        RPReaction reaction;
    }

    struct PendingRpPurchase {
        string cname;
        address domainAddr;
        address rpReactionAddr;
        uint amount;
        uint purchasedAt;
    }

    struct ReportRecord {
      address reporter;
      uint reportedAt;
    }

    uint public reportFee = 5 ether; 
    uint public rpMinimumPrice = 15 ether; 
    uint public domainRegisterFee = 1 ether;
    uint public registerCaFee = 1 ether;

    mapping(string => CA) public caList;
    mapping(string => string[]) public caPubKeys;
    mapping(string => uint) public caBalances;

    mapping(string => DCP) public dcpList;
    mapping(string => string[]) public dcpPubKeys;

    mapping(bytes32 => RP) public rpList;
    mapping(bytes32 => PendingRpPurchase) private pendingRpPurchaseMapping;
    mapping(bytes32 => ReportRecord) private reportRecords;
    
    event NewTransaction(string message);
    event RpPurchased(bytes32 rpHash);
    function registerCa (string memory _name, string[] memory _pks) public payable {
        require(msg.value >= registerCaFee, "Not enough registration fee.");
        require(!caList[_name].inUse, "This account already in use.");
        CA memory newCa = CA({
            name: _name,
            inUse: true,
            paymentAccount: msg.sender
        });
        caList[_name] = newCa;
        caPubKeys[_name] = _pks;
        caBalances[_name] = msg.value;
        emit NewTransaction('Domain registered.');
    }
    //Use "getRpHash" to obtain rpHash to query desired RP status
    function getRpHash(string memory _dname, string memory _cname) public pure returns (bytes32 rpHash){
      return keccak256(abi.encodePacked(_dname, _cname));
    }

    function registerDomain (string memory _name, address _checkerFunctionAddress, string[] memory _ligitimateKeys) public payable {
        require(!dcpList[_name].inUse && msg.value >= domainRegisterFee, "Not enough registration fee. / This DCP already registered");
        DCP memory newDcp = DCP({
            inUse: true,
            domainName: _name,
            paymentAccount: msg.sender,
            checker: DCPChecker(_checkerFunctionAddress)
        });
        dcpList[_name] = newDcp;
        dcpPubKeys[_name] = _ligitimateKeys;
        emit NewTransaction('CA registered.');
    }

    function issueRp (string memory _dname, string memory _cname, address _reactionContractAddress) public payable {
        require(msg.value >= rpMinimumPrice, "Not enough RP issue fee.");

        bytes32 _rpHash = keccak256(abi.encodePacked(_dname, _cname));
        require((keccak256(abi.encodePacked(_cname)) == keccak256(abi.encodePacked(pendingRpPurchaseMapping[_rpHash].cname))
         && _reactionContractAddress == pendingRpPurchaseMapping[_rpHash].rpReactionAddr)
          && (msg.sender == caList[_cname].paymentAccount)
            , "CA not registered / Wrong Address for the CA.");

        RP memory rp = RP({
          domainName: _dname,
          cname: _cname,
          reaction: RPReaction(_reactionContractAddress)
        });

        rpList[_rpHash] = rp;
        caBalances[_cname] += msg.value;
        msg.sender.transfer(pendingRpPurchaseMapping[_rpHash].amount);
        delete pendingRpPurchaseMapping[_rpHash];

        emit NewTransaction('RP issued.');
    }

    function purchaseRp (string memory _dname, string memory _cname, address _reactionContractAddress) public payable returns (bytes32 rpHash) {
      require(keccak256((abi.encodePacked(_dname))) == keccak256(abi.encodePacked(dcpList[_dname].domainName)), "This domain DCP not registered.");
      require(keccak256((abi.encodePacked(_cname))) == keccak256(abi.encodePacked(caList[_cname].name)), "CA invalid / not registered.");
      bytes32 _rpHash = keccak256(abi.encodePacked(_dname, _cname));
      require(pendingRpPurchaseMapping[_rpHash].purchasedAt == 0, "Unconfirmed purchase record exist. Revoke purchase record before buying again if needed.");
      PendingRpPurchase memory newPendingRpPurchase = PendingRpPurchase({ cname:_cname, amount:msg.value, domainAddr: msg.sender, purchasedAt: block.timestamp, rpReactionAddr:_reactionContractAddress });
      pendingRpPurchaseMapping[_rpHash] = newPendingRpPurchase;

      emit RpPurchased(_rpHash);
      return _rpHash;
    }

    function revokeUnconfirmedRpPurchase(bytes32 _rpHash) public {
      require(msg.sender == pendingRpPurchaseMapping[_rpHash].domainAddr, "No purchase record found.");
      msg.sender.transfer(pendingRpPurchaseMapping[_rpHash].amount);
      delete pendingRpPurchaseMapping[_rpHash];
      emit NewTransaction('RP purchase revoked.');
    }


    function commitReport (string memory _dname, string memory _cname, string memory _key) public payable {
        require(msg.value == reportFee, "Please submit exact report fee.");
        bytes32 _reportHash = keccak256(abi.encodePacked(_dname, _cname, _key, msg.sender));
        require(reportRecords[_reportHash].reporter == address(0), "This report has been submitted by others.");
        reportRecords[_reportHash] = ReportRecord({ reporter: msg.sender, reportedAt: block.timestamp });
        emit NewTransaction('Cert Report committed.');

    }

    function revealReport (string memory _dname, string memory _cname, string memory _key) public {
        require(reportRecords[keccak256(abi.encodePacked(_dname, _cname, _key, msg.sender))].reporter == msg.sender, "Permission denined.");
        bytes32 _rpHash = keccak256(abi.encodePacked(_dname, _cname)); 
        if (keccak256(abi.encodePacked(rpList[_rpHash].domainName)) != keccak256(abi.encodePacked(_dname))) {
            msg.sender.transfer(reportFee);
            return;
        }
        bytes32 dnameCnameHash = keccak256(abi.encodePacked(_dname, _cname));
        bytes32 ligitimateDnameCnameHash = keccak256(abi.encodePacked(rpList[_rpHash].domainName, rpList[_rpHash].cname));

        if(dnameCnameHash != ligitimateDnameCnameHash) {
          delete reportRecords[keccak256(abi.encodePacked(_dname, _cname, _key, msg.sender))];
          return;
        }

        bool isCertValid = dcpList[_dname].checker.check(dcpPubKeys[_dname], _key, caPubKeys[_cname]);

        if(isCertValid) {
          delete reportRecords[keccak256(abi.encodePacked(_dname, _cname, _key, msg.sender))];
          return;
        }

        rpList[_rpHash].reaction.trigger{value:rpMinimumPrice}(
          msg.sender, 
          caList[_cname].paymentAccount,
					dcpList[_dname].paymentAccount
				);

        caBalances[_cname] -= rpMinimumPrice;
        delete rpList[_rpHash];
        delete reportRecords[keccak256(abi.encodePacked(_dname, _cname, _key, msg.sender))];
        emit NewTransaction('Cert Report revealed.');
    }

}
