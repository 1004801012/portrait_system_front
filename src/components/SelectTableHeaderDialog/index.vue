<template>
  <h-msg-box
    class="group-msg-box"
    v-bind="$attrs"
    width="800"
    height="440"
    :mask-closable="true"
    :zIndex="1002"
    title="添加指标"
    v-on="$listeners"
    @on-open="handleOpen"
    @on-close="handleClose">
    <h-row class="group-row" :gutter="8">
      <h-col span="8">
        <h-card class="group-card group-card-user" dis-hover>
          <p slot="title">指标分组</p>
          <div class="group-box">
            <div class="group-query">
              <h-input v-model.trim="keyword" clearable placeholder="输入指标名称可快速检索" icon="search"></h-input>
            </div>
            <div class="group-attr-list">
              <template v-if="searchList.length && keyword">
                <div class="search-no-data" @click="searchListToChoose">
                  <span>全部搜索结果({{ searchList.length }})</span>
                </div>
              </template>
              <template v-if="Array.isArray(treeData) && treeData.length">
                <el-tree
                  ref="attrList"
                  default-expand-all
                  current-node-key="1"
                  node-key="labelType"
                  :data="treeData"
                  :props="defaultProps"
                  :expand-on-click-node="false"
                  :highlight-current="true"
                  @node-click="handleNodeClick" />
              </template>
              <NoDataImg v-else datadec="暂无数据" />
            </div>
          </div>
        </h-card>
      </h-col>
      <h-col span="8">
        <h-card class="group-card" dis-hover>
          <p slot="title">选择指标</p>
          <div class="group-box group-box-select">
            <h-spin v-if="toChooseTagListLoading" fix>加载中...</h-spin>
            <template v-else>
              <template v-if="toChooseTagList && toChooseTagList.length">
                <h-checkbox-group v-model="selectedTagEnglishNameList" vertical @on-change="checkboxChange">
                  <h-checkbox
                    v-for="item in toChooseTagList"
                    :key="item.labelCode"
                    :disabled="isDisabled(item)"
                    :label="item.labelCode">
                    <span class="text-overflow group-name" :title="item.labelName">{{ item.labelName }}</span>
                  </h-checkbox>
                </h-checkbox-group>
              </template>
              <NoDataImg v-else datadec="暂无数据" />
            </template>
          </div>
        </h-card>
      </h-col>
      <h-col span="8">
        <h-card class="group-card" dis-hover>
          <p slot="title">
            已选择指标<span v-show="selectedTagListElseDefault.length"
              >（{{ selectedTagListElseDefault.length || 0 }}）</span
            >
          </p>
          <h-poptip
            slot="extra"
            confirm
            transfer
            width="208"
            placement="bottom"
            title="您确定要删除所有指标么？"
            cancel-text="否"
            ok-text="是"
            @on-ok="delAllSelected">
            <a v-show="selectedTagListElseDefault.length" href="javascript:;" class="del-selected">
              <h-icon name="trash" />&nbsp;清空</a
            >
          </h-poptip>
          <div class="group-box group-box-select">
            <ul v-if="Array.isArray(selectedTagList) && selectedTagList.length" class="selected-group">
              <li v-for="item in selectedTagList" v-show="!isDisabled(item)" :key="item.labelCode">
                <span class="text-overflow" :title="item.labelName">{{ item.labelName }}</span>
                <span @click="delSelected(item)"><h-icon name="android-close" /></span>
              </li>
            </ul>
            <NoDataImg v-else datadec="暂无数据" />
          </div>
        </h-card>
      </h-col>
    </h-row>
    <div slot="footer">
      <h-button type="ghost" @click="handleClickClose">取消</h-button>
      <h-button type="primary" :loading="submitting" @click="handleClickSubmit">保存</h-button>
    </div>
  </h-msg-box>
</template>

<script>
  import NoDataImg from '@/components/NoDataImg';
  import { callback, debounce } from '@/common/func';

  const BOOLEAN_TYPE = {
    true: '1',
    false: '0'
  };

  export default {
    name: 'SelectTableHeaderDialog',
    props: {
      max: {
        type: Number | String,
        default: 10
      },
      defaultData: Array
    },
    components: {
      NoDataImg
    },
    data() {
      return {
        // 客群分组数据
        treeData: [],
        defaultExpandedKeys: [],
        defaultProps: {
          id: 'labelType',
          label: 'label',
          children: 'children'
        },
        submitting: false,
        // 待选择指标列表
        toChooseTagList: [],
        toChooseTagListLoading: false,
        selectedTagEnglishNameList: [],
        keyword: '',
        searchList: [],
        tagList: [],
        tagListCompleteFlag: false,
        selectedNodeId: null
      };
    },
    computed: {
      selectedTagList() {
        return this.selectedTagEnglishNameList.map((labelCode) =>
          this.tagList.find((item) => labelCode === item.labelCode)
        );
      },
      selectedTagListElseDefault() {
        return this.selectedTagList.filter((item) => item.defaultTableHead !== BOOLEAN_TYPE.true);
      }
    },
    watch: {
      keyword: {
        handler: debounce(function (keyword) {
          this.filterTagList(keyword);
        }, 500)
      }
    },
    mounted() {
      this.getTreeData();
    },
    methods: {
      handleOpen() {
        // 数据回显
        this.selectedTagEnglishNameList = this.defaultData || [];
        try {
          if (this.treeData[0]) {
            this.$refs.attrList.setCurrentKey(this.treeData[0].labelType);
            this.toChooseTagList = this.$refs.attrList.getNode(this.treeData[0].labelType).data.metadata;
          }
        } catch (e) {
          console.log(e);
        }
      },

      /**
       * 是否置灰
       */
      isDisabled(item) {
        return item.defaultTableHead === BOOLEAN_TYPE.true;
      },
      /**
       * 点击关闭查看弹窗
       */
      handleClickClose() {
        this.$emit('input', false);
        this.handleClickReset();
      },

      /**
       * 点击右上角关闭按钮、点击遮罩层，关闭弹窗，清空表单数据
       */
      handleClose() {
        this.handleClickReset();
      },

      /**
       * 清空表单数据，清空表单校验信息
       */
      handleClickReset() {
        this.keyword = '';
      },
      async getTreeData() {
        let res = null;
        const data = {
          labelName: this.keyword
        };
        try {
          res = await this.$services.getProLabelList({
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            data
          });
          res &&
            callback(res, () => {
              this.searchList = [];
              this.treeData = this.tagListRecursion(res.datas);
              this.tagListCompleteFlag = true;
            });
        } catch (err) {
          console.log(err);
        }
      },
      async filterTagList(keyword) {
        this.toChooseTagListLoading = true;
        this.toChooseTagList = [];
        await this.getTreeData();
        this.toChooseTagListLoading = false;
        this.$nextTick(() => {
          if (this.keyword) {
            this.toChooseTagList = this.searchList;
          } else {
            try {
              this.searchList = [];
              this.$refs.attrList.setCurrentKey(this.treeData[0].labelType);
              this.toChooseTagList = this.$refs.attrList.getNode(this.treeData[0].labelType).data.metadata;
            } catch (e) {
              console.log(e);
            }
          }
        });
      },
      searchListToChoose() {
        this.toChooseTagList = this.searchList;
      },
      /**
       * 指标递归格式化
       * @param arr 必传 用于格式化的数组
       * @return Array
       */
      tagListRecursion(arr) {
        return arr.filter((item) => {
          if (item.metadata && item.metadata.length) {
            item.label = `${item.labelType}(${item.count})`;
            item.metadata = this.tagListRecursion(item.metadata);
            if (!this.tagListCompleteFlag) {
              this.tagList.push(...item.metadata);
            }
            if (this.keyword) {
              this.searchList.push(...item.metadata);
            }
          }
          return (item.metadata && !!item.metadata.length) || !!item.id;
        });
      },
      /**
       * 点击保存按钮，校验并提交表单
       */
      handleClickSubmit() {
        this.handleClickClose();
        this.$emit('onSaveTagList', this.selectedTagList);
      },

      /**
       * 清除全部选择的选项
       */
      delAllSelected() {
        this.selectedTagEnglishNameList = this.selectedTagList
          .filter((item) => item.defaultTableHead === BOOLEAN_TYPE.true)
          .map(({ labelCode }) => labelCode);
      },

      /**
       * 删除已选择的指标
       * @param currentTag
       */
      delSelected(currentTag) {
        this.selectedTagEnglishNameList = this.selectedTagEnglishNameList.filter((tag) => tag !== currentTag.labelCode);
      },
      /**
       * 点击客群分组某项，查询出对应的指标列表
       */
      handleNodeClick(data, node) {
        if (node.isLeaf) {
          this.selectedNodeId = data.labelType;
          this.toChooseTagList = data.metadata;
        }
      },
      checkboxChange(data) {
        const length = this.selectedTagListElseDefault.length;
        if (length > this.max) {
          this.$hMessage.info(`最多可自定义${this.max}个表头！`);
          this.selectedTagEnglishNameList.pop();
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  @import './style.less';
</style>
