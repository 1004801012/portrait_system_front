<template>
  <div class="customer-group-label-formula">
    <div class="condition-list">
      <div v-for="(item, i) in groupConditionDatas" :key="i" class="condition-box">
        <div class="box-wrap">
          <div v-for="(formula, j) in item.subs" class="condition">
            <div class="wrap">
              <a href="javascript:;" class="close-panel" @click="removeUserAttr(i, j)">
                <i class="icon iconfont-dmp iconfont-dmp-close"></i>
              </a>
              <span class="name">{{ formula.name }}</span>
              <multiselect
                v-if="formula.dicts && formula.dicts.length > 0"
                v-model="formula.optionValue"
                :options="formula.options"
                open-direction="bottom"
                placeholder="请选择-可模糊搜索"
                :show-labels="false"
                track-by="c_dict_prompt"
                class="operator"
                label="c_dict_prompt">
                <span slot="noResult">暂无数据</span>
              </multiselect>
              <div v-else>
                <multiselect
                  v-if="formula.c_has_operator === '1' || formula.c_has_operator === '2'"
                  v-model="formula.operatorValue"
                  class="operator"
                  :options="operators"
                  open-direction="bottom"
                  placeholder="请选择"
                  :show-labels="false"
                  track-by="value"
                  label="label">
                  <span slot="noResult">暂无数据</span>
                </multiselect>
                <el-date-picker
                  v-if="formula.c_has_operator === '2'"
                  v-model="formula.inputValue"
                  class="input"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyyMMdd"
                  placeholder="选择日期">
                </el-date-picker>
                <template v-else>
                  <el-input
                    v-model.trim="formula.inputValue"
                    class="input"
                    :placeholder="formatPlaceholder(formula)"
                    @keyup.native="onInputValChange(formula)"
                    @blur="onInputValChange(formula)"></el-input>
                </template>
                <span v-show="formula.c_tag_unit != '/'" class="unit">{{ formula.c_tag_unit }}</span>
              </div>
            </div>
            <div v-show="item.subs.length > 1 && j != item.subs.length - 1" class="or">
              <span>或者</span>
            </div>
          </div>
          <div v-if="item.subs.length < 5" class="or">
            <el-checkbox v-model="item.orChecked" @change="orChecked(i)"
              >或者<span v-show="item.subs.length > 1 && item.orChecked" class="total-count"
                >{{ item.subs.length }}/4</span
              >
            </el-checkbox>
          </div>
          <div v-if="item.subs.length < 5 && i === orCheckedIndex" class="info">请从左侧选择属性～</div>
        </div>
        <div class="and">并且</div>
      </div>
      <div v-show="groupConditionDatas.length === 0" class="condition-box">
        <div class="box-wrap">
          <div class="condition">
            <div class="wrap">
              <div class="info">请从左侧选择属性～</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {callback} from '@/common/func'
  import {setTagDicts, getTagDicts, setTagAttrQuery, getTagAttrQuery} from '@/common/auth'
  import Multiselect from 'vue-multiselect'

  export default {
    props: {
      conditionDatas: {
        type: Array,
        default () {
          return []
        }
      }
    },
    data () {
      return {
        operators: window.CT.OPERATOROPTIONS,
        groupConditionDatas: [],
        orCheckedIndex: -1
      }
    },
    watch: {
      conditionDatas: {
        handler: function (val) {
          if (Array.isArray(val) && val.length) {
            Promise.all([
              this.getLabelDict(),
              this.loadTagAttrs()
            ]).then(() => {
              this.covertGroupConditionDatas(val)
            })
          }
        },
        immediate: true
      }
    },
    mounted () {
      this.$bus.$on('attrSelected', this.handleAttrSelected)
    },
    activated () {
    },
    methods: {
      handleAttrSelected (item) {
        // 下拉框属性数组，只有 c_has_operator = '0' 才有值
        const options = this.getOptions(item)

        // 公式对象
        const obj = { ...item, options: options, // 下拉框属性值数组，c_has_operator = '0' 才有值
        optionValue: '', // 属性值
        operatorValue: this.operators[1], // 比较操作符好，默认为 =, operatorValue = 4
        inputValue: '' // 输入框内容，如果没有输入框，则为 ''
      }

        // [
        //    {subs:[{}, {}], orChecked: false},
        //    {subs:[{}], orChecked: false}
        // ]
        const checkedIndex = this.getCheckedIndex()
        if (checkedIndex >= 0) {
          const currentChecked = this.groupConditionDatas[checkedIndex]
          const subs = currentChecked.subs
          const subsLen = subs.length
          // 一组‘且’里最多5个条件（‘或，非’）
          if (subs.length < 5) {
            // 添加到最后一个的时候，再添加就添加到下一组‘且’的条件里
            if (subsLen === 4) {
              currentChecked.orChecked = false
            }
            subs.push(obj)
          }
        } else {
          const formula = {subs: [obj], orChecked: false}
          this.groupConditionDatas.push(formula)
        }
        //        console.log('this.groupConditionDatas', this.groupConditionDatas)
        // 保持滚动条滚到最后
        const formBox = document.querySelector('.customer-group-add .container')
        formBox.scrollTo(0, formBox.scrollHeight)
      },
      getOptions (item) {
        const options = getTagDicts().filter(
        (dict) => item.c_tag_category_id === dict.c_tag_category_id
      )
        return options
      },
      getTagAttrByName (tagEnglishName) {
        const tagAttrList = getTagAttrQuery() || []
        const getLeaf = (node, leafs) => {
          if (node.children && node.children.length > 0) {
            for (const sub of node.children) {
              getLeaf(sub, leafs)
            }
          } else {
            leafs.push(node)
          }
        }
        const allTagAttrs = []
        for (const node of tagAttrList) {
          const leafs = []
          getLeaf(node, leafs)
          allTagAttrs.push(...leafs)
        }
        let find = {}
        for (const attr of allTagAttrs) {
          if (attr.c_tag_english_name === tagEnglishName) {
            find = attr
            break
          }
        }
        return find
      },
      clearGroupConditionDatas () {
        this.groupConditionDatas = []
        this.getTagAttrByName('registered')
      },
      orChecked (index) {
        this.groupConditionDatas.map((e, i) => {
          if (index !== i) e.orChecked = false
        })
        this.orCheckedIndex = index
        // 用来控制显示‘请从左侧选择属性～’
        if (this.groupConditionDatas[index].orChecked === false) {
          this.orCheckedIndex = -1
        }
      },
      getCheckedIndex () {
        let index = -1
        for (let i = 0; i < this.groupConditionDatas.length; i++) {
          const item = this.groupConditionDatas[i]
          if (item.orChecked) {
            index = i
          }
        }
        return index
      },
      removeUserAttr (i, j) {
        const formulas = this.groupConditionDatas[i].subs
        if (formulas.length > 1) {
          formulas.splice(j, 1)
        } else {
          this.groupConditionDatas.splice(i, 1)
        }
      },
      checkInputsEmpty () {
        let hasEmpty = false

        for (const group of this.groupConditionDatas) {
          for (const formula of group.subs) {
            //
            if (formula.dicts && formula.dicts.length > 0) {
              if (formula.optionValue === '') {
                hasEmpty = true
              }
            } else {
              if (formula.c_has_operator === '1' || formula.c_has_operator === '2') {
                if (formula.operatorValue === '' || formula.inputValue === '') {
                  hasEmpty = true
                }
              } else {
                if (formula.inputValue === '') {
                  hasEmpty = true
                }
              }
            }
          }
        }
        return hasEmpty
      },
      getGroupConditionDatas () {
        console.log('getGroupConditionDatas', this.groupConditionDatas)
        const dict = {
          ver: '2.0',
          con: []
        }
        for (const group of this.groupConditionDatas) {
          if (group.subs.length === 1) {
            const formula = group.subs[0]
            dict.con.push(this.convertFormulaData(formula, true))
          } else {
            const subDict = {op: 1, sub: []}
            for (let i = 0; i < group.subs.length; i++) {
              const formula = group.subs[i]
              subDict.sub.push(this.convertFormulaData(formula, i === 0))
            }
            dict.con.push(subDict)
          }
        }
        console.log('this.groupCondition', JSON.stringify(dict))
        return dict
      },
      /**
         * 转换后的结构如下：
         * [
         {"op":1,
          "sub":[
             {"op":1,"fd":"client_name","cmp":4,"val":"hello","desc":"客户姓名 = hello","c_has_operator": "1"},
             {"op":0,"fd":"client_birthday","cmp":2,"val":"2018-04-01","desc":"出生日期 < 2018-04-01","c_has_operator": "1"}]
             },
         {"op":1,"fd":"branch_name","cmp":4,"val":"ppppppp","desc":"营业部 = ppppppp"}
         ]
         */
      convertFormulaData (formula, isFirst = true) {
        const op = isFirst ? 1 : 0
        const fd = formula.c_tag_english_name
        const hasOperator = formula.c_has_operator
        let cmp = 4
        let cmpLabel = ' = '
        if (formula.operatorValue) {
          cmp = parseInt(formula.operatorValue.value)
        }
        // 兴业特殊处理
        // 客户分组类别 customer_grouping_category
        // 客户分组明细 customer_grouping_details
        if (fd === 'customer_grouping_category' || fd === 'customer_grouping_details') {
          cmp = 6
          cmpLabel = ' 包含 '
        }
        // 模糊查询
        if (hasOperator === '3') {
          cmp = 7
          cmpLabel = ' 包含 '
        }
        let val = formula.inputValue
        //      console.log('formula', formula)
        let desc = ''
        if (formula.dicts && formula.dicts.length > 0) {
          val = formula.optionValue.c_sub_entry
          desc = formula.name + cmpLabel + formula.optionValue.c_dict_prompt
        } else {
          // 描述
          if (formula.operatorValue.label && hasOperator !== '3') {
            desc = formula.name + ' ' + formula.operatorValue.label + ' ' + val
          } else {
            desc = formula.name + cmpLabel + val
          }
          // val 转换成 值，比如 val = 非自然人，那么转换后的值为 2
          const options = formula.options
          if (options) {
            for (const option of options) {
              if (option.c_dict_prompt === val) {
                val = option.c_sub_entry
                break
              }
            }
          }
        }
        desc += formula.c_tag_unit != '/' ? formula.c_tag_unit : ''
        return {op, fd, cmp, val, desc, c_has_operator: hasOperator}
      },
      covertGroupConditionDatas (list) {
        //      console.log('covertGroupConditionDatas', list)
        const getOperator = (operator) => {
          for (const obj of this.operators) {
            if (obj.label === operator) {
              return obj
            }
          }
          return this.operators[1]
        }

        const findDictFromLabel = (dicts, label) => {
          if (!dicts) {
            return null
          }
          for (const dict of dicts) {
            if (dict.c_dict_prompt === label || dict.c_sub_entry === label) {
              return dict
            }
          }
          return null
        }
        //        let data = `{"ver":"2.0","con":[{"op":1,"sub":[{"op":1,"fd":"client_name","cmp":4,"val":"hello","desc":"客户姓名 = hello","c_has_operator":"0"},{"op":0,"fd":"client_birthday","cmp":2,"val":"2018-04-01","desc":"出生日期 < 2018-04-01","c_has_operator":"1"}]},{"op":1,"fd":"branch_name","cmp":4,"val":"ppppppp","desc":"营业部 = ppppppp","c_has_operator":"0"}]}`
        //        let dict = JSON.parse(data)
        //        let list = dict.con
        const datas = []
        for (let i = 0; i < list.length; i++) {
          const item = list[i]
          if (item.sub && item.sub.length > 0) {
            const dict = {
              orChecked: false,
              subs: []
            }
            for (const sub of item.sub) {
              const fd = sub.fd
              const desc = sub.desc
              const val = sub.val
              const name = desc.split(' ')[0]
              const operator = getOperator(desc.split(' ')[1])
              const label = val
              console.log(val, label)
              const attr = this.getTagAttrByName(fd)
              console.log()
              const inputValue = label // attr.c_has_operator + '' === '0' ? label : ''
              //            console.log('has sub inputValue', inputValue)
              const subDict = {
                name: name,
                c_tag_english_name: fd,
                c_has_operator: attr.c_has_operator,
                inputValue: inputValue,
                operatorValue: operator,
                c_tag_unit: attr.c_tag_unit,
                c_tag_value_type: attr.c_tag_value_type,
                dicts: attr.dicts || [],
                options: attr.dicts,
                optionValue: findDictFromLabel(attr.dicts, label)
              }
              dict.subs.push(subDict)
            }
            datas.push(dict)
          } else {
            const fd = item.fd
            const desc = item.desc
            const val = item.val
            const name = desc.split(' ')[0]
            const operator = getOperator(desc.split(' ')[1])
            const label = val
            const attr = this.getTagAttrByName(fd)
            console.log('attr', fd, attr)
            const inputValue = label // attr.c_has_operator + '' === '0' ? label : ''
            //          console.log('inputValue', inputValue)
            const dict = {
              orChecked: false,
              subs: [
                {
                  name: name,
                  c_tag_english_name: fd,
                  c_has_operator: attr.c_has_operator,
                  inputValue: inputValue,
                  operatorValue: operator,
                  c_tag_unit: attr.c_tag_unit,
                  c_tag_value_type: attr.c_tag_value_type,
                  dicts: attr.dicts || [],
                  options: attr.dicts,
                  optionValue: findDictFromLabel(attr.dicts, label)
                }
              ]
            }
            datas.push(dict)
          }
        }
        this.groupConditionDatas = datas
      },
      // 根据标签值不同类型来判定操作符
      getOperators (formula) {
        if (this.project !== 'xy') return this.operators
        // 兴业版本特殊处理
        // 拷贝一份
        const operators = [].concat(window.CT.OPERATOROPTIONS)
        const {c_tag_value_type = ''} = formula
        const contains = {
          value: '6',
          label: '包含'
        }
        if (c_tag_value_type.toLocaleLowerCase() === 'i') {
          operators.push(contains)
        }
        return operators
      },
      // 获取标签字典项,并进行缓存
      async getLabelDict () {
        console.log('getLabelDict')
        if (!Array.isArray(getTagDicts()) || !getTagDicts().length) {
          const data = {}
          let res = null
          try {
            // 兴业标签字典
            if (window.CT.IS_XY) {
              res = await this.$services.tagDictQuery({data})
            } else {
              res = await this.$services.tagDictQry({data})
            }
            res && callback(res, () => {
              // 中泰二期
              if (!window.CT.IS_XY) {
                if (Array.isArray(res.datas) && res.datas.length) {
                  res.datas.forEach((v) => {
                    if (v.c_tag_english_name === 'branch_name' || v.c_tag_english_name === 'branch_code') {
                      v.customer_dict_label = v.c_sub_entry + v.c_dict_prompt
                    }
                  })
                }
              }
              setTagDicts(res.datas)
            }, () => {
              this.$message({message: res.error_info, showClose: true})
            })
          } catch (err) {
            console.log(err)
          }
        }
      },
      // 缓存标签查询，用于客群相关需要
      async loadTagAttrs () {
        console.log('loadTagAttrs')
        if (!Array.isArray(getTagAttrQuery()) || !getTagAttrQuery().length) {
          let res = null
          const data = {}
          try {
            res = await this.$services.tagAttrQry({data})
            res &&
              callback(res, () => {
                setTagAttrQuery(res.data && res.data.children)
              }, () => {
                this.$message({message: res.error_info, showClose: true})
              })
          } catch (err) {
            console.log(err)
          }
        }
      },
      formatPlaceholder (formula) {
        if (formula.c_has_operator === '3') {
          return '模糊匹配'
        }
        if (formula.c_tag_value_type === 'd') {
          return '请输入数字'
        }
        if (formula.c_tag_value_type === 'l') {
          return '请输入整数'
        }
        return '请输入内容'
      },
      onInputValChange (formula) {
        // console.log('onInputValChange', formula);
        if (formula.c_tag_value_type === 'd' || formula.c_tag_value_type === 'l') {
          formula.inputValue = formula.inputValue.replace(/[^-?\d.]/g, '')
          if (formula.c_tag_value_type === 'l') {
            formula.inputValue = formula.inputValue.replace(/\./g, '')
          }
        }
      }
    },
    components: {
      Multiselect
    },
    beforeDestroy () {
      this.$bus.$off('attrSelected', this.handleAttrSelected)
    }
  }
</script>

<style lang="less" rel="stylesheet/less">
  @import 'style';
</style>
