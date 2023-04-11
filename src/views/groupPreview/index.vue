<template>
  <div class="customer-group-picture customer-group-preview">
    <!--属性列表-->
    <CustomerGroupAttrList />
    <!-- 预览 -->
    <div class="group-info preview">
      <div class="container">
        <div class="form-box">
          <div class="form-el">
            <label>查询条件：</label>
            <customer-group-condition
              :id="groupId"
              :is-can-edit="true"
              :conditions="groupCondition"></customer-group-condition>
          </div>
          <el-button size="mini" type="primary" @click="saveAsCustomerGroup">保存为客群 </el-button>
        </div>
        <CustomerGroupResult id="previewYj" ref="groupResult" />
      </div>
    </div>
    <!-- 对话框：系统提示 -->
    <el-dialog title="系统提示" :visible.sync="dialogVisible" center class="customer-group-dialog">
      <el-form>
        <el-form-item>
          <el-input v-model.trim="groupName" placeholder="请输入客群名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" round size="medium" @click="dialogVisible = false">取 消 </el-button>
        <el-button type="primary" round size="medium" @click="saveCustomerGroup">确定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { callback } from '@/common/func';
  import { getGroupConditions } from '@/common/auth';
  import { CustomerGroupCondition, CustomerGroupAttrList, CustomerGroupResult } from '@/components';

  export default {
    data() {
      const { editId = '', groupName = '' } = this.$route && this.$route.query;
      return {
        groupId: 'previewYj',
        editId,
        dialogVisible: false,
        groupCondition: [],
        groupName
      };
    },
    components: {
      CustomerGroupCondition,
      CustomerGroupAttrList,
      CustomerGroupResult
    },
    created() {
      // // 不是预览情况下的编辑
      this.noPreviewEdit = this.editId && this.editId !== 'previewYj';
      this.noPreviewEdit && (this.groupId = this.editId);
      try {
        this.groupCondition = JSON.parse(getGroupConditions()).con;
      } catch (err) {
        console.log('this.groupCondition' + err);
      }
    },
    methods: {
      // 预览的时候保存
      async saveAsCustomerGroup() {
        // 新增
        if (!this.noPreviewEdit) {
          this.dialogControlFunc();
        } else {
          this.saveCustomerGroup();
        }
      },
      dialogControlFunc() {
        this.dialogVisible = !this.dialogVisible;
      },
      checkSpecificKey(str) {
        const specialKey = "[`~!#$^&*()=|{}':;',\\[\\].<>/?~！#￥……&*（）|{}【】‘；：”“'。，、？]‘'";
        for (let i = 0; i < str.length; i++) {
          if (specialKey.indexOf(str.substr(i, 1)) > -1) {
            return false;
          }
        }
        return true;
      },

      async saveCustomerGroup() {
        if (!this.checkSpecificKey(this.groupName)) {
          this.$message({ message: '名称含有特殊字符', showClose: true });
          return;
        }
        let res = null;
        const conditions = getGroupConditions() || '';
        if (!conditions) {
          this.$message({ message: '定义条件不能为空', showClose: true });
          return;
        }
        console.log('=====>', JSON.stringify(conditions));
        if (this.groupName === '') {
          this.$message({ message: '客群名称不能为空', showClose: true });
          return;
        }

        const data = {
          group_name: this.groupName,
          group_condition: conditions
        };

        try {
          // 编辑客群
          if (this.noPreviewEdit) {
            data['group_id'] = this.editId;
            res = await this.$services.customUserGroupMod({ data });
          } else {
            res = await this.$services.customUserGroupAdd({ data });
          }
          res &&
            callback(
              res,
              () => {
                this.$message({
                  message: '保存成功~',
                  showClose: true,
                  duration: 800
                });
                setTimeout(() => {
                  this.$router.push('groupList');
                }, 1000);
              },
              () => {
                this.$message({ message: res.error_info, showClose: true });
              }
            );
        } catch (err) {
          console.log(err);
        }
      }
    }
  };
</script>

<style rel="stylesheet/less" lang="less">
  @import './style.less';
</style>
