<template>
  <v-row justify="center">
    <v-col
      cols="12"
      sm="10"
      md="8"
      lg="6"
    >
      <v-card ref="form">
        <v-card-text v-if="mnemonic">
          <v-btn
            color="primary"
            @click="transfer"
          >
            Transfer Token
          </v-btn>
        </v-card-text>
        <v-card-text v-if="mnemonic">
          <v-btn
            color="primary"
            @click="viewAccount"
          >{{ viewText }}</v-btn>
          <v-card-text v-if="viewAccountFlg">
            <h2>{{ mnemonic }}</h2>
          </v-card-text>
        </v-card-text>
        <v-card-text v-if="mnemonic">
          <v-btn
            color="primary"
            @click="logout"
          >
            Logout
          </v-btn>
        </v-card-text>
        <v-card-text v-if="!mnemonic">
          <v-text-field
            ref="mnemonic"
            v-model="input"
            placeholder="mnemonic"
            type="text"
          ></v-text-field>
          <v-btn
            color="primary"
            @click="login"
          >
            Login
          </v-btn>
        </v-card-text>
        <v-card-text v-if="!mnemonic">
          <v-btn
            color="primary"
            @click="register"
          >
            Register
          </v-btn>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { ethers } from 'ethers'
export default {
   data() {
     return {
       input: '',
       mnemonic: '',
       viewText: 'Show Your Mnemonic',
       viewAccountFlg: false,
     }
   },
   async beforeMount() {
     this.mnemonic = await this.$isRegistered() || ''
   },
   methods: {
     async login() {
       localStorage.setItem('mnemonic', this.input)
       this.mnemonic = await this.$isRegistered() || ''
       if (!this.mnemonic) {
         localStorage.removeItem('mnemonic')
         alert('Invalid mnemonic')
         return
       }
     },
     async logout() {
       localStorage.removeItem('mnemonic')
       this.mnemonic = ''
       this.input = ''
     },
     viewAccount() {
       if (this.viewAccountFlg) {
         this.viewAccountFlg = false
         this.viewText = 'Show Your Mnemonic'
       } else {
         this.viewAccountFlg = true
         this.viewText = 'Hide Your Mnemonic'
       }
     },
     async register() {
       if (this.mnemonic) {
         alert('You already registered')
         return
       }

       const wallet = ethers.Wallet.createRandom()
       this.mnemonic = wallet.mnemonic.phrase
       const account_address = wallet.address

       // トークン送信API実行
       const res = await this.$apiRequest('/api/addUser', {
         account_address,
       }, 'post')

       if (!res) {
         alert('Register failed')
         return
       }

       localStorage.setItem('mnemonic', this.mnemonic)
       alert('User Registation Completed!')
     },
     transfer() {
       this.$router.push('/transfer')
     },
   },
}
</script>
