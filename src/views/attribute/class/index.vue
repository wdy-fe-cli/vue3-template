<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
        <!-- 表格 header 按钮 -->
        <template #tableHeader>
          <el-button v-blur type="primary" icon="CirclePlus" @click="addOpt" v-auth="'insertPropClass'">新增属性分类</el-button>

          <!-- <el-popconfirm title="确认要批量删除所选用户?" @confirm="batchDelete(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected">批量删除</el-button>
            </template>
          </el-popconfirm> -->
          <!-- 
          <el-button v-blur type="primary" plain icon="Upload" @click="importOpt" :disabled="!scope.isSelected">导入</el-button>
          <el-button v-blur type="primary" plain icon="Download" @click="exportOpt" :disabled="!scope.isSelected">导出</el-button> -->
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-button v-blur type="primary" link icon="View" @click="viewOrg(scope.row)">详情</el-button> -->
          <el-button v-blur type="primary" link icon="EditPen" @click="editOrg(scope.row)" v-auth="'modifyPropClass'">编辑</el-button>

          <el-popconfirm title="确认要删除该记录?" @confirm="batchDelete([scope.row.id], 'one')" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'deletePropClass'">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
  </div>
</template>

<script lang="jsx" setup name="attributeClass">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import AddOrEditDialog from './components/AddOrEditDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
const addOrEditDialogRef = ref()
const DetailDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
// const router = useRouter()

/**
 * 表格header按钮
 */
// 新增
const addOpt = () => {
  console.log('表格header按钮 - 新增')
  addOrEditDialogRef.value.show()
}
// 导入
// const importOpt = () => {
//   console.log('表格header按钮 - 导入')
// }
// // 导出
// const exportOpt = () => {
//   console.log('表格header按钮 - 导出')
// }

/**
 * 表格内联按钮
 */

// 详情
/* const viewOrg = async (row) => {
  console.log('表格内联按钮 - 详情', row)
  // addOrEditDialogRef.value.show(row)

  const params = {
    name: row.name
  }

  try {
    let res = await http('findPropClassList', params)
    if (res.isError) return showReqError(res)

    console.log('详情', res)
  } catch (error) {
    console.log(error)
  }
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
    id: val[0]
  }
  try {
    let res = await http('deletePropClass', params)
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
  return http('findPropClassPageList', newParams)
}

const selectable = (row) => !row.isAdmin

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  { prop: 'id', label: '分类id' },
  {
    prop: 'nameLike',
    label: '分类名称',
    // render: (scope) => <span>{scope.row.name || '--'}</span>,
    render: (scope) => (
      <el-button link type="primary" onClick={() => DetailDialogRef.value.show(scope.row)}>
        {scope.row.name || '--'}
      </el-button>
    ),
    search: {
      el: 'input',
      props: { placeholder: '请输入' }
    }
  },

  { prop: 'sequence', label: '排序码' },
  { prop: 'orgName', label: '创建组织' },
  {
    prop: 'createTime',
    label: '创建时间',
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
  },
  { prop: 'operation', label: '操作', width: 330 }
]

const dialogClosed = () => {
  proTableRef.value.getTableList()
}
</script>
<style lang="scss" scoped></style>
