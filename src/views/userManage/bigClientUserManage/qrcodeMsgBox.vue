<template>
  <el-dialog
    :title="dialogTitle"
    v-bind="$attrs"
    v-on="$listeners"
    top="10vh"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="qrcode-msg-container">
     <img :src="qrcodeSrc" alt="二维码图片" v-show='showImgFlag' />
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class QrcodeMsgBox extends Vue {
  qrcodeSrc = ''
  showImgFlag = false

  @Prop({
    type: String,
    default () {
      return ''
    }
  })
  clientId!: string

  get dialogTitle () {
    return '快捷下单二维码'
  }

  handleOpen () {
    this.getQrcode()
  }

  handleClose () {
    this.showImgFlag = false
    this.qrcodeSrc = ''
    this.$emit('update:visible', false)
  }

  async getQrcode () {
    try {
      const res = await this.$services.getCurrentClientUserQrcode({
        method: 'get',
        data: {
          clientId: this.clientId
        }
      })
      if (res && res.code === '200') {
        this.qrcodeSrc = res.data
      }
    } catch (e) {
      console.log(e)
    } finally {
      this.showImgFlag = true
    }
  }
}
</script>

<style scoped lang="less">
@import "style";
</style>
