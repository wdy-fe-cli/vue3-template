<template>
    <page :has-handler="false">
        <div v-if="!orgStore.isStore" class="mb24">
            <span class="info-title ml8">选择店铺：</span>
            <store-select v-model:storeId="currentStoreId" :emit-path="false" class="w240" @changeStore="changeStore" />
        </div>
        <div class="main-box" style="max-height: 72vh" flex>
            <CTreeFilter label="name" title="分类(单选)" :data="treeOptions" :need-all="true" :need-node="true" id="id"
                v-auth="'findCategoryTreeForPrinter'" @change="changeTreeFilter" @setCategoryPrinter="setCategoryPrinter"
                :default-value="currentCategoryId" />

            <ProTable ref="proTableRef" title="列表" :columns="columns" :request-api="getTableList" :init-param="initParam">
            </ProTable>
        </div>
        <AddOrEditDialog ref="addOrEditDialogRef" @dialogClosed="dialogClosed"></AddOrEditDialog>
    </page>
</template>
  
<script lang="jsx" setup name="kitchen">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import AddOrEditDialog from './components/AddOrEditDialog.vue'
import CTreeFilter from './components/TreeFilter/index.vue'
import StoreSelect from '@/views/components/select-store/index.vue'

import { showReqError } from '@/hooks/useError'

import { useOrgStore } from '@/store/modules/org'

import { getStorage } from '@/utils/storage'

import { http } from '@/api'

// 弹框的元素
const addOrEditDialogRef = ref()
const orgStore = useOrgStore()

const treeOptions = ref([])
const goodsData = ref([])
const goodsTotal = ref(0)

let selectedSizeIds = ref([])
let selectedGoods = ref([])

let currentCategoryId = ref('')
let currentStoreId = ref('')
let currentPageNumber = 1

const proTableRef = ref()

// let storeId = getStorage('orgId')

defineProps({
    needInput: {
        type: [Boolean, String],
        default: true
    }
})

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

/**
 * 新增编辑等弹框关闭，刷新列表
 */
const dialogClosed = () => {
    findCategoryTree()
}

/**
 * 修改店铺
 */
const changeStore = (val) => {
    // console.log(val)
    // findGoodsList()
    // console.log(val.value)
    // ruleForm.value.storeId = storeId
    currentStoreId.value = JSON.parse(JSON.stringify(val.value))
    console.log(currentStoreId.value)

    findCategoryTree()
}
/**
 * 设置分类打印机
 */
const setCategoryPrinter = (data) => {
    // console.log('111', data)
    if (!orgStore.isStore && !currentStoreId.value) {
        return ElMessage.warning('请先选择店铺')
    }
    addOrEditDialogRef.value.show(data, 'category', currentStoreId.value)
}

/**
 * 设置打印机
 */
const setPrinter = (data) => {
    if (!orgStore.isStore && !currentStoreId.value) {
        return ElMessage.warning('请先选择店铺')
    }
    addOrEditDialogRef.value.show(data, 'goods', currentStoreId.value)
}
/**
 * 设置不打印
 */
const setNoPrinter = async (row) => {
    if (!orgStore.isStore && !currentStoreId.value) {
        return ElMessage.warning('请先选择店铺')
    }
    const params = {
        ...row,
        storeId: currentStoreId.value,
        goodsId: row.id
    }
    // console.log(JSON.parse(JSON.stringify(currentStoreId.value)))
    try {
        let res = await http('setToNotPrint', params)
        if (res.isError) return showReqError(res)
        ElMessage.success('设置成功')
        dialogClosed()
    } catch (error) {
        console.log(error)
    }
}

/**
 * 切换分页
 */
const handleCurrentChange = (val) => {
    currentPageNumber = val
    findGoodsList()
}
/**
 * 设置选中的数据
 */
const setData = (data) => {
    console.log(data)
    if (data) {
        selectedGoods.value = data
        selectedSizeIds.value = selectedGoods.value.map((item) => item.sizeId)
    }
}

/**
 * 点击商品item
 */
const onGoodsItem = () => { }
/**
 * 左侧树修改的值
 * @param {String} params 选中树代表的值
 */
let parentId = ref('')
const changeTreeFilter = (val) => {
    console.log(val)
    if (val.parentId === '0' && val.children.length <= 0) return
    if (val.parentId === '0') {
        // currentCategoryId.value = val.children[0].id
        currentCategoryId.value = val.id
        parentId.value = '0'
    } else {
        currentCategoryId.value = val.id
        parentId.value = val.parentId
    }
    findGoodsList()
    // findCategoryTree()
}

/**
 * 查找商品列表
 */
const findGoodsList = async () => {
    const params = {
        // categoryId: currentCategoryId.value,
        pageNumber: currentPageNumber,
        goodsType: '01',
        pageSize: 12,
        storeId: currentStoreId.value || getStorage('orgId')
    }

    if (parentId.value === '0') {
        params.categoryId = undefined
        params.parentCategoryId = currentCategoryId.value
    } else {
        params.categoryId = currentCategoryId.value
        params.parentCategoryId = undefined
    }

    try {
        let res = await http('findPageListForPrinter', params)
        if (res.isError) return showReqError(res)
        goodsTotal.value = Number(res.content.count)
        goodsData.value = res.content.items
    } catch (error) {
        console.log(error)
    }
}

/**
 * 获取分类树
 */
const findCategoryTree = async () => {
    let params = {
        storeId: currentStoreId.value || getStorage('orgId')
    }

    try {
        let res = await http('findCategoryTreeForPrinter', params)
        if (res.isError) return showReqError(res)
        treeOptions.value = res.content
        // console.log(treeOptions.value)
        findGoodsList()
    } catch (error) {
        console.log(error)
    }
}

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
            props: { placeholder: '请输入' }
        }
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
            props: { placeholder: '请输入' }
        }
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
        // isShow: false, // 在列表中不显示
        // render: (scope) => <span>{scope.row.name || '--'}</span>,
        // 商品类型 (01:普通商品; 02:普通套餐; 03:称重商品; 04:组合套餐)
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
        label: '排序码'
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
                label: '停用'
            },
            {
                value: 1,
                label: '启用'
            },
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
        prop: 'isEmpty',
        label: '是否沽清',
        minWidth: 80,
        render: (scope) => <span>{scope.row.isEmpty === null ? '--' : scope.row.isEmpty ? '是' : '否'}</span>
    },
    {
        prop: 'isSellout',
        label: '是否锁菜',
        minWidth: 80,
        render: (scope) => <span>{scope.row.isSellout === null ? '--' : scope.row.isSellout ? '是' : '否'}</span>
    },
    {
        prop: 'orgName',
        label: '创建组织',
        minWidth: 120
        // // render: (scope) => <span>{scope.row.name || '--'}</span>,
        // search: {
        //   el: 'input',
        //   props: { placeholder: '请输入' }
        // }
    },
    {
        prop: 'createTime',
        label: '创建时间',
        minWidth: 150,
        render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
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
    { prop: 'operation', label: '操作', width: 150 }
]

onMounted(() => {
    selectedSizeIds.value = []
    selectedGoods.value = []

    setData()

    findCategoryTree()
})
</script>
<style lang="scss" scoped>
.goods-wrap::after {
    content: '';
    flex: auto;
}

.goods-item {
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
    padding: 6px;

    .select-icon {
        background-color: #ffffff;
        position: absolute;
        right: -8px;
        top: -8px;
        font-size: 20px;
        height: 20px;
        z-index: 1;
        color: var(--el-color-primary) !important;
    }

    .info {
        .name {
            font-size: 15px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            /* 设置行数 */
            -webkit-box-orient: vertical;
        }
    }
}

.selected {
    border-color: var(--el-color-primary) !important;
}

.goods-item:hover {
    border-color: var(--el-color-primary) !important;
}
</style>
  