export const RpTableRow = (_domainName, _caName, _rpAddr) => `
<tr id="${_domainName}-${_caName}-rp">
  <td class="custom-table-cell">${_domainName}</td>
  <td class="custom-table-cell">${_caName}</td>
  <td class="custom-table-cell">${_rpAddr}</td>
</tr>
`;