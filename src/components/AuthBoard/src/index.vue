<template>
  <div class="auth-board">
    <div class="form-header">
      <p v-if="agencyData.agencyTitle">{{ agencyData.agencyType }}</p>
      <el-checkbox v-else v-model="agencyData.agencyAll" @change="agencyAllFunc">{{
        agencyData.agencyType
      }}</el-checkbox>
    </div>
    <div class="form-body">
      <p v-if="!mainList.length" class="no-data">暂无菜单权限</p>
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="(item, index) in mainList"
          :key="index"
          :class="{ 'hidden-arrow': !item.detail.length }"
          :name="index">
          <template v-slot:title>
            <div class="type">
              <el-checkbox
                v-model="item.baseAll"
                :indeterminate="!item.baseAll && checkSubItemSelected(item.detail)"
                @change="baseAllFunc(item)"
                >{{ item.baseType }}</el-checkbox
              >
            </div>
          </template>
          <div class="form">
            <div v-for="(per, index) in item.detail" :key="index" class="detail">
              <div class="main">
                <el-checkbox
                  v-model="per.checkAll"
                  :indeterminate="!per.checkAll && per.checkList.length > 0"
                  @change="checkAllFunc(per, item)"
                  >{{ per.checkType }}</el-checkbox
                >
              </div>
              <div v-if="per.content.length" class="item">
                <el-checkbox-group v-model="per.checkList" @change="checkItemFunc(per, item)">
                  <el-checkbox v-for="item in per.content" :key="item" :label="item">{{ item }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </el-collapse-item>
        <!--<el-checkbox v-for="(item,index) in mainList" :key="index" v-if="!item.detail.length" v-model="test" @change="baseAllFunc(item)">{{item.baseType}}</el-checkbox>-->
      </el-collapse>
    </div>
    <div class="footer">
      <el-button type="primary" :disabled="btnDisable" @click="authSubmitFunc">提交</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        btnDisable: false // branchNo=1时不可点击提交
      };
    },
    props: {
      agencyData: {
        type: Object,
        default() {
          return {
            agencyTitle: false, // 标题是否可全选
            agencyType: '', // 标题
            agencyCheck: false, // 标题是否为全选状态
            agencyAll: false // 标题绑定值
          };
        }
      },
      mainList: {
        type: Array,
        default() {
          return [
            {
              baseType: '标签管理', // 二级选项
              baseAll: false,
              detail: [
                {
                  checkType: '标签查询', // 三级选项
                  checkAll: false,
                  checkList: [],
                  content: ['标签导出', '标签流程管理查询'] // 四级选项
                }
              ]
            }
          ];
        }
      }
    },
    watch: {
      agencyData: {
        handler(val) {
          this.btnDisable = val.branchNo === 1;
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      /**
       * 提交当前权限内容
       */
      authSubmitFunc() {
        this.$emit('receiveAuthBoard', this.mainList);
      },
      /**
       * 当前机构选项操作
       * agency：一级选项数据
       */
      agencyAllFunc() {
        this.agencyData.agencyCheck = true;
        this.mainList.forEach((item) => {
          item.baseAll = this.agencyData.agencyAll;
          this.baseAllFunc(item);
        });
        this.agencyData.agencyCheck = false;
      },
      /**
       * 二级选项操作
       * base：二级选项数据
       */
      baseAllFunc(base) {
        base.detail.forEach((item) => {
          item.checkAll = base.baseAll === true;
          item.checkList = base.baseAll ? item.content : [];
        });
        // 通过判断是否全选来设置父级选项（一级选项）的状态
        if (!this.agencyData.agencyCheck) {
          this.checkAgencyByBaseFunc();
        }
      },
      /**
       * 三级选项操作
       * data：三级选项数据
       * base：二级选项数据
       */
      checkAllFunc(data, base) {
        console.log('checkAllFunc', data);
        data.checkList = data.checkAll ? data.content : [];
        // 通过判断是否全选来设置父级选项（二级选项）的状态
        this.checkBaseByAllFunc(base);
      },
      /**
       * 四级选项操作
       * data：三级选项数据
       * base：二级选项数据
       */
      checkItemFunc(data, base) {
        console.log(data);
        const checkedCount = data.checkList.length;
        data.checkAll = checkedCount === data.content.length;
        // 通过判断是否全选来设置父级选项（二级选项）的状态
        this.checkBaseByAllFunc(base);
      },
      /**
       * 验证一级选项状态
       * base：二级选项数据
       */
      checkAgencyByBaseFunc() {
        const baseCheckList = [];
        this.mainList.forEach((item) => {
          if (item.baseAll) {
            baseCheckList.push(true);
          }
        });
        this.agencyData.agencyAll = baseCheckList.length === this.mainList.length;
      },
      /**
       * 验证二级选项状态
       * base：二级选项数据
       */
      checkBaseByAllFunc(base) {
        const checkedList = [];
        base.detail.forEach((item) => {
          if (item.checkAll) {
            checkedList.push(true);
          }
        });
        base.baseAll = checkedList.length === base.detail.length;
        this.checkAgencyByBaseFunc();
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
       * 校验一级菜单是否为部分选中状态
       * @param detailList
       */
      checkSubItemSelected(detailList) {
        let checkNum = 0;
        detailList.forEach((item) => {
          if (item.checkAll) {
            checkNum += 1;
          }
          if (item.checkList && item.checkList.length) {
            checkNum += item.checkList.length;
          }
        });
        return checkNum > 0;
      }
    }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './style.less';
</style>
