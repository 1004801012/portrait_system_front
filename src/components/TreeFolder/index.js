/**
 * Created by tengteng on 18/2/6.
 */

export { default } from './src/index.vue';

/**
 * 使用示例
 * <tree-folder :treeData="treeDataCopy" :showEdit="true"></tree-folder>
 *
 * 参数
 * showEdit为是否可显示右侧编辑按键，默认为false
 * treeDataCopy为数据源数组，key分别为label、children
 * treeDataCopy = [{
 *    label: '上海分公司',
 *    children: [{label: '营业部1'}, {label: '营业部2'}]}
 * ]
 */
