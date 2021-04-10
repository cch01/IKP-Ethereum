export const DcpStatus = (_dname, _ownerAddr, _accountID,  _ethBalance, _keys) => `
  <fieldset class="custom-field-title" style="margin-bottom: 15px;">
    <legend>${_dname}</legend>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">Owner Address: </div>
      <div class="custom-output">
        ${_ownerAddr.slice(0, 8)}...
      </div>
    </div>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">ETH Account Balance: </div>
      <div class="custom-output" id="account-balance-${_accountID}">
          ${_ethBalance} ETH
      </div>
    </div>
    <div class="d-flex justify-content-around">
      <div class="custom-output-label">Public Keys: </div>
      <div class="custom-output">
          ${_keys.join(", ")}
      </div>
    </div>
  </fieldset>
`