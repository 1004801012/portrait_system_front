<template>
  <el-dialog title="机构名称" :visible.sync="showDialog" class="modal-agency" @close="dialogClose">
    <p class="selected-tip">当前已选：{{ selectData.label }}</p>
    <el-input v-model.trim="keyword" placeholder="输入机构名称快速检索">
      <i slot="prefix" class="iconfont-dmp iconfont-dmp-select" @click="searchFunc"></i>
    </el-input>
    <el-form :inline="true">
      <div class="folder">
        <tree-folder :treeData="treeDataCopy" :showEdit="false" @treeFolderInfo="folderInfoFunc"></tree-folder>
      </div>
    </el-form>
    <div slot="footer" class="footer">
      <el-button type="primary" @click="dialogAgencySelect">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import TreeFolder from '../../TreeFolder';
  import { getBranchStructure } from '@/common/auth';

  export default {
    name: 'DialogAgency',
    data() {
      return {
        keyword: '',
        treeData: [],
        treeDataCopy: [],
        selectData: {}
      };
    },
    props: {
      showDialog: {
        type: Boolean,
        default() {
          return false;
        }
      }
    },
    created() {
      this.treeData = getBranchStructure();
      this.treeDataCopy = this.treeData;
    },
    methods: {
      /**
       * 根据关键字查找机构
       */
      searchFunc() {
        if (this.keyword) {
          this.treeDataCopy = [];
          this.circulateSearchFunc(this.treeData);
        } else {
          this.treeDataCopy = this.treeData;
        }
      },
      /**
       * 循环查找
       */
      circulateSearchFunc(array) {
        array.forEach((item) => {
          if (item.label.indexOf(this.keyword) >= 0) {
            this.treeDataCopy.push(item);
          } else {
            if (item.children && item.children.length) {
              this.circulateSearchFunc(item.children);
            }
          }
        });
      },
      /**
       * 接收权限树点击事件：机构信息
       */
      folderInfoFunc(data) {
        this.selectData = data;
      },
      /**
       * 提交机构选择项
       */
      dialogAgencySelect() {
        console.log('this.selectData', this.selectData);
        this.$emit('agencyCommit', this.selectData);
        this.selectData = {};
      },
      /**
       * 关闭弹窗
       */
      dialogClose() {
        this.$emit('dialogClose');
        this.selectData = {};
      }
    },
    components: {
      'tree-folder': TreeFolder
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import 'style';
</style>
