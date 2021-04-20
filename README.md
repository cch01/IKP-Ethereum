# Simplified IKP platform on Ethereum
A demo for IKP system concept proofing, inspired by Matsumoto & Raphael: [IKP: Turning a PKI Around with Decentralized Automated Incentives](https://ieeexplore.ieee.org/document/7958590)


## 1. install dependency pkgs and truffle globally

```
yarn install
yarn install -g truffle
```

## 2. Change truffle-config.js if needed

Only needed to change if you are going to deploy the contract to testnet

## 3. Kick start any local blockchain services

[Ganache](https://www.trufflesuite.com/ganache) will be a useful local blockchain development tool.

## 4. Deploy smart contracts on your local/testnet blockchain
```
[npx] truffle deploy --network [profile-name in truffle-config.js]
```
or
```
yarn deploy-contracts
```
## 5. Start up the webapp
```
yarn start
```
