// 客群及个体画像接口服务地址：10.139.98.34:9995/project/5a951f8441ec930f5088ab65 Tue Feb 27 2018 17:42:43 GMT+0800 (CST)

export default {
  getTagList: '/portrait_system/getLabelList',  //  标签列表
  getTagInfo: '/portrait_system/getLabelInfo', //  标签详情

  getUserPortraitList: '/portrait_system/getUserPortraitList', //  获取用户画像列表
  getUserPortraitInfo: '/portrait_system/getUserPortraitInfo', //  获取客户画像详情

  getLabelList: '/portrait_system/getLabelListForGroup',  //  获取属性列表
  addGroup: '/portrait_system/postGroup', //  新增客群
  getGroupList: '/portrait_system/getGroupList', //  获取客群列表
  getGroupInfo: '/portrait_system/getGroupInfo', //  获取客群详情
  getGroupUserList: '/portrait_system/getGroupUserList', //  获取客群用户列表
  getGroupView: '/portrait_system/getGroupView', //  获取客群视图
  getTargetGroup: '/portrait_system/getTargetGroup', //  获取目标客群
  postCluster: '/portrait_system/postCluster',  //  执行聚类分析
  getClusterGroupUserList:  '/portrait_system/getClusterGroupUserList', // 获取聚类用户列表
  getMainFeature: '/portrait_system/getMainFeature',  //  特征识别
  crowdDiffusion: '/portrait_system/crowdDiffusion',  //  人群扩散
  postCrowdDiffusionGroup: '/portrait_system/postCrowdDiffusionGroup', //  人群扩散客群保存

  customUserGroupAdd: '/portrait_system/postGroup',
  staticCustomUserGroupQry: ''
}
