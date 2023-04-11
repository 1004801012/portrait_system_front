<template>
  <div class="cluster-attr-list">
    <div class="attr-tag-tree">
      <div class="list">
        <el-tree node-key="id" :data="data" :props="defaultProps"
                 :render-content="renderContent"
                 :default-expanded-keys="defaultExpandedKeys"
                 :expand-on-click-node="false"
                 :highlight-current="true"
                 @node-click="handleNodeClick"></el-tree>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from '@/utils/commonUtils'

export default {
  name: '',
  props: ['addCount', 'keyword', 'isCrowDif'],
  data () {
    return {
      allData: [],
      allTagData: [],
      chooseData: [],
      data: [],
      defaultExpandedKeys: [],
      defaultProps: {
        id: 'id',
        children: 'children',
        label: 'label'
      }
    }
  },
  created () {
  },
  mounted () {
    this.loadAagAttrs()
  },
  activated () {
  },
  watch: {
    addCount: function (val) {
      this.loadAagAttrs()
    },
    keyword: function (val) {
      this.filterByKeyword()
    }
  },
  methods: {
    async loadAagAttrs () {
    },
    filterByKeyword: debounce(function () {
      this.loadAagAttrs()
    }, 500),
    filterResFunc (commonList) {
      this.allData = commonList || []
      this.allTagData = []
      this.data = []
      if (commonList.length > 0) {
        let that = this
        commonList.forEach(function (item, i) {
          let obj = {}
          obj.label = item.name
          if (item.children && item.children.length > 0) {
            obj.children = []
            item.children.forEach(function (items, index) {
              let childObj = {}
              childObj.label = items.name
              childObj.second = index
              obj.children.push(childObj)
              if (items.children.length > 0) {
                items.children.forEach(function (t) {
                  let objs = {}
                  objs.c = t.c_tag_category_name
                  objs.e = t.c_tag_english_name
                  that.allTagData.push(objs)
                })
              }
            })
            if (obj.children.length > 0) {
              obj.children.forEach(function (key) {
                key.first = i
              })
            }
          }
          that.data.push(obj)
          console.log('data', that.data)
          console.log('allTagData', that.allTagData)
        })
      }
      // 过滤空孩子节点
      if (this.data.length > 0) {
        for (let j = 0; j < this.data.length; j++) {
          let v = this.data[j]
          if (!v.children || (v.children && v.children.length === 0)) {
            this.data.splice(j--, 1)
          }
        }
      }
      // 模糊搜索过滤
      if (!this.keyword) {
        const firstTreeData = this.data[0]
        this.defaultExpandedKeys = firstTreeData.children.map((v) => v.id)
        this.defaultExpandedKeys.push(firstTreeData.id, firstTreeData.parent_id)
      }
      //        let initArr = this.allData[0].children[0].children || [];
      //        this.showFunc(initArr);
      this.showFunc()
    },
    handleNodeClick (data, node) {
      if (node.isLeaf) {
        if (node.data.label === this.allData[node.data.first].children[node.data.second].name) {
          let showData = this.allData[node.data.first].children[node.data.second].children || []
          this.showFunc(showData)
        }
      }
    },
    showFunc (showData) {
      let arr1 = [] // 中文
      let arr2 = [] // 中英
      if (showData && showData.length > 0) {
        showData.forEach(function (item) {
          arr1.push(item.c_tag_category_name)
          let obj = {}
          obj.c = item.c_tag_category_name
          obj.e = item.c_tag_english_name
          obj.dic = item.c_dict_entry
          arr2.push(obj)
        })
      }
      this.chooseData = arr1
      this.$emit('submenu', arr1, this.allTagData, arr2)
    },
    renderContent (h, { node, data, store }) {
      /* eslint-disable */
        if (node.isLeaf) {
          return (< span > < i class= "iconfont-dmp iconfont-dmp-group-add" style = "font-size:12px;color:#54A7FD;margin-right:6px;" / > {node.label}</span >);
        } else {
          return <span> {node.label}</span>;
        }
      }
    }
  };
</script>
<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
