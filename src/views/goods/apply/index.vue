<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam" :tool-button="false">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="">
          <!-- <el-popconfirm title="确认要批量提交审批?" @confirm="batchSubmit(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected">批量撤销</el-button>
            </template>
          </el-popconfirm> -->
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <el-popconfirm title="确认要撤销申请?" @confirm="batchRevocation(scope.row)" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'goodsApplyRevocation'" :disabled="scope.row.status !== 1">撤销</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm title="确认要删除申请?" @confirm="batchDelete(scope.row)" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'goodsApplyDelete'" :disabled="scope.row.status === 1">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
    <!-- <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog> -->
    <MoveCategoryDialog ref="MoveCategoryDialogRef" @dialogClosed="dialogClosed"></MoveCategoryDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
  </div>
</template>

<script lang="jsx" setup name="ApplyGoods">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
// import AddOrEditDialog from './components/AddOrEditDialog.vue'
import MoveCategoryDialog from '../components/MoveCategoryDialog.vue'
import DetailDialog from './components/DetailDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
import { getStorage } from '@/utils/storage'
// import { getStorage } from '@/utils/storage'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
// const addOrEditDialogRef = ref()
const MoveCategoryDialogRef = ref()
const DetailDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
// const router = useRouter()

// 撤销审批
const batchRevocation = async (val) => {
  const params = {
    approvalId: val.approvalId,
    approvalNum: val.id,
    orgId: getStorage('orgId'),
    type: 1,
  }
  try {
    let res = await http('approvalRecordRevokeApproval', params)
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
    id: val.id,
  }
  try {
    let res = await http('goodsApplyDelete', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('操作成功')
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
  return http('goodsApplyList', newParams)
}

const selectable = (row) => !row.isAdmin

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  {
    prop: 'title',
    label: '申请名称',
    minWidth: 180,
  },
  {
    prop: 'storeName',
    label: '商铺名称',
    minWidth: 120,
    render: (scope) => {
      let str = (
        <el-button link type="primary" onClick={() => DetailDialogRef.value.show(scope.row)}>
          {scope.row.storeName || '--'}
        </el-button>
      )

      return str
    },
  },
  {
    prop: 'serviceAreaName',
    label: '项目名称',
    minWidth: 120,
  },
  {
    prop: 'goodsNum',
    label: '商品申请数量',
    minWidth: 120,
  },
  {
    prop: 'note',
    label: '申请备注',
    minWidth: 120,
  },

  {
    prop: 'status',
    minWidth: 80,
    label: '商品状态',
    search: {
      el: 'select',
      props: {
        placeholder: '请选择',
      },
    },
    render: (scope) => {
      let str = ''
      if (scope.row.status === 0) {
        str = <div class="color-info">草稿箱</div>
      }
      if (scope.row.status === 1) {
        str = <div class="color-warning">审核中</div>
      }
      if (scope.row.status === 2) {
        str = <div class="color-success">已审核</div>
      }
      if (scope.row.status === 3) {
        str = <div class="color-error">已驳回</div>
      }
      if (scope.row.status === 4) {
        str = <div class="color-info">已撤销</div>
      }
      return str
    },
    enum: [
      /* {
        value: 0,
        label: '草稿箱'
      }, */
      {
        value: 1,
        label: '审核中',
      },
      {
        value: 2,
        label: '已审核',
      },
      {
        value: 3,
        label: '已驳回',
      },
      {
        value: 4,
        label: '已撤销',
      },
    ],
  },
  {
    prop: 'failReason',
    label: '驳回原因',
    minWidth: 120,
    render: (scope) => <span>{scope.row.failReason || '--'}</span>,
  },
  {
    prop: 'applyName',
    label: '申请人',
    minWidth: 120,
  },
  {
    prop: 'applyTime',
    label: '申请时间',
    minWidth: 150,
    render: (scope) => <span>{dayjs(scope.row.applyTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 150,
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
  },

  { prop: 'operation', label: '操作', width: 150 },
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
        white-space: pre-line; /*允许换行*/
        -webkit-box-orient: vertical; /*行向垂直排列*/
        -webkit-line-clamp: 2; /*限制2行*/
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
