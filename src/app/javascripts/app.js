import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';
import _ from 'lodash';
import $ from './assets/jquery-3.6.0.min';

import IkpAbi from '../../contractArtifacts/IKP.json';
import DcpCheckerAbi from '../../contractArtifacts/DCPChecker.json';
import RPReactionAbi from '../../contractArtifacts/RPReaction.json';

import toasts from './utils/toast';
import { DcpStatus } from './components/dcpStatus';
import { CaStatus } from './components/caStatus';
import { RpHash } from './components/rpHash';
import { AccountOptions } from './components/accountOptions';
import { RpTableRow } from './components/rpTableRow';

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
      $('#current-account-balance').empty().append(`${web3.utils.fromWei(accountBalances[currentAccount], 'ether')} ETH`)
    }
  }))
);


const updateAllIkpCaBalances = async(_caNames) => 
  await Promise.all(_caNames.map((_caName) => 
    ikpDeployed.caBalances(_caName).then(bal => {
      if (!bal) {
        console.log('get ikp caBalance error');
        return;
      } 
      ikpCaBalances[_caName] = bal;
      console.log(`IKP Balance [${_caName}]: ${web3.utils.fromWei(`${bal}`, "ether")}`);
      $(`.ikp-ca-balance-${_caName}`)?.text(`${web3.utils.fromWei(`${bal}`, "ether")} ETH`);
    }).catch(console.error)
  ));

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
      $('#current-account-balance').empty().append(`${web3.utils.fromWei(accountBalances[currentAccount], 'ether')} ETH`)
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
    ).catch(console.error);

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }

    const accountAddresses = _.keys(accountBalances);

    await updateAllEthBalances(accountAddresses);

    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');

    //Hot fix for occasional batch balance update bug
    accountBalances[currentAccount] = ethBalance;
    $('#current-account-balance').empty().append(`${ethBalToEther} ETH`)

    const accountIndex = accountAddresses.findIndex(_addr => _addr == currentAccount);
    const newDcpRecord = DcpStatus(domainName, currentAccount, accountIndex, ethBalToEther, publicKeyList);
    
    $('#dcp-placeholder').remove();
    $('#dcp-fields').append(newDcpRecord)

    toasts.success('Action succeeded');
  },

  retrieveDomain: async() => {
    const domainName = $('#retrieveDomain_domainName').val();
    const dcpResult = await ikpDeployed.dcpList(domainName).catch(console.error);
    const keys = await ikpDeployed.getDcpPubKeys(domainName)

    if(!dcpResult.inUse || _.isEmpty(keys)) {
      toasts.error('DCP record / keys not found.');
      return;
    }

    const accountIndex = _.keys(accountBalances).findIndex(_addr => _addr == dcpResult.paymentAccount);
    const ethBalToEther = web3.utils.fromWei(accountBalances[dcpResult.paymentAccount], 'ether');
    const newDcpRecord = DcpStatus(domainName, dcpResult.paymentAccount, accountIndex, ethBalToEther, keys);
    
    $('#dcp-placeholder').remove();
    $('#dcp-fields').append(newDcpRecord)

    toasts.success('Action succeeded');
  },

  registerCa: async() => {
    const caName = $('#registerCa_caName').val();
    const publicKeys = $('#registerCa_publicKeys').val();
    const publicKeyList = _.map(publicKeys.split(","), _key => _key.trim());

    const result = await ikpDeployed.registerCa(
      caName, 
      publicKeyList, 
      { from: currentAccount, value:web3.utils.toWei('1', "ether")}
    ).catch(console.error);

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }

    const accountAddresses = _.keys(accountBalances);

    await updateAllEthBalances(_.keys(accountBalances));

    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');

    //Hot fix for occasional batch balance update bug
    accountBalances[currentAccount] = ethBalance;
    $('#current-account-balance').empty().append(`${ethBalToEther} ETH`)

    const ikpBalance = await ikpDeployed.caBalances(caName);
    const ikpBalToEther = web3.utils.fromWei(`${ikpBalance}`, 'ether');
    ikpCaBalances[caName] = ikpBalance;
    const accountIndex = accountAddresses.findIndex(_addr => _addr == currentAccount);

    const newCaRecord = CaStatus(caName, currentAccount, accountIndex, ethBalToEther, ikpBalToEther, publicKeyList);
    
    $('#ca-placeholder').remove();
    $('#ca-fields').append(newCaRecord)

    toasts.success('Action succeeded');
  },

  retrieveCa: async() => {
    const caName = $('#retrieveCa_caName').val();
    const caResult = await ikpDeployed.caList(caName).catch(console.error);
    const keys = await ikpDeployed.getCaPubKeys(caName)

    if(!caResult.inUse || _.isEmpty(keys)) {
      toasts.error('CA record / keys not found.');
      return;
    }

    const accountIndex = _.keys(accountBalances).findIndex(_addr => _addr == caResult.paymentAccount);
    const ethBalToEther = web3.utils.fromWei(accountBalances[caResult.paymentAccount], 'ether');
    const newCaRecord = DcpStatus(caName, caResult.paymentAccount, accountIndex, ethBalToEther, keys);
    
    $('#ca-placeholder').remove();
    $('#ca-fields').append(newCaRecord)

    toasts.success('Action succeeded');
  },

  purchaseRp: async() => {
    const domainName = $('#purchase_domainName').val();
    const issuerCa = $('#purchase_rpIssuer').val();
    const rpReactionAddr = $('#purchase_reactionAddress').val();
    const price = $('#purchase_price').val();

    const result = await ikpDeployed.purchaseRp(
      domainName, 
      issuerCa, 
      rpReactionAddr, 
      { from: currentAccount, value:web3.utils.toWei(`${price}`, "ether")}
    ).catch(console.error)

    const rpHash =  result?.logs[0]?.args?.rpHash;

    if(_.isEmpty(rpHash)) {
      toasts.error('Action failed');
      return;
    }    

    await updateAllEthBalances(_.keys(accountBalances));
    $('#rp-purchase-form').append(RpHash(rpHash))
    toasts.success('Action succeeded');    
  },

  retrieveRpHash: async() => {
    const domainName = $('#retrieveRpHash_domainName').val();
    const caName = $('#retrieveRpHash_rpIssuer').val();

    const rpHash = await ikpDeployed.getRpHash(domainName, caName);

    if(_.isEmpty(rpHash)) {
      toasts.error('Something went wrong.');
      return;
    }

    $('#rp-hash-form').append(RpHash(rpHash))
    toasts.success('Action succeeded');    
  },

  revokeRpPurchase: async() => {
    const rpHash = $('#revokePurchase_rpHash').val();
    const result = await ikpDeployed.revokeUnconfirmedRpPurchase(
      rpHash,
      { from: currentAccount }
    ).catch(console.error);;

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }    
    
    await updateAllEthBalances( _.keys(accountBalances));
    await updateAllIkpCaBalances(_.keys(ikpCaBalances));

    $(`#${rpHash}`).remove()
    toasts.success('Action succeeded');    
  },

  issueRP: async() => {
    const  domainName = $('#issueRp_domainName').val();
    const caName = $('#issueRp_caName').val();
    const rpReactionAddr = $('#issueRp_reactionFunctionAddress').val();

    const result = await ikpDeployed.issueRp(
      domainName, caName, rpReactionAddr, 
      {from: currentAccount, value: web3.utils.toWei('15', 'ether')}
    ).catch(console.error);
    
    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }    
    
    await updateAllEthBalances( _.keys(accountBalances));
    await updateAllIkpCaBalances(_.keys(ikpCaBalances));

    //Hot fix for occasional batch balance update bug
    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');
    accountBalances[currentAccount] = ethBalance;
    $('#current-account-balance').empty().append(`${ethBalToEther} ETH`)
        
    $('#rp-list-placeholder').addClass('d-none');
    $('#rp-list-fields').append(RpTableRow(domainName, caName, rpReactionAddr));
    $('#rp-list-container').removeClass('d-none').addClass('d-block');
    
    toasts.success('Action succeeded');    
  },


  commitReport: async() => {
    const domainName = $('#commitReport_domainName').val();
    const caName = $('#commitReport_caName').val();
    const key = $('#commitReport_key').val();

    const result = await ikpDeployed.commitReport(
      domainName, caName, key, {from: currentAccount, value: web3.utils.toWei('3')}
    ).catch(console.error);

    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }    
    
    await updateAllEthBalances( _.keys(accountBalances));
    //Hot fix for occasional batch balance update bug
    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');
    accountBalances[currentAccount] = ethBalance;
    $('#current-account-balance').empty().append(`${ethBalToEther} ETH`)
    
    toasts.success('Action succeeded');
  },

  revealReport: async() => {
    const domainName = $('#revealReport_domainName').val();
    const caName = $('#revealReport_caName').val();
    const key = $('#revealReport_key').val();

    const result = await ikpDeployed.revealReport(
      domainName, caName, key, {from: currentAccount}
    ).catch(console.error);
    
    if(_.isEmpty(result)) {
      toasts.error('Action failed');
      return;
    }    
    const rpClaimed = result.logs[0]?.args?.message === "Cert Report revealed.";

    if(rpClaimed){
      toasts.info('Abnormal Cert certified.');
      $(`#${domainName}-${caName}-rp`).remove();
      const rpListContainer = $('#rp-list-container');
      if(rpListContainer.children().length === 1) {
        rpListContainer.removeClass('d-block').addClass('d-none')
        $('#rp-list-placeholder').removeClass('d-none').addClass('d-block')
      }
    }

    await updateAllEthBalances( _.keys(accountBalances));
    await updateAllIkpCaBalances(_.keys(ikpCaBalances));

    //Hot fix for occasional batch balance update bug
    const ethBalance = await web3.eth.getBalance(currentAccount)
    const ethBalToEther = web3.utils.fromWei(`${ethBalance}`, 'ether');
    accountBalances[currentAccount] = ethBalance;
    $('#current-account-balance').empty().append(`${ethBalToEther} ETH`)

    toasts.success('Action succeeded');
  },

};

// startup point of the app
window.addEventListener('load', () => {
  App.start();
});
