const Web3 = require('web3')
const web3 = new Web3()
const fs = require('fs');
const keystore = JSON.parse(fs.readFileSync("../../private_bc/node1/keystore/UTC--2022-07-27T10-06-44.857542400Z--7769f882f864cb4ee6de2baf619871a3e0197b06").toString())
const password = 'test'
const wallet = web3.eth.accounts.wallet.decrypt([keystore], password)
console.log(wallet[0].privateKey)
