export const CaStatus = (_cname, _ownerAddr, _accountId, _ethBalance,  _ikpBalance, _keys) => `
  <div style="margin-bottom: 15px;">
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">CA Name: </div>
      <div class="custom-output" style="text-align: left; width: 50%;">
        ${_cname}
      </div>
    </div>
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">Owner Address: </div>
      <div class="custom-output" style="text-align: left; width: 50%;">
        ${_ownerAddr.slice(0, 8)}...
      </div>
    </div>
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">ETH Account Balance: </div>
      <div class="custom-output account-balance-${_accountId}" style="text-align: left; width: 50%;">
        ${_ethBalance} ETH
      </div>
    </div>
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">IKP Account Balance: </div>
      <div class="custom-output ikp-ca-balance-${_cname}" style="text-align: left; width: 50%;">
        ${_ikpBalance} ETH
      </div>
    </div>
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">Public Keys: </div>
      <div class="custom-output" style="text-align: left; width: 50%;">
        ${_keys.join(', ')}
      </div>
    </div>
  </div>
`