<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="addOpt" v-auth="'insertProp'">新增属性</el-button>
          <el-button v-blur type="primary" plain @click="saveSuitStore(scope.selectedListIds, false)" :disabled="!scope.isSelected" v-auth="'saveSuitStore'"> 批量关联店铺 </el-button>
          <el-button v-blur type="primary" plain @click="bindGoodsForBatch(scope.selectedList, false)" :disabled="!scope.isSelected" v-auth="'bindGoodsForBatch'"> 批量关联商品 </el-button>
        </template>

        <template #sequence="scope">
          <el-input
            v-model="scope.row.temSequence"
            placeholder="请输入"
            type="number"
            :autofocus="true"
            v-if="scope.row.isEdit === true"
            @blur="changeSequence(scope.row, scope.$index)"
            @keyup.enter="changeSequence(scope.row, scope.$index)"
          ></el-input>
          <el-button v-blur type="primary" link icon="EditPen" @click=";(scope.row.isEdit = true), (scope.row.temSequence = scope.row.sequence)" v-else>
            {{ scope.row.sequence }}
          </el-button>
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-button v-blur type="primary" link icon="View" @click="viewOrg(scope.row)">详情</el-button> -->
          <el-button v-blur type="primary" link icon="EditPen" @click="editOrg(scope.row)" v-auth="'modifyProp'">编辑</el-button>
          <el-button v-blur type="primary" link icon="EditPen" @click="saveSuitStore(scope.row, true)" v-auth="'saveSuitStore'">关联店铺</el-button>
          <!-- <el-button v-blur type="primary" link icon="EditPen" @click="bindGoodsForBatch(scope.row, true)" v-auth="'bindGoodsForBatch'">关联商品</el-button> -->

          <el-popconfirm title="确认要删除该记录?" @confirm="batchDelete([scope.row.id], 'one')" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'deleteProp'">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
    <batchBindStoreDialog ref="batchBindStoreDialogRef" @dialogClosed="dialogClosed"></batchBindStoreDialog>
    <SelectGoodsDialog ref="SelectGoodsDialogRef" @dialogClosed="dialogClosed" class="mb10"></SelectGoodsDialog>
    <AssociationDialog ref="AssociationDialogRef"></AssociationDialog>
    <AttributeAssociationDialog ref="AttributeAssociationDialogRef"></AttributeAssociationDialog>
  </div>
</template>

<script lang="jsx" setup name="attributeItem">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import AddOrEditDialog from './components/AddOrEditDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
// 关联营业的信息弹框
import AssociationDialog from './components/AssociationDialog.vue'
// 关联商品信息弹框
import AttributeAssociationDialog from './components/AttributeAssociationDialog.vue'
import batchBindStoreDialog from './components/batchBindStoreDialog.vue'
// 关联商品详情框
import SelectGoodsDialog from './components/select-goods/index.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
const addOrEditDialogRef = ref()
const DetailDialogRef = ref()
const AssociationDialogRef = ref(null)
const AttributeAssociationDialogRef = ref(null)
const batchBindStoreDialogRef = ref()
let SelectGoodsDialogRef = ref(null)
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
// const router = useRouter()

// 关联店铺(type: true 单个关联   false 批量关联)
const saveSuitStore = (row, type) => {
  if (type) {
    batchBindStoreDialogRef.value.show([row.id])
  } else {
    batchBindStoreDialogRef.value.show(row)
  }
}

// 关联商品(type: true 单个关联   false 批量关联)
const bindGoodsForBatch = (row, type) => {
  if (type) {
    SelectGoodsDialogRef.value.show([row])
  } else {
    SelectGoodsDialogRef.value.show(row)
  }
}

/**
 * 表格header按钮
 */
// 新增
const addOpt = () => {
  // console.log('表格header按钮 - 新增')
  addOrEditDialogRef.value.show()
}

/**
 * 表格内联按钮
 */

// 详情
// 编辑
const changeSequence = async (row) => {
  if (row.sequence === row.temSequence) {
    row.isEdit = false
    return ElMessage.warning('排序未发生变化')
  }
  const params = {
    ...row,
  }
  params.sequence = params.temSequence
  try {
    let res = await http('modifyProp', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    proTableRef.value.getTableList()
  } catch (error) {
    console.log(error)
  }
}
// 详情
/* const viewOrg = (row) => {
  console.log('表格内联按钮 - 详情', row)
  // addOrEditDialogRef.value.show(row)
} */
// 编辑
const editOrg = (row) => {
  // console.log('表格内联按钮 - 编辑', row)
  addOrEditDialogRef.value.show(row)
}

/**
 * 通用方法
 */
// 删除
const batchDelete = async (val) => {
  const params = {
    id: val[0],
  }
  try {
    let res = await http('deleteProp', params)
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
  return http('findPropList', newParams)
}

const selectable = (row) => !row.isAdmin

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  {
    prop: 'nameLike',
    label: '属性名称',
    // isShow: false, // 在列表中不显示
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
    prop: 'className',
    label: '属性分类',
    // render: (scope) => <span>{scope.row.name || '--'}</span>,
    /* search: {
      el: 'input',
      props: { placeholder: '请输入属性分类' }
    } */
    /* enum: [
      {
        label: '普通商品',
        value: '01'
      },
    ],
    search: {
      el: 'select',
      props: {
        placeholder: '请选择商品类型'
      }
    } */
  },
  {
    prop: 'propValue',
    label: '业务值',
    /* search: {
      el: 'input',
      props: { placeholder: '请输入业务类型' }
    } */
  },
  /* {
    prop: 'className',
    label: '业务类型',
    render: (scope) => <span>{scope.row.name || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入业务类型' }
    }
  }, */
  {
    prop: 'sequence',
    label: '排序码',
  },
  { prop: 'orgName', label: '创建组织' },
  {
    prop: 'storeCount',
    label: '关联店铺数量',
    render: (scope) => (
      <el-button link type="primary" onClick={() => AssociationDialogRef.value.show(scope.row)}>
        {scope.row.storeCount}
      </el-button>
    ),
  },
  {
    prop: 'goodsCount',
    label: '关联商品数量',
    render: (scope) => (
      <el-button link type="primary" onClick={() => AttributeAssociationDialogRef.value.show(scope.row)}>
        {scope.row.goodsCount}
      </el-button>
    ),
  },
  {
    prop: 'createTime',
    label: '创建时间',
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
  },
  { prop: 'operation', label: '操作', width: 330 },
]

const dialogClosed = () => {
  proTableRef.value.getTableList()
}
</script>
<style lang="scss" scoped></style>
