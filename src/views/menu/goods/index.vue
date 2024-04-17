<template>
  <div class="main-box">
    <TreeFilter label="name" title="商品分类(单选)" :data="treeData" :need-all="true" :need-node="true" id="id" @change="changeTreeFilter" />
    <div class="table-box">
      <ProTable
        ref="proTableRef"
        title="列表"
        :columns="columns"
        :request-api="getTableList"
        :init-param="initParam"
        :data-callback="dataCallback"
        :span-method="(param) => handleSpanMethod(param, spanArr, needMergeCol)"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="addOrg" v-auth="'saveGoodsGroupItem'">添加商品</el-button>

          <el-popconfirm title="确认要批量删除所选用户?" @confirm="batchDelete(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected" v-auth="'removeGoodsGroupItem'">批量删除</el-button>
            </template>
          </el-popconfirm>

          <el-button v-if="assType == '2' || assType == '3'" v-blur type="primary" plain :disabled="!scope.isSelected" @click="batchSubmit(scope.selectedListIds)" v-auth="'goodsApplyInsert'">
            批量审批
          </el-button>
        </template>

        <!-- usernameHeader -->
        <template #typeNameHeader="scope">
          <div flex="cross:center main:center">
            <span>{{ scope.column.label }}</span>
            <el-popover placement="top" width="300" trigger="hover">
              <div class="ft12">
                <p>用户属性分为：公有和私有</p>
                <p>公有：该用户归属组织及其下级组织能共同使用</p>
                <p>私有：该用户仅在归属组织中使用</p>
              </div>
              <template #reference>
                <el-icon class="ml8 pointer">
                  <Warning />
                </el-icon>
              </template>
            </el-popover>
          </div>
        </template>
        <!-- 表格操作 -->
        <template #price="scope">
          <div flex="cross:center" style="height: 40px">
            <span>¥ {{ scope.row.price }}</span>

            <el-icon v-if="assType == '1'" class="ml16 pointer" style="color: var(--el-color-primary)" @click="scope.row.isEdit = !scope.row.isEdit">
              <Edit />
            </el-icon>

            <el-input
              v-model="scope.row.temprice"
              placeholder="价格"
              class="ml16"
              style="width: 90px"
              v-if="scope.row.isEdit && assType == '1'"
              v-auth="'updateGoodsGroupItemPrice'"
              @blur="updateGoodsInfo('price', scope.row)"
            ></el-input>
          </div>
        </template>
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-popconfirm title="确认要删除" @confirm="batchDelete([scope.row.goodsId], 'one')" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'removeGoodsGroupItem'" :disabled="scope.row.status === 4 || scope.row.status === 3">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
    <SelectGoodsDialog ref="SelectGoodsDialogRef" @confirm="goodGroupConfirm" class="mb10"></SelectGoodsDialog>
    <ApplyDialog ref="ApplyDialogRef" @dialogClosed="dialogClosed"></ApplyDialog>
  </div>
</template>

<script lang="jsx" setup name="MenuGoods">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// import dayjs from 'dayjs'
import AddOrEditDialog from './components/AddOrEditDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
import SelectGoodsDialog from '../components/select-goods/index.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
import { tagRowSpan, handleSpanMethod } from '@/hooks/useTable'
import ApplyDialog from './components/ApplyDialog.vue'

const route = useRoute()
// 是否是关联组织
const assType = ref(route.query.assType)
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
const addOrEditDialogRef = ref()
const DetailDialogRef = ref()
const SelectGoodsDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ groupId: route.query.groupId })
initParam.pageSize = 10

// const router = useRouter()
const treeData = ref([])
let tableData = ref([])
const ApplyDialogRef = ref()
/**
 * 通用方法
 */
const batchSubmit = async (goodsIds) => {
  ApplyDialogRef.value.show(goodsIds)
}

const needMergeCol = ref([0, 1, 2, 3, 6, 7, 8, 9])
let spanArr = ref([])
let goodGroupParams = {
  groupId: route.query.groupId,
} // 菜谱商品接口参数

const goodGroupConfirm = async (ids, delGoodsIdList) => {
  goodGroupParams.goodsIdList = [...new Set(ids)]
  goodGroupParams.delGoodsIdList = [...new Set(delGoodsIdList)]
  console.log(goodGroupParams)

  try {
    let res = await http('saveGoodsGroupItem', goodGroupParams)
    if (res.isError) return showReqError(res)
    ElMessage.success('添加成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}

/**
 * 新增
 */
const addOrg = () => {
  // addOrEditDialogRef.value.show()
  // console.log('00', tableData.value)
  // const temItems = handleGoodsData(tableData.value)
  // console.log(temItems)
  // SelectGoodsDialogRef.value.show(tableData.value)
  /* const temItems = handleGoodsData(tableData.value)
  SelectGoodsDialogRef.value.show(temItems) */
  SelectGoodsDialogRef.value.show(tableData.value)
}
/**
 * 分类列表
 */
const findCategoryTree = async () => {
  try {
    let res = await http('findCategoryTree')
    if (res.isError) return showReqError(res)
    treeData.value = res.content
  } catch (error) {
    console.log(error)
  }
}
findCategoryTree()

// 删除
const batchDelete = async (val) => {
  const params = {
    goodsIdList: val,
    groupId: route.query.groupId,
  }
  // console.log(params)
  try {
    let res = await http('removeGoodsGroupItem', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}
// 处理列表返回数据
const dataCallback = (data) => {
  console.log(data)
  const temItems = handleGoodsData(data.items)
  data.items = temItems
  return data
}

const handleGoodsData = (info) => {
  let goodsData = []
  let temData = JSON.parse(JSON.stringify(info))
  temData.forEach((item) => {
    item.sizeList.forEach((item2) => {
      item2.sizeId = item2.id
      delete item2.id
      goodsData.push({
        ...item,
        ...item2,
      })
    })
  })
  // console.log(goodsData)
  spanArr.value = tagRowSpan(goodsData, 'goodsId')
  // console.log(goodsData)
  return goodsData
}
// 更新商品信息
const updateGoodsInfo = async (key, item) => {
  const params = {
    goodsId: item.goodsId,
    sizeId: item.sizeId,
    groupId: route.query.groupId,
  }
  params[key] = item[`tem${key}`]
  try {
    let res = await http('updateGoodsGroupItemPrice', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    proTableRef.value.getTableList()
  } catch (error) {
    console.log(error)
  }
}

/**
 * 左侧树修改的值
 * @param {String} params 选中树代表的值
 */
const changeTreeFilter = (val) => {
  // console.log(val)

  if (val.parentId === '0') {
    initParam.categoryId = undefined
    initParam.parentCategoryId = val.id
  } else {
    initParam.categoryId = val.id
    initParam.parentCategoryId = undefined
  }

  // console.log(val)
  // initParam.categoryId = val.id
  // proTableRef.value.getTableList()
}
/**
 * 获取列表
 *  如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
    默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getUserList"
 */
const getTableList = async (params) => {
  // params.pageSize = 9999
  let newParams = JSON.parse(JSON.stringify(params))
  // let res = await http('findPageListForGroup', newParams)
  if (proTableRef.value) {
    proTableRef.value.clearSelection()
  }

  // newParams.pageSize = 25

  let res = await http('findGoodsGroupItem', newParams)
  // 每次更新数据，清空计算索引列表
  goodsArr = []
  tableData.value = res.content.items
  tableData.value.forEach((item) => {
    item.id = item.goodsId
  })

  return res
}

// 根据商品id来显示序号索引
let goodsArr = []
// 获取序号索引(原始的，不同规划商品占三行，序号不连续)
const columnIndex = (row) => {
  goodsArr.push(row)
  return goodsArr.indexOf(row) + 1
}
// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 80 },
  // ProTable和TableColumn中添加了类型纯文本居中textCenter(表头)
  { type: 'textCenter', prop: 'index', label: '#', width: 80, render: (scope) => <p style="text-align:center">{columnIndex(scope.row.goodsId)}</p> },
  // {
  //   isShow: false, // 在列表中不显示
  //   label: '菜谱名称',
  //   search: {
  //     /* props: { placeholder: '请输入' },
  //     render: () => <span style="font-weight:500">{route.query.name}</span> */
  //     el: 'input',
  //     props: { placeholder: '请输入' }
  //   }
  // },
  {
    prop: 'nameLike',
    isShow: false, // 在列表中不显示
    label: '商品名称',
    search: {
      el: 'input',
      props: { placeholder: '请输入' },
    },
  },
  {
    prop: 'goodsId',
    label: '商品ID',
    minWidth: 140,
    // isShow: false, // 在列表中不显示
    render: (scope) => <span>{scope.row.goodsId || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入' },
    },
  },
  {
    prop: 'info',
    label: '商品信息',
    minWidth: 220,
    render: (scope) => {
      /* eslint-disable*/
      let str = (
        <dl class="goods_info" flex="cross:center">
          <dt>
            <el-image src={scope.row.picUrl} preview-src-list={[scope.row.picUrl]} preview-teleported={true}></el-image>
          </dt>
          <dd>
            <ul class="ml16">
              <li title={scope.row.goodsName}>{scope.row.goodsName || '--'}</li>
            </ul>
          </dd>
        </dl>
      )

      return str
    },
  },
  {
    prop: 'sizeTypeName',
    label: '商品规格',
    minWidth: 100,
  },
  {
    prop: 'price',
    slot: 'price',
    label: '价格',
    minWidth: 170,
  },
  {
    prop: 'categoryName',
    label: '商品分类',
    // type: 'expand',
    minWidth: 100,
  },
  {
    prop: 'status',
    minWidth: 100,
    label: '商品状态',
    search: {
      el: 'select',
      props: {
        placeholder: '请选择',
      },
    },
    render: (scope) => {
      let str = ''
      if (scope.row.status === 2) {
        str = <div class="color-info">待申请</div>
      }
      if (scope.row.status === -1) {
        str = <div class="color-error">停用</div>
      }
      if (scope.row.status === 3) {
        str = <div class="color-info">修改待申请</div>
      }
      if (scope.row.status === 1) {
        str = <div>启用</div>
      }
      if (scope.row.status === 4) {
        str = <div class="color-warning">待审核</div>
      }

      return str
    },
    enum: [
      {
        value: -1,
        label: '停用',
      },
      {
        value: 1,
        label: '启用',
      },
      {
        value: 2,
        label: '待申请',
      },
      {
        value: 3,
        label: '修改待申请',
      },
      {
        value: 4,
        label: '待审核',
      },
    ],
  },
  {
    prop: 'orgName',
    label: '创建组织',
    // type: 'expand',
    minWidth: 100,
  },
  // {
  //   prop: 'goodsType',
  //   label: '商品类型',
  //   minWidth: 100,
  //   // 商品类型 (01:普通商品; 02:普通套餐; 03:称重商品; 04:组合套餐)
  //   enum: [
  //     {
  //       label: '普通商品',
  //       value: '01'
  //     },
  //     {
  //       label: '普通套餐',
  //       value: '02'
  //     },
  //     {
  //       label: '称重商品',
  //       value: '03'
  //     },
  //     {
  //       label: '组合套餐',
  //       value: '04'
  //     }
  //   ],
  //   search: {
  //     el: 'select',
  //     props: {
  //       placeholder: '请选择'
  //     }
  //   }
  // },

  { prop: 'operation', label: '操作', width: 100 },
]

const dialogClosed = () => {
  proTableRef.value.getTableList()
}
</script>
<style lang="scss" scoped>
$priceFontSize: 13px;

:deep .goods_info {
  dt,
  dd {
    float: left;
  }

  dt {
    width: 52px;
    height: 45px;

    .el-image {
      width: 100%;
      height: 100%;
      // overflow: hidden;
    }
  }

  dd {
    width: 130px;
    margin-left: 4px;

    ul {
      li {
        display: block;
        display: -webkit-box;
        text-align: left;
        font-size: $priceFontSize;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: pre-line;
        /*允许换行*/
        -webkit-box-orient: vertical;
        /*行向垂直排列*/
        -webkit-line-clamp: 2;
        /*限制2行*/
      }
    }
  }
}

:deep .size_info {
  ul {
    li {
      display: inline-block;

      &:last-child {
        font-size: $priceFontSize;
      }
    }
  }
}
</style>
