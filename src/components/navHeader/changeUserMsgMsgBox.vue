<template>
  <el-dialog title="修改个人信息"
             :visible.sync="visible"
             :append-to-body="true"
             ref="dialog"
             width="800px"
             top="10vh"
             :close-on-click-modal="false"
             @close="closeDialog">
    <div class="msg-container">
      <el-form ref="form" :model="submitForm" :rules="rules" label-width="120px" status-icon>
        <div>
          <el-form-item label="昵称：" prop="nickname" class="is-required">
            <el-input placeholder="请输入昵称" clearable v-model="submitForm.nickname"></el-input>
          </el-form-item>
          <el-form-item label="邮箱：" prop="email">
            <el-input placeholder="请输入邮箱" clearable v-model="submitForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话：" prop="mobile">
            <el-input placeholder="请输入电话" clearable v-model="submitForm.mobile"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="changePassword" class="submit-button"  v-loading.fullscreen.lock="loadingFlag"
                   element-loading-background="rgba(0, 0, 0, 0.3)"
                   element-loading-text="正在保存，请稍后">确 定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog, Form, Input, FormItem, Button, MessageBox } from 'element-ui'
import rules from './validatorRules'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'msg-box',
  data () {
    return {
      submitForm: {
        nickname: '',
        email: '',
        mobile: ''
      },
      loadingFlag: false
    }
  },
  props: {
    visible: Boolean
  },
  methods: {
    //  关闭弹窗
    closeDialog () {
      this.$refs.form.resetFields()
      this.$emit('update:visible', false)
    },
    //  新增/修改提交表单
    changePassword () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const data = {}
          Object.keys(this.submitForm).forEach(item => {
            if (this.submitForm[item] !== '') {
              data[item] = this.submitForm[item]
            }
          })
          try {
            const res = await this.$services.currentUserUpdate({
              data
            })
            if (res && res.code === '200') {
              MessageBox.alert('修改成功', '提示', {
                type: 'success',
                confirmButtonText: '确定',
                callback: () => {
                  this.getUserInfoAsync()
                  this.closeDialog()
                }
              })
            } else {
              MessageBox.alert(res.msg, '提示', {
                type: 'error',
                confirmButtonText: '确定'
              })
            }
          } catch (e) {
            MessageBox.alert('请求超时', '提示', {
              type: 'error',
              confirmButtonText: '确定'
            })
          } finally {
            this.loadingFlag = false
          }
        }
      })
    },
    ...mapActions('user', ['getUserInfoAsync'])
  },
  mixins: [rules],
  components: {
    ElFormItem: FormItem,
    ElDialog: Dialog,
    ElForm: Form,
    ElInput: Input,
    ElButton: Button
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    visible () {
      if (this.visible) {
        this.submitForm.nickname = this.userInfo.nickname
        this.submitForm.mobile = this.userInfo.mobile
        this.submitForm.email = this.userInfo.email
      }
    }
  }
}
</script>

<style scoped lang="less">
  @import "style.less";
</style>
