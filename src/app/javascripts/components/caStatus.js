export const CaStatus = (_cname, _ownerAddr, _accountId, _ethBalance,  _ikpBalance, _keys) => `
  <fieldset style="margin-bottom: 15px;">
    <legend class="custom-field-title" >${_cname}</legend>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">Owner Address: </div>
      <div class="custom-output">
        ${_ownerAddr.slice(0, 8)}...
      </div>
    </div>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">ETH Account Balance: </div>
      <div class="custom-output" id="account-balance-${_accountId}">
        ${_ethBalance} ETH
      </div>
    </div>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">IKP Account Balance: </div>
      <div class="custom-output" id="ikp-balance-${_accountId}">
          ${_ikpBalance} ETH
      </div>
    </div>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">Public Keys: </div>
      <div class="custom-output">
          ${_keys.join(', ')}
      </div>
    </div>
  </fieldset>
`