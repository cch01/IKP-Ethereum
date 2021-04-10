import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import _ from 'lodash';
import $ from './jquery-3.6.0.min';

import IkpAbi from '../../contractArtifacts/IKP.json';
import DcpCheckerAbi from '../../contractArtifacts/DCPChecker.json';
import RPReactionAbi from '../../contractArtifacts/RPReaction.json';

import toasts from './utils/toast';
import { DcpStatus } from './components/dcpStatus';
import { CaStatus } from './components/caStatus';
import { RpHash } from './components/rpHash';
import { AccountOptions } from './components/accountOptions';

const IKP = contract(IkpAbi);
const DCPChecker = contract(DcpCheckerAbi);
const RPReaction = contract(RPReactionAbi);

let ikpOwnerAddr;
let currentAccount;
const accountBalances = {};
let accountAddress;
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));

IKP.setProvider(web3.currentProvider);
DCPChecker.setProvider(web3.currentProvider);
RPReaction.setProvider(web3.currentProvider);

let ikpDeployed;
let dcpCheckerDeployed;
let rpReactionDeployed;


const updateAllBalances = async(_addresses) => {
  await Promise.all(_addresses.map((_addr, _i) => web3.eth.getBalance(_addr, (err, bal) => {
    if (err) {
      console.log(`getBalance error: ${err}`);
    } else {
      accountBalances[_addr] = bal;
      console.log(`Balance [${_addr}]: ${web3.utils.fromWei(bal, "ether")}`);
      $(`#account-balance-${_i}`)?.text(`${web3.utils.fromWei(bal, "ether")} ETH`);
    }
  })));
}

// const subscribeToAllBalance = (_addresses) => {
//      web3.eth.subscribe('newBlockHeaders').on('data', (data) => {
//       console.log('have new block')
//       updateAllBalances(_address)
//     }).on('error', console.log);
// }



window.App = {
  start: async() => {
    accountAddress = await web3.eth.getAccounts();
    if(_.isEmpty(accountAddress)) toasts.error("No accounts found, please check blockchain connection settings.");
    ikpOwnerAddr = accountAddress[0];
    currentAccount = accountAddress[0];
    // subscribeToAllBalance(accountAddress);
    await updateAllBalances(accountAddress);

    $('#current-account').append(AccountOptions(accountAddress))
    $('#current-account').change(() => {
      currentAccount = $('#current-account').val()
      console.log(currentAccount)
    })

    console.log(accountAddress);
    ikpDeployed = await IKP.deployed();
    dcpCheckerDeployed = await DCPChecker.deployed();
    rpReactionDeployed = await RPReaction.deployed();

    if(dcpCheckerDeployed.address) {
      $('#dcp-checker-contract-address').empty().append(dcpCheckerDeployed.address);
    }
    if(rpReactionDeployed.address) {
      $('#rp-reaction-contract-address').empty().append(rpReactionDeployed.address);
    }
    //TODO: Show accounts name and balance on web UI

  },



  registerDomain: async() => {
    const domainName = $("#registerDomain_domainName").val()
    const checkerAddress = $("#registerDomain_checkerAddress").val()
    const publicKeys = $("#registerDomain_publicKeys").val()

    const publicKeyList = _.map(publicKeys.split(","), _key => _key.trim());
    
    const result = await ikpDeployed.registerDomain(
      domainName, 
      checkerAddress, 
      publicKeyList, 
      { from: currentAccount, value:web3.utils.toWei('1', "ether")}
    ).catch(console.log);

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }

    await updateAllBalances(accountAddress);

    const accountIndex = accountAddress.findIndex(_addr => _addr = currentAccount);
    const newDcpRecord = DcpStatus(domainName, currentAccount, accountIndex, web3.utils.fromWei(`${accountBalances[currentAccount]}`, 'ether'), publicKeyList);
    
    $('#dcp_fields').children() ?? empty();
    $('#dcp_fields').append(newDcpRecord)

    toasts.success('Action succeeded');
  },

  registerCa: () => {
    var self = this;
    var ikp;
    var caname = document.getElementById("caname").value;
    var publickey = document.getElementById("publickey").value;
    var threshold = document.getElementById("threshold").value;


    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.registerCa.call(caname,publickey,threshold,{from:account, value:web3.toWei(15, "ether")});
    }).then((value) => {
      // var greetWord = document.getElementById("balance");
      // greetWord.innerHTML = value.valueOf();
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting greet word; see log.");
    });
  },

  purchaseRp: async() => {
    const domainName = $('#purchase_domainName');
    const issuerCa = $('#purchase_rpIssuer');
    const rpReactionAddr = $('#purchase_reactionAddress');

    const result = await ikpDeployed.purchaseRp(
      domainName, 
      issuerCa, 
      rpReactionAddr, 
      { from: currentAccount, value:web3.utils.toWei('3', "ether")}
    ).catch(console.log);;

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }
    await updateAllBalances(accountAddress);
    console.log(result)
    $('#revokeRpPurchase').append(RpHash(result))
    toasts.success('Action succeeded');    
  },

  revokeRpPurchase: async() => {
    const rpHash = $('#revokePurchase_rpHash');
    const result = await ikpDeployed.revokeUnconfirmedRpPurchase(
      rpHash,
      { from: currentAccount }
    ).catch(console.log);;

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }
    await updateAllBalances(accountAddress);
    $('#revokeRpPurchase').append(RpHash(result))
    toasts.success('Action succeeded');    
  },

  issueRP: () => {
    var self = this;
    var ikp;
    var issueRP = document.getElementById("issueRP").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.rpIssue.call(issueRP,{from:account});
    }).then((value) => {
      // var greetWord = document.getElementById("balance");
      // greetWord.innerHTML = value.valueOf();
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting greet word; see log.");
    });
  },


  commitReport: () => {
    var self = this;
    var ikp;
    var certToVerify = document.getElementById("certToVerify").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      // need to be editted
      return ikp.isRevoked.call(certToVerify,{from:account});
    }).then((value)=> {
      // var greetWord = document.getElementById("balance");
      // greetWord.innerHTML = value.valueOf();
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting greet word; see log.");
    });
  },

  revealReport: () => {
    var self = this;
    var ikp;
    var certisrevoke = document.getElementById("certisrevoke").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.isRevoked.call(certisrevoke, {from:account});
    }).then((value) => {
      // var greetWord = document.getElementById("balance");
      // greetWord.innerHTML = value.valueOf();
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting greet word; see log.");
    });
  },

};

window.addEventListener('load', () => {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  // if (typeof web3 !== 'undefined') {
  //   console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  //   // Use Mist/MetaMask's provider
  //   window.web3 = new Web3(web3.currentProvider);
  // } else {
  //   console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  //   window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  // }
  App.start();
});
