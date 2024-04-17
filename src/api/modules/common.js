export default [
  /**
   * noLoading: 这个接口请求不需要全局loading
   * noNeedOrgId: 这个接口请求不需要 orgId
   */
  // —————————————————————— 常用接口
  // ['apiSsoDomain', ['/setting/oauth/findLoginUriAndSsoDomain', 'post', { noLoading: true, noNeedOrgId: true }]], // 获取登录中心地址

  ['findMessagesCountByUser', ['/message/messageRecord/findMessagesCountByUser', 'post', { noLoading: true, noNeedOrgId: true }]], // 流程列表查询

  ['findModuleApplicationByAbbreviation', ['/setting/sysModuleApplication/findModuleApplicationByAbbreviation', 'post', { noLoading: true, noNeedOrgId: true }]],
  ['apiUploadMaterial', ['/file/fileUpload/uploadMaterial', 'post', { noLoading: true, noNeedOrgId: true }]], // 上传图片地址
  ['apiFileUpload', ['/file/fileUpload/upload', 'post', { noLoading: true, noNeedOrgId: true }]], // 类型（1：文件，2：图片，3：视频，4：音频）
  ['findDistrictTree', ['/setting/district/findDistrictTree', 'post', { noLoading: true, noNeedOrgId: true }]], // 地址信息

  ['findSysMenuByModuleCode', ['/setting/sysMenu/findSysMenuByModuleCode', 'post', { noLoading: true, noNeedOrgId: true }]], // 获取系统菜单
  ['restPassword', ['/user/user/restPassword', 'post'], { noLoading: true, noNeedOrgId: true }], // 重置用户密码

  ['apiUserAuth', ['/user/user/findUserAuth', 'post'], { noLoading: true, noNeedOrgId: true }], // 获取用户权限
  ['findUserInfoById', ['/user/user/findUserInfoById', 'post'], { noLoading: true, noNeedOrgId: true }], // 获取用户信息
  ['apiUserConfig', ['/user/userConfig/findUserConfig', 'post', { noLoading: true, noNeedOrgId: true }]], //  获取用户配置
  ['apiSaveUserMenuSetting4Batch', ['/user/userMenuSetting/saveUserMenuSetting4Batch', 'post', { noLoading: true, noNeedOrgId: true }]], //  获取用户配置
  ['apiUpdateShortcutStatus', ['/user/userSysSetting/updateShortcutStatus', 'post', { noLoading: true, noNeedOrgId: true }]], // 更新用户快捷方式设置
  ['apiUpdateUserPassword', ['/user/user/updateUserPassword', 'post', { noNeedOrgId: true }]], // 更新用户密码
  ['updateModuleUserInfoById', ['/user/user/updateModuleUserInfoById', 'post', { noNeedOrgId: true }]], // 更新用户信息

  ['findOrganizationFilterTree', ['/organization/org/findOrganizationFilterTree', 'post', { noLoading: true }]], // 获取组织树列表
  [
    'findSubstantiveOrganizationTreeByUser',
    ['/organization/org/findSubstantiveOrganizationTreeByUser', 'post', { noLoading: true, noNeedOrgId: true }],
    // 'findSubstantiveOrganizationTreeByUser',['/organization/org/findSubstantiveOrganizationTreeByUser', 'post', { noLoading: true, noNeedOrgId: true }]
  ], // 获取头部切换组织接口
  // 查询当前组织下商品归属组织（用于下拉框）
  ['findByOrgIdListForGoods', ['/goods/goods/findByOrgIdListForGoods', 'post', { noLoading: true, noNeedOrgId: true }]],
]
