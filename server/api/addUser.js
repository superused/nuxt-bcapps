import { apiHandler, getPost } from '../../helpers/apiHandler.js'
import { web3, contract_register } from '../../helpers/web3.js'
import { constant } from '../../helpers/constants.js'

export default apiHandler({
  POST: async (req, res) => {
    return new Promise(async (resolve, reject) => {
      try {
        const body = await getPost(req)
        const address = body.account_address;
        // アカウントアドレスが取得できなければエラー
        if (!address) throw new Error('account address is not found')

        // トランザクション情報作成
        const txParams = {
          gas: web3.utils.toHex(3000000), // ガス代
          from: constant.owner_address, // 送信元
          to: constant.contract_address_register, // 送信先
          data: contract_register.methods.addUser(address).encodeABI(), // コントラクト
        }

        // 送信元の秘密鍵でsignする
        // web3.eth.personal.unlockAccount(constant.owner_address, private_key)
        const signedTx = await web3.eth.accounts.signTransaction(txParams, constant.owner_private_key)

        // set系のコントラクトを実行
        // web3.eth.sendTransaction(txParams, (error, result) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('transactionHash', result => {
          if (result) {
            // 結果が取得できれば結果を出力
            resolve(result)
          } else {
            // 結果が取得できなければエラー出力
            reject(new Error('register failed'))
          }
        })
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  },
})
