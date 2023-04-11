<template>
  <section class="login-container">
    <div class="login-form clearfix">
      <div class="login-img-container fl">
        <img :src="imageSrc" />
      </div>
      <div class="login-form-container fl">
        <p class="login-title">{{loginTitle}}</p>
        <p class="login-error">{{loginError}}</p>
        <div class="form-item-container">
          <div class="account-login-container">
            <div class="form-item name-form-item">
              <el-input v-model="username" placeholder="请输入用户名"></el-input>
            </div>
            <div class="form-item password-form-item">
              <el-input v-model="password" placeholder="请输入用户密码" show-password></el-input>
            </div>
          </div>
        </div>
        <div class="form-item">
          <el-button type="primary" @click="login" v-loading.fullscreen.lock="loadingFlag"
                     element-loading-background="rgba(0, 0, 0, 0.3)"
                     element-loading-text="正在登录，请稍后">登录</el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>

import { setToken } from '../../utils/auth'

export default {
  name: 'index',
  data () {
    return {
      username: '',
      password: '',
      loginTitle: 'DMP管理系统',
      loginError: '',
      qrCodeError: '',
      loadingFlag: false,
      imageSrc: require('@/assets/images/basis-login.png'),
      submitFlag: true,
      captcha: '',
      qrcodeImg: '',
      requestNo: ''
    }
  },
  created () {
    const that = this
    document.addEventListener('keyup', function () {
      const key = window.event.keyCode
      if (key === 13 && that.$route.name === 'login' && that.submitFlag) {
        that.login()
      }
    })
  },
  methods: {
    /**
     *  登录
     */
    login () {
      this.loginError = ''
      if (this.username.trim().length === 0) {
        this.loginError = '用户名不能为空'
        return
      } else if (this.password.trim().length === 0) {
        this.loginError = '密码不能为空'
        return
      }
      this.submitFlag = false
      this.$message.success('登录成功')
      const res = require('@/mock/login.json')
      setToken('123321')
      this.$store.commit('user/SET_USER_INFO', res.data)
      this.$router.replace('/index')
    }
  }
}
</script>

<style scoped lang="less">
  @import "style";
</style>
