<template>
  <div class="label-formula-box">
    <div v-show="!userAttrDatas.length && !userAttrMeetDatas.length && !doOrUndoDatas.length" class="tags">
      <a href="javascript:;" class="tag" @click="addUserAttr">用户属性</a>
      <a href="javascript:;" class="tag" @click="addUserAttrMeet">用户属性满足...</a>
      <a href="javascript:;" class="tag" @click="addDoOrUndo">做过(没做过)</a>
    </div>
    <!--用户属性-->
    <template v-if="userAttrDatas && userAttrDatas.length">
      <div v-for="(attr, index) in userAttrDatas" :key="index" class="condition-box">
        <a href="javascript:;" class="close-panel" @click="removeUserAttr(index)"
          ><i class="icon iconfont-dmp iconfont-dmp-close"></i
        ></a>
        <div class="condition">
          <label class="info">属性</label>
          <div>
            <multiselect
              :id="index"
              v-model="attr.select_field"
              :options="userAttrOptions"
              open-direction="bottom"
              placeholder="请选择-可模糊搜索"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeUserAttr">
              <span slot="noResult">无结果</span>
            </multiselect>
            <multiselect
              v-show="attr.has_operator === '1'"
              v-model="attr.select_operator"
              class="operator"
              :options="operatorOptions"
              open-direction="bottom"
              placeholder="请选择"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeUserAttrOperator">
            </multiselect>
            <!--有字典内容则为下拉框，无则为输入框-->
            <template v-if="Array.isArray(attr.child) && attr.child.length">
              <multiselect
                :id="index"
                v-model="attr.select_value"
                class="child-multi"
                :options="attr.child"
                open-direction="bottom"
                placeholder="请选择-可模糊搜索"
                :show-labels="false"
                track-by="value"
                label="label"
                @input="changeUserAttrChild">
              </multiselect>
            </template>
            <template v-else-if="attr.child === ''">
              <el-input
                v-model.trim="attr.value"
                class="times"
                @input="inputUserAttrChild(attr.value, index)"></el-input
              >&nbsp;{{ attr.unit !== '/' ? attr.unit : '' }}
            </template>
          </div>
        </div>
        <div class="or">
          <label>并且</label>
          <span>
            <a href="javascript:;" class="tag" @click="addUserAttr">用户属性</a>
            <a href="javascript:;" class="tag" @click="addUserAttrMeet">用户属性满足...</a>
            <a href="javascript:;" class="tag" @click="addDoOrUndo">做过(没做过)</a>
          </span>
        </div>
      </div>
    </template>
    <!--用户属性满足-->
    <template v-if="userAttrMeetDatas && userAttrMeetDatas.length">
      <div v-for="(attrMeet, index) in userAttrMeetDatas" :key="index" class="condition-box">
        <a href="javascript:;" class="close-panel" @click="removeUserAttrMeet(index)"
          ><i class="icon iconfont-dmp iconfont-dmp-close"></i
        ></a>
        <div class="condition">
          <label class="info">属性满足</label>
          <div>
            <multiselect
              :id="index"
              v-model="attrMeet.select_field"
              :options="userAttrMeetOptions"
              open-direction="bottom"
              placeholder="请选择-可模糊搜索"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeUserAttrMeet">
              <span slot="noResult">无结果</span>
            </multiselect>
            <multiselect
              v-show="attrMeet.has_operator === '1'"
              :id="index"
              v-model="attrMeet.select_operator"
              class="operator"
              :options="operatorOptions"
              open-direction="bottom"
              placeholder="请选择"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeUserAttrMeetOperator">
            </multiselect>
            <!--有字典内容则为下拉框，无则为输入框-->
            <template v-if="Array.isArray(attrMeet.child) && attrMeet.child.length">
              <multiselect
                :id="index"
                v-model="attrMeet.select_value"
                class="child-multi"
                :options="attrMeet.child"
                placeholder="请选择-可模糊搜索"
                open-direction="bottom"
                :show-labels="false"
                track-by="value"
                label="label"
                @input="changeUserAttrMeetChild">
              </multiselect>
            </template>
            <template v-else-if="attrMeet.child === ''">
              <el-input
                v-model.trim="attrMeet.value"
                class="times"
                @input="inputUserAttrMeetChild(attrMeet.value, index)"></el-input>
              <span class="unit">{{ attrMeet.unit !== '/' ? attrMeet.unit : '' }}</span>
            </template>
          </div>
        </div>
        <div class="or">
          <label>并且</label>
          <span>
            <a href="javascript:;" class="tag" @click="addUserAttr">用户属性</a>
            <a href="javascript:;" class="tag" @click="addUserAttrMeet">用户属性满足...</a>
            <a href="javascript:;" class="tag" @click="addDoOrUndo">做过(没做过)</a>
          </span>
        </div>
      </div>
    </template>
    <!--做过没做过-->
    <template v-if="doOrUndoDatas && doOrUndoDatas.length">
      <div v-for="(doUndo, index) in doOrUndoDatas" :key="index" class="condition-box">
        <a href="javascript:;" class="close-panel" @click="removeDoOrUndo(index)"
          ><i class="icon iconfont-dmp iconfont-dmp-close"></i
        ></a>
        <div class="condition">
          <label class="info">做过</label>
          <div>
            <multiselect
              :id="index"
              v-model="doUndo.select_field"
              :options="doOrUndoOptions"
              placeholder="请选择-可模糊搜索"
              open-direction="bottom"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeDoOrUndo">
              <span slot="noResult">无结果</span>
            </multiselect>
            <multiselect
              v-show="doUndo.has_operator === '1'"
              :id="index"
              v-model="doUndo.select_operator"
              class="child-multi"
              :options="operatorOptions"
              open-direction="bottom"
              placeholder="请选择"
              :show-labels="false"
              track-by="value"
              label="label"
              @input="changeDoOrUndoOperator">
            </multiselect>
            <!--有字典内容则为下拉框，无则为输入框-->
            <template v-if="Array.isArray(doUndo.child) && doUndo.child.length">
              <multiselect
                :id="index"
                v-model="doUndo.select_value"
                class="child-multi"
                :options="doUndo.child"
                placeholder="请选择-可模糊搜索"
                open-direction="bottom"
                :show-labels="false"
                track-by="value"
                label="label"
                @input="changeDoOrUndoChild">
              </multiselect>
            </template>
            <template v-else-if="doUndo.child === ''">
              <el-input
                v-model.trim="doUndo.value"
                class="times"
                @input="inputDoOrUndoChild(doUndo.value, index)"></el-input
              >&nbsp;{{ doUndo.unit !== '/' ? doUndo.unit : '' }}
            </template>
          </div>
        </div>
        <div class="or">
          <label>并且</label>
          <span>
            <a href="javascript:;" class="tag" @click="addUserAttr">用户属性</a>
            <a href="javascript:;" class="tag" @click="addUserAttrMeet">用户属性满足...</a>
            <a href="javascript:;" class="tag" @click="addDoOrUndo">做过(没做过)</a>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import {
    setAttrTags,
    getAttrTags,
    setFitTags,
    getFitTags,
    setDoneTags,
    getDoneTags,
    getTagDicts
  } from '@/common/auth';
  import { matchLabelFormulaOperator, callback } from '@/common/func';
  import Multiselect from 'vue-multiselect';

  const blankData = {
    field: '',
    operator: '4',
    value: '',
    field_name: '',
    value_name: '',
    select_field: {},
    select_value: {},
    select_operator: {},
    has_operator: '0',
    desc: '',
    child: [],
    unit: '/'
  };

  export default {
    name: 'LabelFormula',
    props: {
      attrDatas: {
        type: Array,
        default: function () {
          return [];
        }
      },
      fitDatas: {
        type: Array,
        default: function () {
          return [];
        }
      },
      doneDatas: {
        type: Array,
        default: function () {
          return [];
        }
      }
    },
    data() {
      if (!Array.isArray(getAttrTags()) || !getAttrTags()) {
        this.getTagsByType('0');
      }
      if (!Array.isArray(getFitTags()) || !getFitTags()) {
        this.getTagsByType('1');
      }
      if (!Array.isArray(getDoneTags()) || !getDoneTags()) {
        this.getTagsByType('2');
      }
      return {
        userAttrDatas: this.attrDatas || [],
        userAttrMeetDatas: this.fitDatas || [],
        doOrUndoDatas: this.doneDatas || [],
        // 用户属性
        userAttrOptions: getAttrTags() || [],
        // 用户属性满足
        userAttrMeetOptions: getFitTags() || [],
        // 做过（没做过）
        doOrUndoOptions: getDoneTags() || [],
        // 操作符
        operatorOptions: window.CT.OPERATOROPTIONS
      };
    },
    watch: {
      attrDatas() {
        this.userAttrDatas = this.attrDatas;
      },
      fitDatas() {
        this.userAttrMeetDatas = this.fitDatas;
      },
      doneDatas() {
        this.doOrUndoDatas = this.doneDatas;
      }
    },
    components: {
      Multiselect
    },
    methods: {
      getResult() {
        return {
          type_attr: this.getSubmitDatas(this.userAttrDatas),
          type_fit: this.getSubmitDatas(this.userAttrMeetDatas),
          type_done: this.getSubmitDatas(this.doOrUndoDatas)
        };
      },
      getSubmitDatas(datas) {
        return datas.map((item) => {
          return {
            field: item.field,
            value: item.value,
            operator: item.operator,
            desc: item.desc
          };
        });
      },
      clearDatas() {
        this.userAttrDatas = [];
        this.userAttrMeetDatas = [];
        this.doOrUndoDatas = [];
      },
      addUserAttr() {
        this.userAttrDatas.push({ ...blankData });
      },
      addUserAttrMeet() {
        this.userAttrMeetDatas.push({ ...blankData });
      },
      addDoOrUndo() {
        this.doOrUndoDatas.push({ ...blankData });
      },
      removeUserAttr(index) {
        this.userAttrDatas.splice(index, 1);
      },
      removeUserAttrMeet(index) {
        this.userAttrMeetDatas.splice(index, 1);
      },
      removeDoOrUndo(index) {
        this.doOrUndoDatas.splice(index, 1);
      },
      // 属性
      changeUserAttr(val, index) {
        this.handleField(this.userAttrDatas[index], val);
      },
      changeUserAttrOperator(val, index) {
        this.handleOperator(this.userAttrDatas[index], val);
      },
      changeUserAttrChild(val, index) {
        this.handleValue(this.userAttrDatas[index], val);
      },
      inputUserAttrChild(val, index) {
        this.handleInputValue(this.userAttrDatas[index], val);
      },
      // 用户属性满足
      changeUserAttrMeet(val, index) {
        this.handleField(this.userAttrMeetDatas[index], val);
      },
      changeUserAttrMeetOperator(val, index) {
        this.handleOperator(this.userAttrMeetDatas[index], val);
      },
      changeUserAttrMeetChild(val, index) {
        this.handleValue(this.userAttrMeetDatas[index], val);
      },
      inputUserAttrMeetChild(val, index) {
        this.handleInputValue(this.userAttrMeetDatas[index], val);
      },
      // 做过没做过
      changeDoOrUndo(val, index) {
        this.handleField(this.doOrUndoDatas[index], val);
      },
      changeDoOrUndoOperator(val, index) {
        this.handleOperator(this.doOrUndoDatas[index], val);
      },
      changeDoOrUndoChild(val, index) {
        this.handleValue(this.doOrUndoDatas[index], val);
      },
      inputDoOrUndoChild(val, index) {
        this.handleInputValue(this.doOrUndoDatas[index], val);
      },
      handleField(tagDatas, tag) {
        tagDatas['select_field'] = tag;
        tagDatas['select_value'] = {};
        tagDatas['field'] = tag.value;
        tagDatas['field_name'] = tag.label;
        tagDatas['has_operator'] = tag.has_operator;
        tagDatas['child'] = tag.child;
        tagDatas['unit'] = tag.unit;
      },
      handleOperator(tagDatas, val) {
        tagDatas['select_operator'] = val;
        tagDatas['operator'] = val.value;
      },
      handleValue(tagDatas, tag) {
        console.log(tagDatas);
        tagDatas['select_value'] = tag;
        tagDatas['value'] = tag.value;
        tagDatas['value_name'] = tag.label;
        tagDatas['desc'] = `${tagDatas['field_name']} ${matchLabelFormulaOperator(tagDatas['operator'])}${
          tagDatas['value_name']
        }`;
      },
      handleInputValue(tagDatas, val) {
        tagDatas['value'] = val;
        tagDatas['desc'] = `${tagDatas['field_name']} ${matchLabelFormulaOperator(tagDatas['operator'])}${
          tagDatas['value']
        }${tagDatas['unit'] === '/' ? '' : tagDatas['unit']}`;
      },
      async getTagsByType(type) {
        const data = {
          c_group_category: type
        };
        try {
          const res = await this.$services.tagQry({ data });
          res &&
            callback(
              res,
              () => {
                if (type === '0') {
                  // 用户属性
                  setAttrTags(this.getOptions(res.datas));
                } else if (type === '1') {
                  // 用户属性满足
                  setFitTags(this.getOptions(res.datas));
                } else if (type === '2') {
                  // 做过没做过
                  setDoneTags(this.getOptions(res.datas));
                }
              },
              () => {
                this.$message(res.error_info);
              }
            );
        } catch (err) {
          console.log(err);
          this.$message(JSON.stringify(err));
        }
      },
      getOptions(datas) {
        return (
          Array.isArray(datas) &&
          datas.map((item) => {
            const childDicts = getTagDicts().filter((dict) => item.c_tag_category_id === dict.c_tag_category_id);
            const dicts =
              (Array.isArray(childDicts) &&
                childDicts.map((dict) => {
                  return {
                    label: dict.c_dict_prompt,
                    value: dict.c_sub_entry
                  };
                })) ||
              [];
            return {
              label: item.c_tag_category_name,
              value: item.c_tag_english_name,
              has_operator: item.c_has_operator,
              unit: item.c_tag_unit,
              child: dicts.length > 0 ? dicts : ''
            };
          })
        );
      }
    }
  };
</script>
<style lang="less" rel="stylesheet/less">
  @import './style';
</style>
