<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="addOpt" v-auth="'insertGoods'">新增商品</el-button>

          <el-button
            v-blur
            type="primary"
            plain
            :disabled="!scope.isSelected"
            @click="batchSubmit(scope.selectedListIds)"
            v-auth="'goodsApplyInsert'">
            批量审批
          </el-button>
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <!-- <el-button v-blur type="primary" link icon="EditPen" @click="edit(scope.row)" v-auth="'modifyGoods'"> -->
          <el-button v-blur type="primary" link icon="EditPen" @click="edit(scope.row)" v-auth="'modifyGoods'" :disabled="scope.row.status === 4">
            编辑
          </el-button>

          <el-popconfirm title="确认要删除该记录?" @confirm="batchDelete([scope.row.id], 'one')" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'deleteGoods'" :disabled="scope.row.status === 4">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
    <ApplyDialog ref="ApplyDialogRef" @dialogClosed="dialogClosed"></ApplyDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
  </div>
</template>

<script lang="jsx" setup name="GoodsWait">
import { ref, reactive /* getCurrentInstance */, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import DetailDialog from '../components/DetailDialog.vue'
import ApplyDialog from '../components/ApplyDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
// import { getStorage } from '@/utils/storage'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
// const addOrEditDialogRef = ref()
const ApplyDialogRef = ref()
const DetailDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({})
const router = useRouter()

/**
 * 表格header按钮
 */
// 新增
const addOpt = () => {
  // console.log('表格header按钮 - 新增')
  // addOrEditDialogRef.value.show()

  router.push('/goods/info')
}

/**
 * 表格内联按钮
 */
const edit = (row) => {
  // console.log(row)

  // router.push('./goods/info')

  router.push({
    path: '/goods/info',
    query: {
      id: row.id,
      type: 'wait'
    }
  })
}

/**
 * 通用方法
 */
const batchSubmit = async (goodsIds) => {
  ApplyDialogRef.value.show(goodsIds)
}

// 删除
const batchDelete = async (val) => {
  /* const params = {
    goodsIdList: val
  } */
  const params = {
    goodsId: val[0]
  }
  try {
    // let res = await http('deleteGoods', params)
    let res = await http('deleteApplyingGoodsById', params)
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
  return http('findApplyingPageList', newParams)
}

onMounted(() => {
  proTableRef.value.getTableList()
})

/* instance?.proxy?.emitter.on('findGoodsList', () => {
  getTableList(initParam)
}) */

const selectable = (row) => !row.isAdmin

const findSizetypeList = () => [
  {
    label: '大',
    value: 1
  },
  {
    label: '中',
    value: 2
  },
  {
    label: '小',
    value: 3
  },
  {
    label: '份',
    value: 4
  }
]
// console.log(sizeOptions.value)
// findSizetypeList()

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },

  {
    prop: 'nameLike',
    isShow: false, // 在列表中不显示
    label: '商品名称',
    minWidth: 120,
    render: (scope) => <span>{scope.row.name || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入' }
    }
  },
  {
    prop: 'goodsId',
    label: '商品ID',
    minWidth: 120,
    // isShow: false, // 在列表中不显示
    // render: (scope) => <span>{scope.row.id || '--'}</span>,
    render: (scope) => (
      <el-button link type="primary" onClick={() => DetailDialogRef.value.show(scope.row)}>
        {scope.row.id || '--'}
      </el-button>
    ),
    search: {
      el: 'input',
      props: { placeholder: '请输入' }
    }
  },
  {
    prop: 'pic',
    label: '商品图片',
    width: 90,
    render: (scope) => {
      let str = (
        <div class="goods_info" flex="cross:center">
          <el-image src={scope.row.picUrl} preview-src-list={[scope.row.picUrl]} style="width:60px;height:60px"></el-image>
        </div>
      )

      return str
    }
  },
  {
    prop: 'info',
    label: '商品名称',
    minWidth: 120,
    width: 220,
    render: (scope) => <span>{scope.row.name || '--'}</span>
  },
  {
    prop: 'categoryName',
    label: '商品分类',
    // type: 'expand',
    minWidth: 80
  },
  {
    prop: 'goodsType',
    label: '商品类型',
    minWidth: 80,
    enum: [
      {
        label: '普通商品',
        value: '01'
      },
      {
        label: '普通套餐',
        value: '02'
      },
      {
        label: '称重商品',
        value: '03'
      }
      /* {
        label: '组合套餐',
        value: '04'
      } */
    ],
    search: {
      el: 'select',
      props: {
        placeholder: '请选择'
      }
    }
  },
  {
    prop: 'sizeList',
    // isShow: false, // 在列表中不显示
    label: '商品规格',
    minWidth: 80,
    render: (scope) => {
      let result = scope.row.sizeList.map((item) => (
        <ul>
          <li class="mr10">{item.sizeTypeName}</li>
          <li>(￥{item.price})</li>
        </ul>
      ))

      return <div class="size_info">{result}</div>
    },
    enum: findSizetypeList()
  },
  {
    prop: 'sequence',
    minWidth: 80,
    label: '排序码'
  },
  {
    prop: 'status',
    minWidth: 80,
    label: '商品状态',
    search: {
      el: 'select',
      props: {
        placeholder: '请选择'
      }
    },
    render: (scope) => {
      let str = ''
      if (scope.row.status === -1) {
        str = <div class="color-error">停用</div>
      }
      if (scope.row.status === 1) {
        str = <div>启用</div>
      }
      if (scope.row.status === 2) {
        str = <div class="color-warning">待申请</div>
      }
      if (scope.row.status === 3) {
        str = <div class="color-warning">修改待申请</div>
      }
      if (scope.row.status === 4) {
        str = <div class="color-info">待审核</div>
      }
      return str
    },
    enum: [
      {
        value: 2,
        label: '待申请'
      },
      {
        value: 3,
        label: '修改待申请'
      },
      {
        value: 4,
        label: '待审核'
      }
    ]
  },
  {
    prop: 'orgName',
    label: '创建组织',
    minWidth: 120
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 150,
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
  },

  { prop: 'operation', label: '操作', width: 150 }
]

const dialogClosed = () => {
  proTableRef.value.clearSelection()
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
