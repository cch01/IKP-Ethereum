# Ethereum-IKP
realized IKP on Ethereum blockchain


## 1. install dependency pkgs and truffle globally

```
yarn install
yarn install -g truffle
```

## 2. Change truffle-config.js if needed

Only needed to change if you are going to deploy the contract to testnet

## 3. Kick start any local blockchain services

[Ganache](https://www.trufflesuite.com/ganache) will be a useful local development env tool.

## 4. Deploy smart contracts on your local/testnet blockchain
```
[npx] truffle deploy --network [profile-name in truffle-config.js]
```
## 5. Start up the webapp
```
yarn start
```

## Notes
Due to some reasons, the webapp will fail to launch if you use eslint to lint the scripts.