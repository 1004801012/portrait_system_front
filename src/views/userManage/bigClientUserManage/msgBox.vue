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
        <el-form-item label="客户名称：" prop="clientName" class="is-required">
          <el-input placeholder="请输入客户名称：" clearable v-model="submitForm.clientName"></el-input>
        </el-form-item>
        <el-form-item label="联系人名称：" prop="contact" class="is-required">
          <el-input placeholder="请输入联系人名称：" clearable v-model="submitForm.contact"></el-input>
        </el-form-item>
        <el-form-item label="联系方式：" prop="contactWay" class="is-required">
          <el-input placeholder="请输入联系方式：" clearable v-model="submitForm.contactWay"></el-input>
        </el-form-item>
        <el-form-item label="用户状态：" prop="lockedFlag" class="is-required">
          <el-select placeholder="请选择用户状态" v-model="submitForm.lockedFlag">
            <el-option :value="0" label="正常"></el-option>
            <el-option :value="1" label="冻结"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址：">
          <el-input placeholder="请输入地址：" clearable v-model="submitForm.details">
            <el-button slot="append" icon="el-icon-search" @click="handleSearchCity"></el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="map-container" id='map'></div>
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
import { deepClone } from '@windraxb/cloud-utils'

export default {
  name: 'msg-box',
  data () {
    return {
      rules,
      passwordFlag: false,
      loadingFlag: false,
      msgBoxVisible: false,
      roleList: [],
      map: {},
      marker: {},
      mapInitZoom: 12,
      mapInitCenter: [],
      latitude: 0,
      longitude: 0,
      geocoder: {}
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
          const data = deepClone(this.submitForm)
          data.latitude = this.latitude || ''
          data.longitude = this.longitude || ''
          try {
            const url = this.state === 'add' ? 'addBigClientUser' : 'updateBigClientUser'
            const res = await this.$services[url]({
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
            console.log(e)
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
    //  初始化地图
    initMap () {
      const initData = {
        resizeEnable: true,
        zoom: this.mapInitZoom
      }
      if (this.state !== 'add' && this.longitude !== '' && this.latitude !== '') {
        initData.center = this.mapInitCenter
      }
      this.map = new window.AMap.Map('map', initData)

      window.AMap.plugin('AMap.Geocoder', () => {
        this.geocoder = new window.AMap.Geocoder({})
      })

      if (this.state !== 'add' && this.longitude !== '' && this.latitude !== '') {
        this.marker = new window.AMap.Marker({
          position: new window.AMap.LngLat(this.longitude, this.latitude)
        })
        this.map.add(this.marker)
      }

      this.map.on('click', (e) => {
        const lnglat = e.lnglat
        this.map.remove(this.marker)
        this.marker = new window.AMap.Marker({
          position: new window.AMap.LngLat(lnglat.getLng(), lnglat.getLat())
        })
        this.map.add(this.marker)
        this.latitude = lnglat.getLat()
        this.longitude = lnglat.getLng()
      })
    },
    async handleSearchCity () {
      try {
        const res = await this.$services.searchLocation({
          data: {
            address: this.submitForm.details,
            key: 'e108433bd69d78f749cf319b36d93169'
          },
          prefix: 'MAP',
          method: 'get'
        })
        if (res && res.infocode === '10000') {
          const lnglat = res.geocodes[0].location
          const lnglatArr = lnglat.split(',')
          this.map.remove(this.marker)
          this.marker = new window.AMap.Marker({
            position: new window.AMap.LngLat(lnglatArr[0], lnglatArr[1])
          })
          this.map.add(this.marker)
          const position = new window.AMap.LngLat(lnglatArr[0], lnglatArr[1])
          this.map.setCenter(position)
          this.latitude = lnglatArr[1]
          this.longitude = lnglatArr[0]
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
      if (this.msgBoxVisible) {
        this.$nextTick(() => {
          this.longitude = this.submitForm.longitude
          this.latitude = this.submitForm.latitude
          this.mapInitCenter = [this.longitude, this.latitude]
          this.initMap()
        })
      }
    }
  },
  computed: {
    dialogTitle () {
      const titleObj = {
        add: '新增大客户',
        edit: '编辑大客户'
      }
      return titleObj[this.state]
    }
  }
}
</script>

<style scoped lang="less">
@import "./style.less";
</style>
