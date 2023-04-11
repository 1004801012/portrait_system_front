<template>
  <el-dialog :title="dialogTitle"
             :visible.sync="msgBoxVisible"
             :append-to-body="true"
             ref="dialog"
             :close-on-click-modal="false"
             width="600px"
             top="10vh"
             @close="closeDialog">
    <div class="msg-container">
      <el-form ref="form" :model="submitForm" :rules="rules" label-width="120px" status-icon>
        <el-form-item label="用户昵称：" prop="nickname" class="is-required">
          <el-input placeholder="请输入用户昵称" clearable v-model="submitForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="用户状态：" prop="lockedFlag" class="is-required">
          <el-select placeholder="请选择用户状态" v-model="submitForm.lockedFlag">
            <el-option :value="0" label="正常"></el-option>
            <el-option :value="1" label="冻结"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitUser" class="submit-button"
                   v-loading.fullscreen.lock="loadingFlag"
                   element-loading-background="rgba(0, 0, 0, 0.3)"
                   element-loading-text="正在保存，请稍后">确 定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { Dialog, Form, FormItem, Button, MessageBox, Input } from 'element-ui'
import rules from './validatorRules'

export default {
  name: 'msg-box',
  data () {
    return {
      rules,
      passwordFlag: false,
      loadingFlag: false,
      msgBoxVisible: false,
      roleList: []
    }
  },
  props: {
    visible: Boolean,
    state: String,
    submitForm: Object,
    currentRate: Array
  },
  methods: {
    //  关闭弹窗
    closeDialog () {
      this.$refs.form.resetFields()
      this.passwordFlag = false
      this.$emit('update:visible', false)
    },
    //  新增/修改提交表单
    submitUser () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loadingFlag = true
          try {
            const res = await this.$services.updateClientUser({
              data: this.submitForm
            })
            if (res && res.code === '200') {
              MessageBox.alert(`${this.dialogTitle}成功`, '提示', {
                type: 'success',
                confirmButtonText: '确定',
                callback: () => {
                  this.closeDialog()
                  this.$emit('successSubmit')
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
  components: {
    ElFormItem: FormItem,
    ElDialog: Dialog,
    ElForm: Form,
    ElButton: Button,
    ElInput: Input
  },
  watch: {
    visible () {
      this.msgBoxVisible = this.visible
    }
  },
  computed: {
    dialogTitle () {
      const titleObj = {
        add: '新增用户',
        edit: '编辑用户'
      }
      return titleObj[this.state]
    }
  }
}
</script>

<style scoped lang="less">
@import "./style.less";
</style>
