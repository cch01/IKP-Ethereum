export const DcpStatus = (_dname, _ownerAddr, _accountID,  _ethBalance, _keys) => `
  <div style="margin-bottom: 15px;">
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">Domain Name: </div>
        <div class="custom-output" style="text-align: left; width: 50%;">
          ${_dname}
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
      <div class="custom-output account-balance-${_accountID}"  style="text-align: left; width: 50%;">
          ${_ethBalance} ETH
      </div>
    </div>
    <div class="d-flex">
      <div class="custom-output-label" style="text-align: left; width: 50%;">Public Keys: </div>
      <div class="custom-output" style="text-align: left; width: 50%;">
          ${_keys.join(", ")}
      </div>
    </div>
  </div>
`