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
        const result = await contract_register.methods.isRegistered(address).call()
        resolve(result)
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  },
})
