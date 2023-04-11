<template>
  <el-dialog title="修改密码"
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
          <el-form-item label="旧密码：" prop="oldPsdEncoded">
            <el-input placeholder="请输入旧密码" clearable v-model="submitForm.oldPsdEncoded" show-password maxlength="16"></el-input>
          </el-form-item>
          <el-form-item label="新密码：" prop="newPsdEncoded">
            <el-input placeholder="请输入新密码" clearable v-model="submitForm.newPsdEncoded" show-password maxlength="16"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码：" prop="newPsdEncodedAgain">
            <el-input placeholder="请再次输入新密码" clearable v-model="submitForm.newPsdEncodedAgain" show-password maxlength="16"></el-input>
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
import md5 from 'js-md5'

export default {
  name: 'msg-box',
  data () {
    return {
      submitForm: {
        oldPsdEncoded: '',
        newPsdEncoded: '',
        newPsdEncodedAgain: ''
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
          this.loadingFlag = true
          try {
            const res = await this.$services.changePsd({
              data: {
                oldPwd: md5(this.submitForm.oldPsdEncoded),
                newPwd: md5(this.submitForm.newPsdEncoded)
              }
            })
            if (res && res.code === '200') {
              MessageBox.alert('修改成功', '提示', {
                type: 'success',
                confirmButtonText: '确定',
                callback: () => {
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
    }
  },
  mixins: [rules],
  components: {
    ElFormItem: FormItem,
    ElDialog: Dialog,
    ElForm: Form,
    ElInput: Input,
    ElButton: Button
  }
}
</script>

<style scoped lang="less">
  @import "style.less";
</style>
