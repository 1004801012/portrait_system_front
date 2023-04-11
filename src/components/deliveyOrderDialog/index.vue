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
        <el-form-item label="运费公司：" prop="expressCompanyId" class="is-required">
          <el-select v-model="submitForm.expressCompanyId" clearable placeholder="请选择快递公司">
            <el-option v-for="item in expressCompanyList" :key="item.id" :value="item.id" :label="item.name">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号：" prop="expressNo" class="is-required">
          <el-input placeholder="请输入快递单号" clearable v-model="submitForm.expressNo"></el-input>
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
import { deepClone } from '@/utils/commonUtils'

export default {
  name: 'msg-box',
  data () {
    return {
      rules,
      loadingFlag: false,
      msgBoxVisible: false,
      submitForm: {
        expressCompanyId: '',
        expressNo: ''
      },
      expressCompanyList: []
    }
  },
  props: {
    visible: Boolean,
    currentData: Object,
    url: String
  },
  methods: {
    //  关闭弹窗
    closeDialog () {
      this.$refs.form.resetFields()
      this.$emit('update:visible', false)
    },
    //  新增/修改提交表单
    submitUser () {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loadingFlag = true
          const data = deepClone(this.submitForm)
          data.id = this.currentData.id
          try {
            const res = await this.$services[this.url]({
              data
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
    },

    async getAllFreightRule () {
      try {
        const res = await this.$services.getExpressCompany({
          method: 'get'
        })
        if (res && res.code === '200') {
          this.expressCompanyList = res.data
        }
      } catch (e) {
        console.log(e)
      }
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
      if (this.visible) {
        this.getAllFreightRule()
      }
    }
  },
  computed: {
    dialogTitle () {
      return '发货'
    }
  }
}
</script>

<style scoped lang="less">
@import "style.less";
</style>
