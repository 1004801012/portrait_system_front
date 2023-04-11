<template>
<el-dialog
  :title="dialogTitle"
  v-bind="$attrs"
  v-on="$listeners"
  top="10vh"
  append-to-body
  @open="handleOpen"
  @close="handleClose"
  :close-on-click-modal="false"
>
  <el-row class="group-row" :gutter="16">
    <el-col :span="8">
      <div class="group-card">
        <div class="card-head">标签分组</div>
        <div class="card-body">
          <div class="query">
            <el-input
              v-model="keyword"
              placeholder="输入标签名称可快速检索"
              suffix-icon="el-icon-search"
              class="query-input"
              size="mini"
            >
            </el-input>
          </div>
          <div class="tagGroup">
            <template v-if="keyword">
              <div class="search-no-data">
                <div class="btn" :class="{'btn__active': curTagGroup === ''}" @click="handleChooseTagGroup('')">全部搜索结果</div>
              </div>
            </template>
            <p class="btn" :class="{'btn__active': curTagGroup === 1}" @click="handleChooseTagGroup(1)">用户信息</p>
            <p class="btn" :class="{'btn__active': curTagGroup === 2}" @click="handleChooseTagGroup(2)">用户行为</p>
            <p class="btn" :class="{'btn__active': curTagGroup === 3}" @click="handleChooseTagGroup(3)">账户信息</p>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="group-card">
        <div class="card-head">选择标签</div>
        <div class="card-body">
          <template v-if="searchList.length">
            <el-checkbox-group
              v-model="selectedTagEnglishNameList"
            >
              <div v-for="item in searchList"
                   :key="item.label_en_name"
                    class="checkbox-item"
              >
                <el-checkbox
                  :label="item.label_en_name"
                >
                  <span>{{ item.label_zh_name }}</span>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </template>
          <NoDataImg v-else datadec="暂无数据"/>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="group-card">
        <div class="card-head">已选择标签<span v-show="selectedTagList.length">（{{ selectedTagList.length || 0 }}）</span></div>
        <div class="group-box group-box-select">
          <ul class="selected-group"
              v-if="Array.isArray(selectedTagList) && selectedTagList.length">
            <li
              v-for="(item, index) in selectedTagList"
              :key="item.label_en_name"
            >
              <span class="text-overflow" :title="item.label_zh_name">{{ item.label_zh_name }}</span>
              <span @click="delSelected(index)"><i class="el-icon-close"/></span>
            </li>
          </ul>
          <NoDataImg v-else datadec="暂无数据"/>
        </div>
      </div>
    </el-col>
  </el-row>
  <div slot="footer">
    <el-button type="ghost" @click="handleClickClose">取消</el-button>
    <el-button type="primary" @click="handleClickSubmit" class="save-btn">保存</el-button>
  </div>
</el-dialog>
</template>

<script>
import { debounce } from '../../utils/commonUtils'
import NoDataImg from '@components/NoDataImg'

export default {
  name: 'TagSelectDialog',
  data() {
    return {
      keyword: '',  //  标签关键字
      curTagGroup: '', //  当前分类
      selectTag: [],
      toChooseTagList: [],
      treeData: [],
      selectedTagEnglishNameList: [],
      searchList: [],
      allTagData: [],
      allTagDataFlag: false
    }
  },
  props: {
    currentSelectTagList: {
      type: Array,
      default: []
    }
  },
  watch: {
    keyword: {
      handler: debounce(function (keyword) {
        this.getTagList(keyword)
      }, 500)
    }
  },
  methods: {
    async handleOpen() {
      this.selectedTagEnglishNameList = this.currentSelectTagList.map(item => item.label_en_name)
      await this.getTagList()
      this.handleChooseTagGroup(1)
    },
    handleClose() {
      this.keyword = ''
      this.curTagGroup = ''
      this.allTagDataFlag = false
      this.allTagData = []
    },

    async getTagList () {
      try {
        const res = await this.$services.getTagList({
          data: {
            label_zh_name: this.keyword,
            label_type: this.curTagGroup
          }
        })
        if (res && res.error_no === '0') {
          this.searchList =  res.datas
          if (!this.allTagDataFlag && this.curTagGroup === '') {
            this.allTagData = res.datas
            this.allTagDataFlag = true
          }
        }
      } catch (e) {
        console.log(e)
      }
    },

    delSelected(i) {
      this.selectedTagEnglishNameList.splice(i, 1)
    },

    handleChooseTagGroup(num) {
      this.curTagGroup = num
      this.getTagList()
    },
    handleClickClose () {
      this.$emit('update:visible', false)
    },
    handleClickSubmit () {
      this.$emit('handleChangeTags', this.selectedTagList)
      this.$emit('update:visible', false)
    }
  },
  computed: {
    dialogTitle () {
      return '添加标签'
    },
    selectedTagList () {
      return this.allTagData.filter(item => this.selectedTagEnglishNameList.includes((item.label_en_name)))
    }
  },
  components: {
    NoDataImg
  }
}
</script>

<style scoped lang="less">
@import "style.less";
</style>
