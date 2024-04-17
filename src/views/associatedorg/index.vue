<template>
  <div class="main-box">
    <TreeFilter label="name" title="关联店铺(单选)" :data="treeData" :need-all="false" :need-node="true" id="id" :default-value="currentStoreInfo?.id" @change="changeTreeFilter" />
    <div class="table-box">
      <!-- 将店铺id赋值key值，即店铺编号时自动重载组件，以使营业点下拉框内容发送变化 -->
      <ProTable
        :key="currentStoreInfo?.id"
        ref="proTableRef"
        title="列表"
        :searchCol="{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }"
        :columns="columns"
        :request-api="getTableList"
        :init-param="initParam"
        :data-callback="dataCallback"
        :span-method="(param) => handleSpanMethod(param, spanArr, needMergeCol)"
      >
        <!-- 表格 header 按钮 -->
        <template #tableHeader="scope">
          <!-- <div class="mb24" style="display: flex"> -->
          <!-- <div class="mr24">
              <span class="info-title ml8">选择营业点：</span>
              <el-select v-model="currentBusinessId" class="w240" placeholder="请选择" @change="changeBusiness">
                <el-option v-for="item in businessList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div> -->
          <div class="mr24">
            <el-popconfirm title="确认要批量删除所选用户?" @confirm="batchDelete(scope.selectedListIds)">
              <template #reference>
                <el-button v-blur type="primary" icon="Delete" plain :disabled="!scope.isSelected" v-auth="'removeRelStoreGoodsGroupItem'">批量删除</el-button>
              </template>
            </el-popconfirm>
          </div>

          <!-- <el-button v-blur type="primary" icon="CirclePlus" @click="addOrg" v-auth="'saveGoodsGroupItem'">添加商品</el-button> -->
          <!-- </div> -->
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
        <!-- <template #price="scope">
          <div flex="cross:center" style="height: 40px">
            <span>¥ {{ scope.row.price }}</span>
            <el-icon class="ml16 pointer" style="color: var(--el-color-primary)" @click="scope.row.isEdit = !scope.row.isEdit">
              <Edit />
            </el-icon>

            <el-input
              v-model="scope.row.temprice"
              placeholder="价格"
              class="ml16"
              style="width: 90px"
              v-if="scope.row.isEdit"
              v-auth="'updateGoodsGroupItemPrice'"
              @blur="updateGoodsInfo('price', scope.row)"
            ></el-input>
          </div>
        </template> -->
        <!-- 表格操作 -->
        <template #operation="scope">
          <el-popconfirm title="确认要删除" @confirm="batchDelete([scope.row.goodsId])" v-if="!scope.row.isAdmin">
            <template #reference>
              <el-button v-blur type="primary" link icon="Delete" v-auth="'removeRelStoreGoodsGroupItem'" :disabled="scope.row.status === 4 || scope.row.status === 3">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </ProTable>
    </div>
  </div>
</template>

<script lang="jsx" setup name="MenuGoods">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showReqError } from '@/hooks/useError'
import { http } from '@/api'
import { tagRowSpan, handleSpanMethod } from '@/hooks/useTable'
import { useOrgStore } from '@/store/modules/org'
import { getStorage } from '@/utils/storage.js'

const orgStore = useOrgStore()

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref()
// 弹框的元素
// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ pageSize: 10 })

// 关联组织店铺列表
const treeData = computed(() => orgStore.associationOrgFilterTreeGet)
// 关联店铺信息
let currentStoreInfo = computed(() => orgStore.associationOrgInfoGet)

// 当前菜谱id
let currentGroupId = ref('')

// 表单数据
let tableData = ref([])

// 监听店铺变化更新initParam获取列表数据
watch(
  () => {
    currentStoreInfo.value
  },
  (val) => {
    initParam.masterOrgId = currentStoreInfo.value.masterOrgId
    initParam.storeId = currentStoreInfo.value.id

    // // 设置默认查询参数
    // nextTick(async () => {
    //   let businessId = await http('findBusinessList', { masterOrgId: currentStoreInfo.value.masterOrgId, storeId: currentStoreInfo.value.id }).then((res) => {
    //     if (res?.content && res.content?.length > 0) {
    //       return res.content[0].id
    //     }
    //   })
    //   proTableRef.value.searchParam = { businessId }
    //   // 调用搜索方法
    //   proTableRef.value?.search()
    // })
  },
  { immediate: true, deep: true }
)

/**
 * 修改左侧店铺
 */
const changeTreeFilter = (val) => {
  // 重复点击相同店铺以及非店铺不做处理
  if (val.id === currentStoreInfo.value.id || val.orgClassId !== '9') return
  orgStore.setAssociationOrgInfo(val)
}

// 删除
const batchDelete = async (val) => {
  const params = {
    goodsIdList: val,
    // 菜谱id
    groupId: currentGroupId.value,
    // 店铺id
    storeId: currentStoreInfo.value.id,
    // 顶级组织id
    masterOrgId: currentStoreInfo.value.masterOrgId,
  }
  console.log(params)

  try {
    let res = await http('removeRelStoreGoodsGroupItem', params)
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

// 处理列表返回数据
const needMergeCol = ref([0, 1, 2, 3, 6, 7, 8, 9])
let spanArr = ref([])

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

  let res = await http('findPageListByStore', newParams)

  // 存储当前菜谱id
  if (res?.content && res.content?.items && res.content.items?.length > 0) {
    currentGroupId.value = res.content.items[0].groupId
  }

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
  { type: 'textCenter', prop: 'index', label: '#', width: 80, render: (scope) => <p style="text-align:center">{columnIndex(scope.row.goodsId)}</p> },
  // {
  //   prop: 'businessId',
  //   label: '店铺',
  //   isShow: false,
  //   // 注意：如果是后台返回的数据，直接按照以下格式就好，protable中有专门针对函数类型的方法自动处理，因此enum中使用的函数除非是接口请求，否则无法使用（PS,可以自调用）
  //   enum: () => http('findBusinessList', { masterOrgId: currentStoreInfo.value.masterOrgId, storeId: currentStoreInfo.value.id }),

  //   // 例子：传进的是个数组，需要执行一下，protable处接收时是个function类型，因此要自调用
  //   // enum: (() => {
  //   //   let arr = []
  //   //   businessList.value.forEach((item) => {
  //   //     arr.push({
  //   //       // 键与下方fieldNames对应，没有fieldNames默认为label和value
  //   //       name: item.name,
  //   //       id: item.id,
  //   //     })
  //   //   })
  //   //   return arr
  //   // })(),

  //   fieldNames: { label: 'name', value: 'id' },
  //   search: {
  //     el: 'select',
  //     props: {
  //       placeholder: '请选择',
  //     },
  //   },
  // },
  {
    prop: 'goodsName',
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
    minWidth: 100,
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

  { prop: 'operation', label: '操作', width: 160 },
]

// const dialogClosed = () => {
//   proTableRef.value.getTableList()
// }
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
