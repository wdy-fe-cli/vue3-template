<!-- eslint-disable default-case -->
<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="add" v-auth="'saveOrUpdateGoodsGroup'">新增模板</el-button>

          <!-- <el-button v-blur type="primary" plain @click="batchBindStore(scope.selectedListIds)" :disabled="!scope.isSelected">批量关联店铺</el-button> -->
          <el-button v-blur type="primary" plain @click="batchBindStore(scope.selectedListIds)" :disabled="!scope.isSelected" v-auth="'saveGoodsGroupSuitStore'"> 批量关联店铺 </el-button>

          <el-popconfirm title="确认要批量停用所选?" @confirm="batchStop(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected" v-auth="'updateStopBatch'">批量停用</el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm title="确认要批量删除所选?" @confirm="batchDelete(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected" v-auth="'deleteGoodsGroup'">批量删除</el-button>
            </template>
          </el-popconfirm>
        </template>

        <!-- 表格操作 -->
        <!-- <template #operation="scope" v-if="!orgStore.isStore"> -->
        <template #operation="scope">
          <!-- <div> -->
          <!-- <div v-if="scope.row.editEnable === true"> -->
          <div>
            <el-button v-blur type="primary" link icon="Link" @click="goodsManage(scope.row)" v-auth="'findGoodsGroupItem'">模板商品</el-button>
            <el-button v-blur type="primary" link icon="Link" @click="bindStore(scope.row)" v-auth="'saveGoodsGroupSuitStore'" v-if="scope.row.assType !== 2 && scope.row.assType !== 3"
              >关联店铺</el-button
            >

            <el-button v-blur type="primary" link icon="EditPen" @click="edit(scope.row)" v-auth="'saveOrUpdateGoodsGroup'" v-if="scope.row.assType !== 2 && scope.row.assType !== 3">编辑</el-button>

            <el-popconfirm title="确认要删除该记录?" @confirm="batchDelete([scope.row.id], 'one')" v-if="!scope.row.isAdmin && scope.row.assType !== 2 && scope.row.assType !== 3">
              <template #reference>
                <el-button v-blur type="primary" link icon="Delete" v-auth="'deleteGoodsGroup'">删除</el-button>
              </template>
            </el-popconfirm>

            <el-popconfirm :title="`确定要${statusText(scope.row.status)}该?`" @confirm="changeStatus(scope.row)" v-if="scope.row.assType !== 2 && scope.row.assType !== 3">
              <template #reference>
                <el-button v-blur type="primary" link icon="Refresh" v-auth="'modifyGroupStatus'">{{ statusText(scope.row.status) }}</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </ProTable>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    <!-- <BindStoreDialog ref="BindStoreDialogRef" @dialogClosed="dialogClosed"></BindStoreDialog> -->
    <!-- <SelectGoodsDialog ref="SelectGoodsDialogRef" @confirm="goodGroupConfirm" class="mb10"></SelectGoodsDialog> -->
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
    <AssociationDialog ref="AssociationDialogRef" @dialogClosed="dialogClosed"></AssociationDialog>

    <batchBindStoreDialog ref="batchBindStoreDialogRef" @dialogClosed="dialogClosed"></batchBindStoreDialog>
  </div>
</template>

<script lang="jsx" setup name="menu">
import { ref, reactive, computed } from 'vue'
// import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import AddOrEditDialog from './components/AddOrEditDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
// 关联营业的信息弹框
import AssociationDialog from './components/AssociationDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
// import BindStoreDialog from './components/BindStoreDialog.vue'
// import SelectGoodsDialog from './components/select-goods/index.vue'
import batchBindStoreDialog from './components/batchBindStoreDialog.vue'

// import { useOrgStore } from '@/store/modules/org'

// const orgStore = useOrgStore()

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
const addOrEditDialogRef = ref()
// const BindStoreDialogRef = ref()
// const SelectGoodsDialogRef = ref()
const DetailDialogRef = ref()
const AssociationDialogRef = ref(null)
const batchBindStoreDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
const router = useRouter()

let goodGroupParams = {} // 模板商品接口参数

/* const isShowOption = () => {
  console.log(orgStore, orgStore.isStore)
  return true
}
isShowOption() */

/**
 * 表格header按钮
 */
// 关联店铺
const bindStore = (row) => {
  // console.log('关联店铺', row)

  batchBindStoreDialogRef.value.show([row.id])
}

// 批量关联店铺
const batchBindStore = (row) => {
  // console.log('绑定餐台', row)
  batchBindStoreDialogRef.value.show(row)
}

// 获取关联店铺接口参数
// const goodGroupConfirm = async (ids, goods) => {
//   // console.log(ids, goods, goodGroupParams)

//   goodGroupParams.sizeList = goods.map((item) => ({ id: item.goodsId, price: item.price }))

//   try {
//     let res = await http('saveGoodsGroupItem', goodGroupParams)
//     if (res.isError) return showReqError(res)
//     ElMessage.success('添加成功')
//     proTableRef.value?.getTableList()
//   } catch (error) {
//     console.log(error)
//   }
// }
// 批量停用
const batchStop = async (val) => {
  const params = {
    groupIdList: val,
  }
  try {
    let res = await http('updateStopBatch', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('停用成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}
// 模板商品
const goodsManage = (val) => {
  goodGroupParams.groupId = val

  // SelectGoodsDialogRef.value.show()

  router.push({
    path: '/menu/goods',
    query: {
      groupId: val.id,
      name: val.name,
      assType: val.assType,
      orgId: val.orgId,
    },
  })
}
// 新增
const add = () => {
  addOrEditDialogRef.value.show()
}

// 编辑
const edit = (item) => {
  addOrEditDialogRef.value.show(item)
}

/**
 * 修改停用状态
 * @param {Object} row 操作行的数据
 */
const changeStatus = async (row) => {
  try {
    const params = {
      groupId: row.id,
      status: row.status === 1 ? -1 : 1,
    }
    let res = await http('modifyGroupStatus', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('操作成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}

// 删除
const batchDelete = async (val) => {
  const params = {
    groupIdList: val,
  }
  try {
    let res = await http('deleteGoodsGroup', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('删除成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}

/**
    * 获取列表
    *  如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
      默认不做操作就直接在 ProTable 组件上绑定	:requestApi="getUserList"
  */
const getTableList = (params) => {
  let newParams = JSON.parse(JSON.stringify(params))
  if (newParams.startDate) {
    newParams.startDate = params.startDate[0]
    newParams.endDate = params.startDate[1]
  }

  // console.log('params', params, newParams)
  return http('findGoodsGroupList', newParams)
}

const selectable = (row) => !row.isAdmin

const statusText = computed(() => (status) => status === 1 ? '停用' : '启用')

const groupTypesOptions = () => [
  {
    label: '全部类型',
    value: '0',
  },
  {
    label: '堂食',
    value: '1',
  },
  {
    label: '扫码点餐',
    value: '2',
  },
  {
    label: '外卖',
    value: '3',
  },
]

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  // 列表字段
  {
    prop: 'nameLike',
    label: '模板名称',
    minWidth: 120,
    // render: (scope) => <span>{scope.row.name || '--'}</span>,
    render: (scope) => (
      <el-button link type="primary" onClick={() => DetailDialogRef.value.show(scope.row)}>
        {scope.row.name || '--'}
      </el-button>
    ),
    search: {
      el: 'input',
      props: { placeholder: '请输入' },
    },
  },
  {
    prop: 'groupTypes',
    label: '模板类型',
    minWidth: 80,
    // 模板类型,支持多选:0：全部类型 1：堂食 2：扫码点餐 3：外卖
    enum: groupTypesOptions(),
    render: (scope) =>
      groupTypesOptions()
        .filter((item) => scope.row.groupTypes.includes(item.value))
        .map((item) => item.label)
        .join(','),
    search: {
      el: 'select',
      props: {
        placeholder: '请选择模板类型',
      },
    },
  },

  {
    prop: 'startDate',
    label: '生效开始时间',
    minWidth: 120,
    span: 10,
    // render: (scope) => <span>{dayjs(scope.row.startDate).format('YYYY-MM-DD HH:mm:ss')}</span>,
    render: (scope) => <span>{dayjs(scope.row.startDate).format('YYYY-MM-DD')}</span>,
    search: {
      el: 'date-picker',
      span: 2,
      props: {
        placeholder: '请选择生效时间',
        type: 'daterange',
        rangeSeparator: '—',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  },
  /* {
    prop: 'startDate',
    minWidth: 140,
    label: '生效日期',
    render: (scope) => <div>{`${scope.row.startDate} 到 ${scope.row.endDate}`}</div>,
    search: {
      el: 'date-picker',
      span: 2,
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  }, */
  // { prop: 'bindGoodsNum', label: '关联商品' },
  { prop: 'goodsCount', label: '关联商品' },
  {
    prop: 'status',
    label: '模板状态',
    // isShow: false, // 在列表中不显示
    // 模板类型,支持多选:0：全部类型 1：堂食 2：扫码点餐 3：外卖
    enum: [
      {
        label: '启用',
        value: '1',
      },
      {
        label: '停用',
        value: '-1',
      },
    ],
    render: (scope) => <span class={scope.row.status !== 1 && 'color-error'}>{scope.row.status === 1 ? '已启用' : '已停用'}</span>,
    search: {
      el: 'select',
      props: { placeholder: '请选择状态' },
    },
  },
  { prop: 'orgName', label: '创建组织', minWidth: 120 },
  {
    prop: 'storeBusinessCount',
    label: '关联营业点数量',
    minWidth: 120,
    render: (scope) => (
      <el-button link type="primary" onClick={() => AssociationDialogRef.value.show(scope.row)}>
        {scope.row.storeBusinessCount}
      </el-button>
    ),
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 150,
    render: (scope) => (
      <div style="text-align: left !important">
        <div>
          {dayjs(scope.row.createTime).format('YYYY-MM-DD')} {dayjs(scope.row.createTime).format('HH:mm:ss')}
        </div>
        {/* <div>{dayjs(scope.row.createTime).format('HH:mm:ss')}</div> */}
      </div>
    ),
  },
  { prop: 'operation', label: '操作', width: 260 },
]

const dialogClosed = () => {
  proTableRef.value.getTableList()
}
</script>
<style lang="scss" scoped></style>
