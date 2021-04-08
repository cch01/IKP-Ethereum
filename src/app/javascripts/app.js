import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import _ from 'lodash';
import $ from './jquery-3.6.0.min';

import IkpAbi from '../../contractArtifacts/IKP.json';
import DcpCheckerAbi from '../../contractArtifacts/DCPChecker.json';
import RPReactionAbi from '../../contractArtifacts/RPReaction.json';

// import "toastify-js/src/toastify.css"
// import Toastify from 'toastify-js'


import toasts from './toast'

const IKP = contract(IkpAbi);
const DCPChecker = contract(DcpCheckerAbi);
const RPReaction = contract(RPReactionAbi);

const accounts = {
  ikpOwner: null,
  domain: null,
  ca1: null,
  ca2: null,
  ca3: null
};

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

IKP.setProvider(web3.currentProvider);
DCPChecker.setProvider(web3.currentProvider);
RPReaction.setProvider(web3.currentProvider);

let ikpDeployed;
let dcpCheckerDeployed;
let rpReactionDeployed;

window.App = {
  start: async() => {
    const _accounts = await web3.eth.getAccounts();
    if(_.isEmpty(_accounts)) alert("No accounts found, please check blockchain connection settings.");
    Object.keys(accounts).forEach((key, i) => {
      accounts[key] = _accounts[i]
    })
    console.log(accounts);
    ikpDeployed = await IKP.deployed();
    dcpCheckerDeployed = await DCPChecker.deployed();
    rpReactionDeployed = await RPReaction.deployed();

    //TODO: Show accounts name and balance on web UI

  },

  refreshBalance: () => {

  },

  registerDomain: async() => {
    const domainName = $("#registerDomain_domainName").val()
    const checkerAddress = $("#registerDomain_checkerAddress").val()
    const publicKeys = $("#registerDomain_publicKeys").val()

    const publicKeyList = _.map(publicKeys.split(","), _key => _key.trim());
    console.log(publicKeyList)
    const result = await ikpDeployed.registerDomain(
      domainName, 
      checkerAddress, 
      publicKeyList, 
      { from:accounts.domain, value:web3.utils.toWei('1', "ether")}
    );
    if(!_.isEmpty(result)) toasts.success();
    console.log(result)
  },

  purchaseRp: () => {
    var self = this;
    var ikp;
    var RPHash = document.getElementById("RPHash").value;
    var RPissuer = document.getElementById("RPissuer").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.purchaseRp.call(RPHash,RPissuer,{from:account});
    }).then((value) => {
      // var greetWord = document.getElementById("balance");
      // greetWord.innerHTML = value.valueOf();
    }).catch((e) => {
      console.log(e);
      self.setStatus("Error getting greet word; see log.");
    });
  },

  revokeRpPurchase: () => {},

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

  commitReport: () => {
    var self = this;
    var ikp;
    var cert = document.getElementById("cert").value;
    var nonce = document.getElementById("nonce").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.reportCommit.call(cert,nonce,{from:account});
    }).then((value) => {
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
    var cert = document.getElementById("cert").value;
    var nonce = document.getElementById("nonce").value;

    IKP.deployed().then((instance) => {
      ikp = instance;
      return ikp.reportReveal.call(cert,nonce, {from:account});
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
