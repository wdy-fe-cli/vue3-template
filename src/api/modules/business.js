export default [
  /**
   * noLoading: 这个接口请求不需要全局loading
   * noNeedOrgId: 这个接口请求不需要 orgId
   */
  // —————————————————————— 常用接口
  // 店铺
  ['findStoreTreeByOrgId', ['/organization/org/findStoreTreeByOrgId', 'post', { noLoading: true }]], // 查找店铺列表
  ['findOrganizationToStore', ['/organization/org/findOrganizationToStore', 'post', { noNeedOrgId: true, noLoading: true }]], // 查询当前组织下的关联店铺及店铺的顶级组织
  // 分类管理
  ['findCategoryTree', ['/goods/category/findCategoryTree', 'post', { noLoading: true }]], // 查询分类列表(树形结构)
  ['findCategoryList', ['/goods/category/findPageList', 'post']], // 查询分类列表
  ['findCategoryById', ['/goods/category/findById', 'post', { noLoading: true }]], // 查询分类详情
  ['insertCategory', ['/goods/category/insert', 'post', { noLoading: true }]], // 新增分类
  ['modifyCategory', ['/goods/category/modify', 'post', { noLoading: true }]], // 编辑分类
  ['deleteCategory', ['/goods/category/deleteBatch', 'post', { noLoading: true }]], // 分类批量删除
  ['modifySubCategoryParentId', ['/goods/category/modifySubCategoryParentId', 'post', { noLoading: true }]], // 二级分类批量迁移
  ['statiscategoryFindList', ['/goods/statiscategory/findList', 'post', { noLoading: true }]], // 统计分类列表
  // ['categoryOptionsFindList', ['/goods/statiscategory/findList', 'post', { noLoading: true }]], // 商品类型列表
  ['importCateogrys', ['/goods/category/importCateogrys', 'post', { noLoading: true, noNeedOrgId: true }]], // 导入

  // 商品管理
  ['findGoodsList', ['/goods/goods/findPageList', 'post']], // 分页查询商品列表
  ['findPageListByStore', ['/goods/goods/findPageListByStore', 'post', { noNeedOrgId: true }]], // 查询店铺营业点上架的商品列表（分页）
  ['findApplyingPageList', ['/goods/goods/findApplyingPageList', 'post']], // 审核列表
  ['findApplyingGoodsById', ['/goods/goods/findApplyingGoodsById', 'post']], // 待上架商品详情
  ['deleteApplyingGoodsById', ['/goods/goods/deleteApplyingGoodsById', 'post']], // 待上架商品删除
  ['findGoodsAndSizePageList', ['/goods/goods/findGoodsAndSizePageList', 'post', { noLoading: true }]], // 分页查询商品（规格）列表 - 【套餐选择商品弹出】
  ['updateGoodsSequence', ['/goods/goods/updateGoodsSequence', 'post']], // 查询详情
  ['findGoodsById', ['/goods/goods/findById', 'post']], // 查询详情
  ['insertGoods', ['/goods/goods/insert', 'post']], // 新增商品
  ['modifyGoods', ['/goods/goods/modify', 'post']], // 修改商品
  ['deleteGoods', ['/goods/goods/deleteBatch', 'post']], // 批量删除
  ['selloutGoods', ['/goods/goods/sellout', 'post']], // 店铺锁菜或沽清
  ['cancelSelloutGoods', ['/goods/goods/cancelSellout', 'post']], // 店铺取消锁菜或沽清
  ['exportGoods', ['/goods/goods/exportGoods', 'post']], // 导出商品
  ['findPageListForGroup', ['/goods/goods/findPageListForGroup', 'post']], // 分页查询商品列表 -- 用于菜谱商品配置
  ['importGoods', ['/goods/goods/importGoods', 'post', { noLoading: true, noNeedOrgId: true }]], // 导入

  // 商品申请管理
  ['goodsApplyList', ['/goods/apply/findPageList', 'post']], // 分页查询申请列表
  ['goodsApplyFindById', ['/goods/apply/findById', 'post']], // 申请商品详情
  ['goodsApplyDelete', ['/goods/apply/delete', 'post']], // 删除申请
  ['goodsApplyInsert', ['/goods/apply/insert', 'post']], // 发起申请
  ['goodsApplyRevocation', ['/goods/apply/revocation', 'post']], // 撤销申请
  ['approvalRecordRevokeApproval', ['/approval/record/revokeApproval', 'post']], // 撤销审批

  // 菜谱管理
  ['findGoodsGroupItem', ['/goods/goodsgroup/findGoodsGroupItem', 'post']], // 获取菜谱详情
  ['updateGoodsGroupItemPrice', ['/goods/goodsgroup/updateGoodsGroupItemPrice', 'post']], // 修改菜谱价格
  ['updateGoodsGroupItem', ['/goods/goodsgroup/updateGoodsGroupItem', 'post']], // 修改菜谱信息
  ['removeGoodsGroupItem', ['/goods/goodsgroup/removeGoodsGroupItem', 'post']], // 移除商品
  ['saveGoodsGroupItem', ['/goods/goodsgroup/saveGoodsGroupItem', 'post']], // 批量添加菜谱商品
  ['findGoodsGroupList', ['/goods/goodsgroup/findPageList', 'post']], // 分页查询商品列表
  ['saveOrUpdateGoodsGroup', ['/goods/goodsgroup/saveOrUpdate', 'post']], // 新增或修改菜谱
  ['modifyGroupStatus', ['/goods/goodsgroup/modifyStatus', 'post']], // 修改菜谱状态
  ['updateStopBatch', ['/goods/goodsgroup/updateStopBatch', 'post']], // 批量停用
  ['saveGoodsGroupSuitStore', ['/goods/goodsgroup/saveSuitStoreBusiness', 'post']], // 菜谱关联店铺
  ['deleteGoodsGroup', ['/goods/goodsgroup/deleteBatch', 'post']], // 删除菜谱
  ['findGoodsGroupById', ['/goods/goodsgroup/findById', 'post']], // 详情
  ['findSuitStoreBusiness', ['/goods/goodsgroup/finSuitStoreBusiness', 'post']], // 关联店铺
  ['removeRelStoreGoodsGroupItem', ['/goods/goodsgroup/removeRelStoreGoodsGroupItem', 'post']], // 批量移除关联店铺的菜谱商品

  // 菜谱商品管理
  // ['findPropList', ['/goods/goodsgroup/findGoodsGroupItem', 'post']], // 查询属性列表

  /**
   * 属性管理
   */
  // 分类
  ['findPropClassList', ['/goods/propclass/findList', 'post']], // 查询属性分类列表
  ['findPropClassPageList', ['/goods/propclass/findPageList', 'post']], // 分页查询属性分类列表
  ['insertPropClass', ['/goods/propclass/insert', 'post']], // 新增属性分类
  ['modifyPropClass', ['/goods/propclass/modify', 'post']], // 修改属性分类
  ['deletePropClass', ['/goods/propclass/delete', 'post']], // 删除属性分类
  ['findPropclassById', ['/goods/propclass/findById', 'post']], // 属性分类
  // 属性
  ['findPropList', ['/goods/prop/findPageList', 'post']], // 查询属性列表
  ['findPropTree', ['/goods/prop/findPropTree', 'post']], // 查询属性分类/属性树结构
  ['insertProp', ['/goods/prop/insert', 'post']], // 新增属性
  ['modifyProp', ['/goods/prop/modify', 'post']], // 修改属性
  ['deleteProp', ['/goods/prop/delete', 'post']], // 删除属性
  ['findPropById', ['/goods/prop/findById', 'post']], // 属性
  ['approvalRecordApprovalProgress', ['/approval/record/approvalProgress', 'post']], // 审批进度
  ['saveSuitStore', ['/goods/prop/saveSuitStore', 'post']], // 属性批量关联店铺营业点
  ['findSuitStore', ['/goods/prop/findSuitStore', 'post']], // 查询关联店铺信息
  ['bindGoodsForBatch', ['/goods/prop/bindGoodsForBatch', 'post']], // 属性批量绑定商品
  ['findBindGoods', ['/goods/prop/findBindGoods', 'post']], // 查询属性关联商品信息

  // 店铺营业点管理
  ['findBusinessPageList', ['/config/business/findByPage', 'post']], // 分页查找营业点
  ['findBusinessList', ['/config/business/list', 'post']], // 营业点列表查询
  ['addFindBusiness', ['/config/business/add', 'post']], // 添加营业点
  ['modifyFindBusiness', ['/config/business/modify', 'post']], // 修改营业点
  ['deleteFindBusiness', ['/config/business/delete', 'post']], // 删除营业点
  ['modifyBusinessStatus', ['/config/business/modifyStatus', 'post']], // 修改状态
  ['busiTermList', ['/config/business/busiTermList', 'post', { noNeedOrgId: true }]], // 营业点列表查询（含站点数据）

  // 规格类型管理
  ['findSizetypeList', ['/config/sizetype/list', 'post']], // 查找规格类型
  ['findSizetypePageList', ['/config/sizetype/findByPage', 'post']], // 分页查找规格类型
  ['addSizetype', ['/config/sizetype/add', 'post']], // 添加规格类型
  ['modifySizetype', ['/config/sizetype/modify', 'post']], // 修改规格类型
  ['deleteSizetype', ['/config/sizetype/delete', 'post']], // 删除规格类型

  // —————————————————————— 厨打配置 - 测试
  /* ['selectPrinterRelGoods', ['/config/printerRelReceipt/selectPrinterRelGoods', 'post']], // 查询分类绑定的打印机
  ['selectGoodsPrinterRelGoods', ['/config/printerRelReceipt/selectGoodsPrinterRelGoods', 'post']], // 查询商品绑定的打印机 */
]
