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

let currentAccount, ikpOwnerAddr;
const accountBalances = {};
const ikpCaBalances = {};
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));

IKP.setProvider(web3.currentProvider);
DCPChecker.setProvider(web3.currentProvider);
RPReaction.setProvider(web3.currentProvider);

let ikpDeployed;
let dcpCheckerDeployed;
let rpReactionDeployed;

const updateAllEthBalances = async(_addresses) => await Promise.all(
  _addresses.map((_addr, _i) => web3.eth.getBalance(_addr, (err, bal) => {
    if (err) {
      console.log(`getBalance error: ${err}`);
    } else {
      console.log(_addr, bal);
      accountBalances[_addr] = bal;
      console.log(`Balance [${_addr}]: ${web3.utils.fromWei(`${bal}`, "ether")}`);
      $(`.account-balance-${_i}`)?.text(`${web3.utils.fromWei(`${bal}`, "ether")} ETH`);
    }
  }))
);


const updateAllIkpCaBalances = async(_caNames) => 
  await Promise.all(_caNames.map((_caName) =>{ 
    const bal = ikpDeployed.caBalances(_caName);
      if (!_.isUndefined(bal)) {
        console.log(`get caBalance error: ${err}`);
        return;
      } 
    ikpCaBalances[_caName] = bal;
    console.log(`Balance [${_caName}]: ${web3.utils.fromWei(bal, "ether")}`);
    $(`.ikp-ca-balance-${_caName}`)?.text(`${web3.utils.fromWei(bal, "ether")} ETH`);

  }));


// const subscribeToAllBalance = (_addresses) => {
//      web3.eth.subscribe('newBlockHeaders').on('data', (data) => {
//       console.log('have new block')
//       updateAllEthBalances(_address)
//     }).on('error', console.log);
// }



window.App = {
  start: async() => {
    const accountAddresses = await web3.eth.getAccounts();
    if(_.isEmpty(accountAddresses)) toasts.error("No accounts found, please check blockchain connection settings.");
    ikpOwnerAddr = accountAddresses[0];
    currentAccount = accountAddresses[0];

    await updateAllEthBalances(accountAddresses);

    $('#current-account').append(AccountOptions(accountAddresses))
    $('#current-account').change(() => {
      currentAccount = $('#current-account').val()
      console.log(currentAccount)
    })

    console.log(accountAddresses);
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

    const accountAddresses = _.keys(accountBalances);

    await updateAllEthBalances(accountAddresses);

    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');

    const accountIndex = accountAddresses.findIndex(_addr => _addr = currentAccount);
    const newDcpRecord = DcpStatus(domainName, currentAccount, accountIndex, ethBalToEther, publicKeyList);
    
    $('#dcp-fields').children() ?? $('#dcp-fields').empty();
    $('#dcp-fields').append(newDcpRecord)

    toasts.success('Action succeeded');
  },

  registerCa: async() => {
    const caName = $('#registerCa_caName').val();
    const publicKeys = $('#registerCa_publickeys').val();
    const publicKeyList = _.map(publicKeys.split(","), _key => _key.trim());

    const result = await ikpDeployed.registerCa(
      caName, 
      publicKeyList, 
      { from: currentAccount, value:web3.utils.toWei('1', "ether")}
    ).catch(console.log);

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }

    const accountAddresses = _.keys(accountBalances);

    await updateAllEthBalances(accountAddresses);

    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');

    const ikpBalance = await ikpDeployed.caBalances(caName);
    const ikpBalToEther = web3.utils.fromWei(`${ikpBalance}`, 'ether');
    ikpCaBalances[caName] = ikpBalance;
    const accountIndex = accountAddresses.findIndex(_addr => _addr = currentAccount);

    const newCaRecord = CaStatus(caName, currentAccount, accountIndex, ethBalToEther, ikpBalToEther, publicKeyList);
    
    $('#ca-fields').children() ?? $('#ca-fields').empty();
    $('#ca-fields').append(newCaRecord)

    toasts.success('Action succeeded');
    
  },

  purchaseRp: async() => {
    const domainName = $('#purchase_domainName').val();
    const issuerCa = $('#purchase_rpIssuer').val();
    const rpReactionAddr = $('#purchase_reactionAddress').val();
    const result = await ikpDeployed.purchaseRp(
      domainName, 
      issuerCa, 
      rpReactionAddr, 
      { from: currentAccount, value:web3.utils.toWei('3', "ether")}
    )
    const rpHash =  result.logs[0].args.rpHash;
    console.log(rpHash)
    if(_.isEmpty(rpHash)) {
      toasts.error('Action failed');
      return;
    }    
    const accountAddresses = _.keys(accountBalances);

    await updateAllEthBalances(accountAddresses);
    $('#rp-purchase-form').append(RpHash(rpHash))
    toasts.success('Action succeeded');    
  },

  revokeRpPurchase: async() => {
    const rpHash = $('#revokePurchase_rpHash').val();
    const result = await ikpDeployed.revokeUnconfirmedRpPurchase(
      rpHash,
      { from: currentAccount }
    ).catch(console.log);;

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }    
    
    await updateAllEthBalances( _.keys(accountBalances));
    await updateAllIkpCaBalances(_.keys(ikpCaBalances));

    $(`#${rpHash}`).remove()
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
