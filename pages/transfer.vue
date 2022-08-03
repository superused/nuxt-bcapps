<template>
  <v-row justify="center">
    <v-col
      cols="12"
      sm="10"
      md="8"
      lg="6"
    >
      <v-card ref="form">
        <v-card-text>
          <h1>{{ title }}</h1>
          <h2 align="right">(TotalSupply:{{ totalSupply }})</h2>
          <v-text-field
            ref="fromAccount"
            v-model="fromAccount"
            label="FromAccount"
            placeholder="fromAccount"
            disabled
          >
           {{ fromAccount }}
          </v-text-field>
          <p> TokenBalance : {{ tokenBalance }}</p>
          <p> EthBalance : {{ ethBalance }}</p>
          <v-text-field
            ref="sendValue"
            v-model="sendValue"
            :rules="[() => !!sendValue || 'This field is required']"
            :label="symbol"
            placeholder="sendValue"
            type="number"
            required
          ></v-text-field>
          <v-text-field
            ref="toAccount"
            v-model="toAccount"
            :rules="[() => !!toAccount || 'This field is required']"
            label="ToAccount"
            placeholder="toAccount"
            required
          ></v-text-field>
        </v-card-text>
        <v-divider class="mt-12"></v-divider>
        <v-card-actions>
          <v-btn
            color="secondary"
            @click="back"
          >
            Back
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="send"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ethers } from 'ethers'
import { constant } from '../helpers/constants.js'
import { web3, contract } from '../helpers/web3.js'
import Web3 from "web3"
export default {
   data() {
     return {
       title: '',
       totalSupply: '',
       fromAccount: '',
       ethBalance: 0,
       tokenBalance: 0,
       password: '',
       sendValue: 1,
       toAccount: '',
       errorMessages: '',
       formHasErrors: false,
       symbol: 'SendValue ()',
       loading: false,
     }
   },
   async beforeMount() {
     // 送信者アカウントアドレス
     const mnemonic = await this.$isRegistered()
     if (!mnemonic) {
       // アカウント情報が取得できない場合トップ画面にリダイレクト
       this.$router.replace('/top')
       return
     }
     const wallet = await ethers.Wallet.fromMnemonic(mnemonic)
     this.password = wallet.privateKey
     this.fromAccount = wallet.address
     // 送信者アカウントアドレスが渡されていなかったらアカウント一覧画面にリダイレクト
     if (!this.fromAccount) {
       this.$router.replace('/top')
       return
     }

     // API各々実行
     [this.totalSupply, this.title, this.symbol] = await Promise.all([
       this.$apiRequest('/api/totalSupply'), // トークン発行量取得API
       this.$apiRequest('/api/name'),        // トークン名取得API
       this.getSymbol(),                     // トークンシンボル取得
       this.getTokenBalance(),               // 送信者のトークン残高取得
       this.getEtherBalance(),               // 送信者のEther残高取得
     ])
   },
   methods: {
     // 送信者のトークン残高取得
     async getTokenBalance() {
       // API実行
       const res = await this.$apiRequest('/api/getTokenBalanceOf', {
         account_address: this.fromAccount
       }, 'post')
       if (res) {
         // 結果を画面に反映
         this.tokenBalance = res
       } else {
         alert('トークン残高の取得に失敗しました。')
       }
     },
     // 送信者のether残高取得
     async getEtherBalance() {
       // API実行
       const res = await this.$apiRequest('/api/getEtherBalance', {
         account_address: this.fromAccount
       })
       if (res) {
         // 結果を画面に反映
         this.ethBalance = res
       } else {
         alert('Ether残高の取得に失敗しました。')
       }
     },
     // 画面表示用トークンシンボル取得
     async getSymbol() {
       // API実行
       const res = await this.$apiRequest('/api/symbol')
       return 'SendValue (' + res + ')'
     },
     // トークン送信処理
     async send() {
       this.loading = true
       // 入力チェック
       const errors = this.validate()
       // エラーがある場合、アラートで表示して送信処理中断
       if (errors.length) {
         alert(errors.join("\n"))
         this.loading = false
         return
       }
       try {
         // トランザクション情報作成
         const txParams = {
           gas: web3.utils.toHex(3000000), // ガス代
           from: this.fromAccount, // 送信元
           to: constant.contract_address, // 送信先
           data: contract.methods.transferToken(this.toAccount, this.sendValue).encodeABI(), // コントラクト
         }
         // 秘密鍵でsignする
         const signedTx = await web3.eth.accounts.signTransaction(txParams, this.password)
         // コントラクトにトランザクションを送信
         const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

         alert('送金に成功しました。')
         this.getTokenBalance()
         this.getEtherBalance()
       } catch (e) {
         console.log(e)
         alert("送信時にエラーが発生しました。");
       }
       this.loading = false
     },
     back() {
       this.$router.push('/top')
     },
     // 入力チェック
     validate() {
       const errors = []
       if (!this.fromAccount) errors.push('送信元ユーザが未入力です')
       else if (!Web3.utils.isAddress(this.fromAccount)) errors.push('送信元ユーザのアカウントアドレスが不正です')
       if (!this.toAccount) errors.push('送信先ユーザが未入力です')
       else if (!Web3.utils.isAddress(this.toAccount)) errors.push('送信先ユーザのアカウントアドレスが不正です')
       if (!this.password) errors.push('秘密鍵が未入力です')
       if (!this.sendValue) errors.push('トークン送信量が未入力です')
       if (this.tokenBalance < this.sendValue) error.push('送信トークン量が残高を超えています')
       return errors
     },
   },
}
</script>
