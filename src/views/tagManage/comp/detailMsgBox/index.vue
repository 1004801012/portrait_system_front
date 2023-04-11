<template>
  <el-dialog
    :title="dialogTitle"
    v-bind="$attrs"
    v-on="$listeners"
    top="10vh"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="msg-container">
      <el-row>
        <el-col :span="4" class="label">标签名称：</el-col>
        <el-col :span="20" class="value">{{ currentTagData.label_zh_name }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="label">标签英文名：</el-col>
        <el-col :span="20" class="value">{{ currentTagData.label_en_name }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="label">标签类别：</el-col>
        <el-col :span="20" class="value">{{ tagTypeEnum(currentTagData.label_category) }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="label">标签值类型：</el-col>
        <el-col :span="20" class="value">{{ tagLabelValueTypeEnum(currentTagData.label_value_type) }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="label">字典条目：</el-col>
        <el-col :span="20" class="value">{{ currentTagData.dict_entry }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="label">标签定义：</el-col>
        <el-col :span="20" class="value">{{ currentTagData.label_definition }}</el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tagTypeEnum, tagLabelValueTypeEnum } from '@/enum/enum'

@Component({})
export default class EditDialog extends Vue {
  @Prop({
    type: [String, Number],
    default () {
      return ''
    }
  })
  currentId!: string | number

  loadingFlag = false
  currentTagData = {}

  get dialogTitle () {
    return '标签详情'
  }

  tagTypeEnum = tagTypeEnum
  tagLabelValueTypeEnum = tagLabelValueTypeEnum

  handleOpen () {
    this.getTagDetail()
  }

  handleClose () {
    this.closeDialog()
  }

  async getTagDetail() {
    try {
      const res = await this.$services.getTagInfo({
        data: {
          label_id: this.currentId
        },
      })
      if (res && res.error_no === '0') {
       this.currentTagData = res.data
      }
    } catch (e) {
      console.log(e)
    }
  }

  closeDialog () {
    this.currentTagData = {}
    this.$emit('update:visible', false)
    this.$emit('update:currentId', '')
  }
}
</script>

<style scoped lang="less">
@import "style";
</style>
