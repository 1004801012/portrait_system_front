<template>
  <div class="tree-folder">
    <div v-for="(data, index) in treeData" :key="index" class="outside">
      <div class="folder" :class="{ unedit: data.unedit }">
        <p class="agency" :title="data.label" @click="openFolder(data)">
          <i
            v-if="data.children"
            class="iconfont-dmp"
            :class="[data.openType ? 'iconfont-tree-close' : 'iconfont-dmp-tree-open']"></i>
          <i
            v-else
            class="hidden iconfont-dmp"
            :class="[data.openType ? 'iconfont-dmp-tree-close' : 'iconfont-dmp-tree-open']"></i>
          <i
            class="iconfont-dmp"
            :class="[data.openType && data.children ? 'iconfont-dmp-folder-open' : 'iconfont-dmp-folder-close']"></i>
          {{ data.branchCode }}-{{ data.label }}
        </p>
        <p v-if="showEdit" class="edit">
          <i
            v-has-permission="62"
            class="iconfont-dmp iconfont-dmp-editor"
            title="编辑"
            @click="deliverFolderInfo(data, 'edit')"></i>
          <i
            v-has-permission="63"
            class="iconfont-dmp iconfont-dmp-trash"
            title="删除"
            @click="deliverFolderInfo(data, 'trash')"></i>
          <i
            v-has-permission="61"
            class="iconfont-dmp iconfont-dmp-new-add"
            title="新增"
            @click="deliverFolderInfo(data, 'add')"></i>
        </p>
      </div>
      <div v-for="(child, index) in data.children" v-if="data.openType" :key="index" class="inside">
        <div class="folder">
          <p class="agency" :title="child.label" @click="openFolder(child)">
            <i
              v-if="child.children"
              class="iconfont-dmp"
              :class="[child.openType ? 'iconfont-dmp-tree-close' : 'iconfont-dmp-tree-open']"></i>
            <i
              v-else
              class="hidden iconfont-dmp"
              :class="[child.openType ? 'iconfont-dmp-tree-close' : 'iconfont-dmp-tree-open']"></i>
            <i
              class="iconfont-dmp"
              :class="[
                child.openType && child.children ? 'iconfont-dmp-folder-open' : 'iconfont-dmp-folder-close'
              ]"></i>
            {{ child.branchCode }}-{{ child.label }}
          </p>
          <p v-if="showEdit" class="edit">
            <i
              v-has-permission="62"
              class="iconfont-dmp iconfont-dmp-editor"
              title="编辑"
              @click="deliverFolderInfo(child, 'edit')"></i>
            <i
              v-has-permission="63"
              class="iconfont-dmp iconfont-dmp-trash"
              title="删除"
              @click="deliverFolderInfo(child, 'trash')"></i>
            <i
              v-has-permission="61"
              class="iconfont-dmp iconfont-dmp-new-add"
              title="新增"
              @click="deliverFolderInfo(child, 'add')"></i>
          </p>
        </div>
        <tree-folder
          v-if="child.openType"
          :treeData="child.children"
          :showEdit="showEdit"
          @treeFolderInfo="deliverTreeInfo"
          @treeFolderOperate="deliverFolderInfo"></tree-folder>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'TreeFolder',
    data() {
      return {
        msg: 'hello vue',
        selectedBranch: ''
      };
    },
    props: {
      treeData: {
        type: Array,
        default() {
          return [];
        }
      },
      showEdit: {
        type: Boolean,
        default() {
          return false;
        }
      }
    },
    methods: {
      /**
       * 打开目标文件夹
       * @param data
       */
      openFolder(data) {
        if (data.openType) {
          this.$set(data, 'openType', false);
        } else {
          this.$set(data, 'openType', true);
        }
        // 传当前选择的文件夹信息到父组件
        this.selectedBranch = '';
        this.selectedBranch = data.label;
        console.log('openFolder', this.selectedBranch);
        this.$emit('treeFolderInfo', data);
      },
      /**
       * 传递内层文件夹（当前组件的嵌套）信息到父组件
       * @param data
       */
      deliverTreeInfo(data) {
        // 传当前选择的文件夹信息到父组件
        this.selectedBranch = data.label;
        console.log('deliverTreeInfo', this.selectedBranch);
        this.$emit('treeFolderInfo', data);
      },
      /**
       * 传当前选择的文件夹及操作类型到父组件
       * @param data
       * @param type
       */
      deliverFolderInfo(data, type) {
        this.selectedBranch = data.label;
        // console.log('deliverFolderInfo', this.selectedBranch, data);
        this.$emit('treeFolderOperate', data, type);
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @import 'style';
</style>
