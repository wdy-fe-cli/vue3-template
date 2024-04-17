<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="add" v-auth="'insertCategory'">新增分类</el-button>
          <!-- <el-button v-blur type="primary" icon="CirclePlus" @click="add">新增分类</el-button> -->

          <el-popconfirm title="确认要批量删除所选分类?" @confirm="batchDelete(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected" v-auth="'deleteCategory'">批量删除</el-button>
            </template>
          </el-popconfirm>

          <el-button
            v-blur
            type="primary"
            icon="Switch"
            plain
            :disabled="!scope.isSelected"
            @click="move(scope.selectedList)"
            v-auth="'modifySubCategoryParentId'">
            批量迁移
          </el-button>

          <el-button v-blur type="primary" icon="Download" plain @click="onExport()">下载模板</el-button>

          <File :api="importFile" :is-table-btn="true" :drag="false" :is-my-succ-callback="true" />
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button v-blur type="primary" link icon="EditPen" @click="edit(scope.row)" v-auth="'modifyCategory'">编辑</el-button>

          <el-popconfirm title="确认要删除该分类?" @confirm="batchDelete([scope.row.id])" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'deleteCategory'">删除</el-button>
            </template>
          </el-popconfirm>

          <el-button v-blur type="primary" link icon="CirclePlus" v-if="scope.row.parentId === '0'" @click="add(scope.row)" v-auth="'insertCategory'">
            新建二级
          </el-button>

          <template v-else>
            <el-button v-blur type="primary" icon="Switch" link @click="move([scope.row])" v-auth="'modifySubCategoryParentId'">迁移</el-button>
          </template>
        </template>
      </ProTable>
    </div>
    <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
    <MoveCategoryDialog ref="MoveCategoryDialogRef" @dialogClosed="dialogClosed"></MoveCategoryDialog>
  </div>
</template>

<script lang="jsx" setup name="category">
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
// import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

import AddOrEditDialog from './components/AddOrEditDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
import MoveCategoryDialog from './components/MoveCategoryDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
import File from '@/components/Upload/File.vue'
// import { exportExcel } from '@/api/modules/app'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
const addOrEditDialogRef = ref()
const DetailDialogRef = ref()
const MoveCategoryDialogRef = ref()
// const SelectGoodsDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
// const router = useRouter()

const onExport = () => {
  window.open('https://cashier.obs.cidc-rp-12.joint.cmecloud.cn/分类导入模板.xlsx')
}

const importFile = (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('type', options.type)
  http('importCateogrys', formData).then((res) => {
    console.log(res)
    if (!res) {
      ElNotification({
        title: '温馨提示',
        message: '文件上传成功！',
        type: 'success'
      })
      dialogClosed()
    } else {
      ElNotification({
        title: '温馨提示',
        message: res.subMessage,
        type: 'warning'
      })
    }
  })
}

/**
 * 新增
 */
const add = (row) => {
  if (row && row.parentId === '0') {
    addOrEditDialogRef.value.show(row, 'second')
  } else {
    addOrEditDialogRef.value.show()
  }
}
/**
 *  编辑
 */
const edit = (row) => {
  if (row.parentId === '0') {
    addOrEditDialogRef.value.show(row)
  } else {
    addOrEditDialogRef.value.show(row, 'second')
  }
}

// 导出
// const exportOpt = () => {
//   console.log('表格header按钮 - 导出')
// }

// 迁移
const move = (items) => {
  const tempItems = items.filter((item) => item.parentId !== '0')
  const tempIds = tempItems.map((item) => item.id)
  MoveCategoryDialogRef.value.show(tempIds)
}

/**
 * 删除
 */
const batchDelete = async (val) => {
  const params = {
    idList: val
  }
  try {
    let res = await http('deleteCategory', params)
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
  proTableRef.value.clearSelection()
  return http('findCategoryList', newParams)
}

const selectable = (row) => !row.isAdmin

// 表格配置项
// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  {
    prop: 'nameLike',
    label: '分类名称',
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
  {
    prop: 'level',
    label: '分类等级',
    render: (scope) => <span>{scope.row.parentId === '0' ? '一级' : '二级'}</span>
  },
  { prop: 'code', label: '编码' },
  { prop: 'bindGoodsNum', label: '关联商品' },
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
