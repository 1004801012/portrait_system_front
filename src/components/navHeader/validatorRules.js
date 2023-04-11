export default {
  data () {
    const checkPsd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.submitForm.newPsdEncoded) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }

    return {
      rules: {
        oldPsdEncoded: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPsdEncoded: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { pattern: /^(?![A-Z]+$)(?![a-z]+$)(?!\d+$)(?![\W_]+$)\S{6,16}$/, message: '至少包含大小写字母、数字和特殊字符其中两种' }
        ],
        newPsdEncodedAgain: [
          { validator: checkPsd, trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' }
        ]
      }
    }
  }
}
