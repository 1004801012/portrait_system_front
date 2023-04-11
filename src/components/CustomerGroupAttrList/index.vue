<template>
  <div class="customer-attr-list group-list">
    <header>
      <span>属性选择</span>
    </header>
    <div class="attr-tag-tree">
      <el-input size="mini"
                placeholder="输入属性名称快速检索"
                suffix-icon="el-icon-search"
                v-model.trim="inputAttr"
                @input="filterByAttrName">
      </el-input>
      <div class="list">
        <el-tree
          ref="attrList"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          :render-content="renderContent"
          :default-expanded-keys="defaultExpandedKeys"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          @node-click="handleNodeClick"></el-tree>
      </div>
    </div>
  </div>
</template>

<script>
import {callback, debounce} from '@/utils/commonUtils'
import {setXYTagAttrExpandIds, getXYTagAttrExpandIds} from '@/utils/dmpUtils'

export default {
  name: 'CustomerAttrList',
  data () {
    return {
      inputAttr: '',
      treeData: [],
      defaultExpandedKeys: [],
      defaultProps: {
        id: 'id',
        label: 'name',
        children: 'children'
      }
    }
  },
  mounted () {
    this.getTagAttrsByKeyword()
  },
  beforeDestroy () {
    setXYTagAttrExpandIds(JSON.stringify(this.defaultExpandedKeys))
  },
  methods: {
    async getTagAttrsByKeyword () {
      this.loadTagAttrQuery()
    },
    async loadTagAttrQuery () {
      let res = null
      const data = {
        keyword: this.inputAttr
      }
      try {
        res = await this.$services.getLabelList({data})
        res &&
        callback(res, () => {
          console.log("2222" + res.error_no)
          if (res.error_no === "0") {
            this.treeData = res.datas
            this.formatTagAttrs()
          } else {
            return false
          }
        })
      } catch (err) {
        console.log(err)
      }
    },
    /**
     * 标签递归格式化
     * @param arr 必传 用于格式化的数组
     * @return Array
     */
    tagListRecursion (arr) {
      return arr.filter((item, index) => {
        if (item.label_list && item.label_list.length > 0) {
          item.children = this.tagListRecursion(item.children)
          return item.children.length > 0
        } else {
          return !item.id
        }
      })
    },
    formatTagAttrs () {
      const route = this.$route
      console.log('formatTagAttrs this.treeData', this.treeData);
      this.treeData = this.fuckDeal(this.treeData);
      console.log('1111', this.treeData)
      // 冻结对象
      this.treeData = Object.freeze(this.treeData)
      // 模糊搜索过滤
      if (!this.inputAttr) {
        this.$refs.attrList.store.defaultExpandAll = false
        if (route.path.includes('/groupPreview') || route.query) {
          try {
            this.defaultExpandedKeys = JSON.parse(getXYTagAttrExpandIds(this.defaultExpandedKeys))
            console.log("defaultExpandedKeys: " + this.defaultExpandedKeys);
          } catch (err) {
            this.defaultExpandedKeys = []
            console.error(err)
          }
        } else {
          this.defaultExpandedKeys = []
        }
        // if (!Array.isArray(this.defaultExpandedKeys) || !this.defaultExpandedKeys.length) {
        //   const firstTreeData = this.treeData[0]
        //   if (firstTreeData) {
        //     this.defaultExpandedKeys = firstTreeData.children.map((v) => v.id)
        //     this.defaultExpandedKeys.push(firstTreeData.id, firstTreeData.parent_id)
        //   }
        // }
      } else {
        this.$refs.attrList.store.defaultExpandAll = true
      }
    },
    fuckDeal (data) {
      let res = [];
      data.forEach(item => {
        const i = {};
        if (item.label_category === 1) {
          i.name = '用户信息'
        }
        if (item.label_category === 2) {
          i.name = '用户行为'
        }
        if (item.label_category === 3) {
          i.name = '账户信息'
        }
        i.name = item.label_category_name
        i.id = item.label_category
        i.parent_id = 0
        i.label_value_type = ""
        i.dict_entry = ""
        i.dict_item_list = []
        i.children = []
        item.label_list.forEach(subitem => {
          const subi = {};
          subi.name = subitem.label_zh_name
          subi.id = null
          subi.parent_id = item.id
          subi.label_value_type = subitem.label_value_type
          subi.dict_entry = subitem.dict_entry
          subi.dict_item_list = subitem.dict_item_list
          subi.children = []
          i.children.push(subi);
        })
        res.push(i)
      })
      return res
    },
    getExpandedKeys (array) {
      let expandedKeys = []
      Array.isArray(array) && array.map((v) => {
        v.parent_id = v.parent_id || ''
        expandedKeys.push(v.id, v.parent_id && v.parent_id)
      })

      return expandedKeys
    },
    renderContent (h, {node, data, store}) {
      /* eslint-disable */
      if (node.isLeaf) {
        return (
          <span>
              <i class='iconfont-dmp iconfont-dmp-group-add' style='font-size:12px;color:#54A7FD;margin-right:6px;'></i>
            {node.label}
            </span>);
      } else {
        return <span>{node.label}</span>;
      }
    },
    handleNodeExpand(data, node) {
      console.log('handleNodeExpand', data);
      const id = data.id;
      if (Array.isArray(this.defaultExpandedKeys) && this.defaultExpandedKeys.findIndex((e) => e === id) < 0) {
        this.defaultExpandedKeys.push(id);
      }
      console.log('handleNodeExpand', this.defaultExpandedKeys);
    },
    handleNodeCollapse(data, node) {
      console.log('handleNodeCollapse', data);
      const id = data.id;
      this.defaultExpandedKeys = Array.isArray(this.defaultExpandedKeys) && this.defaultExpandedKeys.filter((e) => {
        if (typeof e !== 'string') return;
        return e.indexOf(id) < 0;
      });
      console.log('handleNodeCollapse end', this.defaultExpandedKeys);
    },
    handleNodeClick(data, node) {
      if (node.isLeaf) {
        this.$bus.$emit('attrSelected', data);
      }
    },
    filterByAttrName: debounce(function () {
      this.getTagAttrsByKeyword();
    }, 500),
  },
};
</script>
<style lang="less" rel="stylesheet/less">
@import '~variable';
@import '~mixins';

.customer-attr-list {
  background-color: @colorWhite;
  border: 1px solid #e4e4e4;
  border-radius: 3px;
  width: 360px;
  float: left;
  height: 632px;

  header {
    .flexbox();
    .justify-content(space-between);
    padding: 0 10px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #e4e4e4;

    span {
      display: block;
      font-size: 16px;
      color: @colorBlack;
    }
  }
}

.attr-tag-tree {
  box-sizing: border-box;
  padding: 10px;
  background-color: #fff;
  overflow: hidden;
  height: 590px;

  .el-input--mini .el-input__icon {
    color: @colorBlackAssist;
    font-size: 18px;
  }

  .list {
    margin-top: 10px;
    width: 345px;
    height: 540px;
    overflow: auto;

    &::-webkit-scrollbar-thumb:vertical {
      height: 8px;
      background-color: #ededed;
      -webkit-border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb:horizontal {
      width: 8px;
      background-color: #ededed;
      -webkit-border-radius: 8px;
    }
  }

  .el-tree {
    /*width: 360px;*/
  }

  .el-tree--highlight-current
  .el-tree-node.is-current
  > .el-tree-node__content {
    color: inherit;
    font-weight: normal;
  }
}
</style>
