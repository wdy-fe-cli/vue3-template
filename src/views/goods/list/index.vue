<template>
  <div class="main-box">
    <div class="table-box">
      <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
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

        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <el-button v-blur type="primary" icon="CirclePlus" @click="addOpt" v-auth="'insertGoods'">新增商品</el-button>

          <el-popconfirm title="确认要批量删除所选用户?" @confirm="batchDelete(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" plain :disabled="!scope.isSelected" v-auth="'deleteGoods'">批量删除</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm :title="`确认沽清选中的商品?`" @confirm="sellClear(scope.selectedListIds)">
            <!-- <template #reference>
              <el-button v-blur type="primary" plain :disabled="!scope.isSelected" v-auth="'selloutGoods'">沽清</el-button>
            </template> -->
          </el-popconfirm>
          <el-popconfirm :title="`确认锁定选中的商品?`" @confirm="lockVegetable(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" plain :disabled="!scope.isSelected" v-auth="'selloutGoods'">锁菜</el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm :title="`确认取消锁定选中的商品?`" @confirm="cancelTheLockMenu(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" plain :disabled="!scope.isSelected" v-auth="'cancelSelloutGoods'">取消锁菜</el-button>
            </template>
          </el-popconfirm>

          <el-button v-blur type="primary" icon="Download" plain @click="onExport()">下载模板</el-button>

          <File :api="importFile" :is-table-btn="true" :drag="false" :is-my-succ-callback="true" />
          <!-- <el-popconfirm :title="`确认将选中的商品加入菜谱?`" @confirm="addingRecipes(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected">加入菜谱</el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm :title="`确认将选中的商品移除菜谱?`" @confirm="removeFromRecipe(scope.selectedListIds)">
            <template #reference>
              <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected">菜谱中移除</el-button>
            </template>
          </el-popconfirm> -->

          <!-- <el-button v-blur type="primary" plain @click="sellClear" :disabled="!scope.isSelected">沽清</el-button> -->
          <!-- <el-button v-blur type="primary" plain @click="lockVegetable" :disabled="!scope.isSelected">锁菜</el-button> -->
          <!-- <el-button v-blur type="primary" plain @click="cancelTheLockMenu" :disabled="!scope.isSelected">取消锁菜</el-button> -->
          <!-- <el-button v-blur type="primary" plain @click="addingRecipes" :disabled="!scope.isSelected">加入菜谱</el-button> -->
          <!-- <el-button v-blur type="primary" plain @click="removeFromRecipe" :disabled="!scope.isSelected">菜谱中移除</el-button> -->
          <!--
          <el-button v-blur type="primary" plain icon="Upload" @click="importOpt" :disabled="!scope.isSelected">导入</el-button>
          <el-button v-blur type="primary" plain icon="Download" @click="exportOpt" :disabled="!scope.isSelected">导出</el-button> -->
        </template>

        <!-- 表格操作 -->
        <template #operation="scope">
          <el-button v-blur type="primary" link icon="EditPen" @click="edit(scope.row)" v-auth="'modifyGoods'" :disabled="scope.row.status === 3 || scope.row.status === 4"> 编辑 </el-button>

          <el-popconfirm title="确认要删除该记录?" @confirm="batchDelete([scope.row.id], 'one')" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'deleteGoods'" :disabled="scope.row.status === 4 || scope.row.status === 3"> 删除 </el-button>
            </template>
          </el-popconfirm>

          <!-- <el-popconfirm title="确定要新建下级?" @confirm="newSubordinate(scope.row)">
            <template #reference>
              <el-button v-blur type="primary" link>新建下级</el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm title="确定要绑定迁徙?" @confirm="bindingMigration(scope.row)">
            <template #reference>
              <el-button v-blur type="primary" link>绑定迁徙</el-button>
            </template>
          </el-popconfirm> -->
          <!-- <el-button v-blur type="primary" link icon="CirclePlus" v-if="scope.row.parentId === '0'" @click="add(scope.row)">新建二级</el-button>

          <template v-else>
            <el-button v-blur type="primary" icon="Goods" link @click="move(scope.row)">绑定商品</el-button>

            <el-button v-blur type="primary" icon="Switch" link @click="move([scope.row])">迁徙</el-button>
          </template> -->
        </template>
      </ProTable>
    </div>
    <ApplyDialog ref="ApplyDialogRef" @dialogClosed="dialogClosed"></ApplyDialog>
    <MoveCategoryDialog ref="MoveCategoryDialogRef" @dialogClosed="dialogClosed"></MoveCategoryDialog>
    <DetailDialog ref="DetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
  </div>
</template>

<script lang="jsx" setup name="goodsList">
import { ref, reactive /* getCurrentInstance */ /* , onMounted */ /* watch */ /* inject */ } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { /* useRoute */ useRouter } from 'vue-router'
import dayjs from 'dayjs'
import DetailDialog from '../components/DetailDialog.vue'
import ApplyDialog from '../components/ApplyDialog.vue'
import MoveCategoryDialog from '../components/MoveCategoryDialog.vue'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
import File from '@/components/Upload/File.vue'
import { getStorage } from '@/utils/storage'

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
// const addOrEditDialogRef = ref()
const ApplyDialogRef = ref()
const MoveCategoryDialogRef = ref()
const DetailDialogRef = ref()
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({
  status: 1,
})
const router = useRouter()
// const route = useRoute()

// const Reload = inject('Reload', Function, true)

// const instance = getCurrentInstance()

const onExport = () => {
  window.open('https://cashier.obs.cidc-rp-12.joint.cmecloud.cn/商品导入模板.xlsx')
}

/* const importFile = (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('type', options.type)
  return new Promise((resolve) => {
    http('importGoods', formData).then((res) => {
      if (res.code === 10000) {
        resolve(res.content)

        dialogClosed()
      } else {
        ElMessage.error(res.subMessage)
      }
    })
  })
} */
/* const importFile = (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('type', options.type)
  http('importGoods', formData).then(() => {
    dialogClosed()
  })
} */
const importFile = (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('type', options.type)
  formData.append('orgId', getStorage('orgId'))
  http('importGoods', formData).then((res) => {
    console.log(res)
    if (!res) {
      ElNotification({
        title: '温馨提示',
        message: '文件上传成功！',
        type: 'success',
      })
      dialogClosed()
    } else {
      ElNotification({
        title: '温馨提示',
        message: res.subMessage,
        type: 'warning',
      })
    }
  })
}
// 编辑
const changeSequence = async (row) => {
  if (row.sequence === row.temSequence) {
    row.isEdit = false
    return ElMessage.warning('排序未发生变化')
  }
  const params = {
    goodsId: row.id,
    ...row,
  }
  params.sequence = params.temSequence
  try {
    let res = await http('updateGoodsSequence', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    proTableRef.value.getTableList()
  } catch (error) {
    console.log(error)
  }
}
/**
 * 表格header按钮
 */
// 新增
const addOpt = () => {
  // console.log('表格header按钮 - 新增')
  // addOrEditDialogRef.value.show()

  router.push('/goods/info')
}

// 沽清
const sellClear = async (val) => {
  // console.log('表格header按钮 - 沽清', val)

  const params = {
    goodsIdList: val,
    // orgId: getStorage('orgId'),
    selloutType: 1,
  }

  try {
    let res = await http('selloutGoods', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('沽清成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}
// 锁菜
const lockVegetable = async (val) => {
  // console.log('表格header按钮 - 锁菜')

  const params = {
    goodsIdList: val,
    // orgId: getStorage('orgId'),
    selloutType: 2,
  }

  try {
    let res = await http('selloutGoods', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('锁定成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}
// 取消锁菜
const cancelTheLockMenu = async (val) => {
  // console.log('表格header按钮 - 取消锁菜')

  const params = {
    goodsIdList: val,
    // orgId: getStorage('orgId'),
    selloutType: 2,
  }

  try {
    let res = await http('cancelSelloutGoods', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('取消锁菜成功')
    proTableRef.value?.getTableList()
  } catch (error) {
    console.log(error)
  }
}
/* // 加入菜谱
const addingRecipes = () => {
  console.log('表格header按钮 - 加入菜谱')
}
// 菜谱中移除
const removeFromRecipe = () => {
  console.log('表格header按钮 - 菜谱中移除')
} */
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
const edit = (row) => {
  // console.log(row)

  // router.push('./goods/info')

  router.push({
    path: '/goods/info',
    query: {
      id: row.id,
    },
  })

  /* if (row.parentId === '0') {
    addOrEditDialogRef.value.show(row)
  } else {
    addOrEditDialogRef.value.show(row, 'second')
  } */
}
/* const add = (row) => {
  if (row && row.parentId === '0') {
    addOrEditDialogRef.value.show(row, 'second')
  } else {
    addOrEditDialogRef.value.show()
  }
} */
// 详情
/* const viewOrg = async (row) => {
  // console.log('表格内联按钮 - 详情', row)

  const params = {
    id: row.id
  }

  try {
    let res = await http('findGoodsById', params)
    if (res.isError) return showReqError(res)

    console.log('详情', res)
  } catch (error) {
    console.log(error)
  }
} */
/* // 新建下级
const newSubordinate = (row) => {
  console.log('表格内联按钮 - 新建下级', row)
}
// 绑定迁徙
const bindingMigration = (row) => {
  console.log('表格内联按钮 - 绑定迁徙', row)
} */

// 绑定商品

// 迁移
/* const move = (items) => {
  const tempItems = items.filter((item) => item.parentId !== '0')
  const tempIds = tempItems.map((item) => item.id)
  MoveCategoryDialogRef.value.show(tempIds)
} */

/**
 * 通用方法
 */
// 删除
const batchDelete = async (val) => {
  const params = {
    goodsIdList: val,
  }
  try {
    let res = await http('deleteGoods', params)
    if (res.isError) {
      if (res.subCode === 'GOODS_IN_PACKAGE') {
        const packageTitles = res.content.join()
        ElMessageBox.alert(`${res.subMessage} </br> </br> 绑定在：<span style="color:var(--el-color-primary)">${packageTitles}</span>`, '不可删除提示', {
          confirmButtonText: 'OK',
          dangerouslyUseHTMLString: true,
        })
        return
      }
      return showReqError(res)
    }
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
  if (proTableRef.value) {
    proTableRef.value.clearSelection()
  }

  // Reload()
  return http('findGoodsList', newParams)
}

/* onMounted(() => {
  let timer = setTimeout(() => {
    proTableRef.value.getTableList()

    clearTimeout(timer)
  }, 1000)
}) */

/* setTimeout(() => {
  console.log(1111)
  proTableRef.value.getTableList()

  // clearTimeout(timer)
}, 1000) */

/* instance?.proxy?.emitter.on('findGoodsList', () => {
  getTableList(initParam)
}) */

const selectable = (row) => !row.isAdmin

// let sizeOptions = ref([])
/* const findSizetypeList = async () => {
  try {
    let res = await http('findSizetypeList')
    if (res.isError) return showReqError(res)
    console.log('123456', res.content)

    return [
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
      },
      {
        label: '组合套餐',
        value: '04'
      }
    ]
  } catch (error) {
    console.log(error)
  }
} */
const findSizetypeList = () => [
  {
    label: '大',
    value: 1,
  },
  {
    label: '中',
    value: 2,
  },
  {
    label: '小',
    value: 3,
  },
  {
    label: '份',
    value: 4,
  },
]
// console.log(sizeOptions.value)
// findSizetypeList()

// 表格配置项
const columns = [
  { type: 'selection', fixed: 'left', width: 50, selectable },
  { type: 'index', fixed: 'left', label: '#', prop: 'expend', width: 50 },
  /* {
    prop: 'categoryId',
    label: '分类',
    type: 'expand',
    minWidth: 120,
    render: (scope) => <span>{scope.row.name || '--'}</span>
  }, */
  {
    prop: 'nameLike',
    isShow: false, // 在列表中不显示
    label: '商品名称',
    minWidth: 120,
    render: (scope) => <span>{scope.row.name || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入' },
    },
  },
  {
    prop: 'goodsId',
    label: '商品ID',
    minWidth: 120,
    // isShow: false, // 在列表中不显示
    render: (scope) => (
      <el-button link type="primary" onClick={() => DetailDialogRef.value.show(scope.row)}>
        {scope.row.id || '--'}
      </el-button>
    ),
    search: {
      el: 'input',
      props: { placeholder: '请输入' },
    },
  },
  {
    prop: 'pic',
    label: '商品图片',
    width: 90,
    // isShow: false, // 在列表中不显示
    // render: (scope) => <span>{scope.row.name || '--'}</span>
    render: (scope) => {
      let str = (
        <div class="goods_info" flex="cross:center">
          <el-image src={scope.row.picUrl} preview-src-list={[scope.row.picUrl]} style="width:60px;height:60px"></el-image>
        </div>
      )

      return str
    },
  },
  {
    prop: 'info',
    label: '商品名称',
    minWidth: 120,
    width: 220,
    render: (scope) => <span>{scope.row.name || '--'}</span>,
  },
  {
    prop: 'categoryName',
    label: '商品分类',
    // type: 'expand',
    minWidth: 80,
  },
  {
    prop: 'goodsType',
    label: '商品类型',
    minWidth: 80,
    // isShow: false, // 在列表中不显示
    // render: (scope) => <span>{scope.row.name || '--'}</span>,
    // 商品类型 (01:普通商品; 02:普通套餐; 03:称重商品; 04:组合套餐)
    enum: [
      {
        label: '普通商品',
        value: '01',
      },
      {
        label: '普通套餐',
        value: '02',
      },
      {
        label: '称重商品',
        value: '03',
      },
      /* {
        label: '组合套餐',
        value: '04'
      } */
    ],
    search: {
      el: 'select',
      props: {
        placeholder: '请选择',
      },
    },
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
    enum: findSizetypeList(),
    // search: {
    //   el: 'select',
    //   props: { placeholder: '请选择商品规格' }
    // }
  },
  /* {
    prop: 'propId',
    isShow: false, // 在列表中不显示
    minWidth: 80,
    label: '商品属性',
    // render: (scope) => <span>{scope.row.name || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入商品名称' }
    }
  }, */

  // { prop: 'code', label: '编码' },
  // { prop: 'bindGoodsNum', label: '关联商品' },
  {
    prop: 'sequence',
    minWidth: 80,
    label: '排序码',
  },

  {
    prop: 'status',
    minWidth: 80,
    label: '商品状态',
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
    prop: 'isEmpty',
    label: '是否沽清',
    minWidth: 80,
    render: (scope) => <span>{scope.row.isEmpty === null ? '--' : scope.row.isEmpty ? '是' : '否'}</span>,
  },
  {
    prop: 'isSellout',
    label: '是否锁菜',
    minWidth: 80,
    render: (scope) => <span>{scope.row.isSellout === null ? '--' : scope.row.isSellout ? '是' : '否'}</span>,
  },
  {
    // prop: 'downOrgId',
    // label: '创建组织',
    // minWidth: 180,
    // render: (scope) => <span>{scope.row.orgName || '--'}</span>,
    // enum: () => http('findByOrgIdListForGoods'),
    // fieldNames: {
    //   label: 'name',
    //   value: 'id',
    // },
    // search: {
    //   el: 'select',
    //   props: {
    //     placeholder: '请选择',
    //   },
    // },
    prop: 'orgName',
    label: '创建组织',
    minWidth: 120,
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 150,
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>,
    /* search: {
      el: 'date-picker',
      props: { placeholder: '请选择', valueFormat: 'YYYY-MM-DD' }
    } */
  },
  /* {
    prop: 'orgName',
    label: '商品标签',
    minWidth: 120,
    isShow: false, // 在列表中不显示
    render: (scope) => <span>{scope.row.name || '--'}</span>,
    search: {
      el: 'input',
      props: { placeholder: '请输入商品标签' }
    }
  }, */
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
