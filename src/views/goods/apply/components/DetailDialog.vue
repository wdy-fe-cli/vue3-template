<template>
  <el-dialog width="930px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>审批详情</span>
    </template>
    <el-tabs v-model="activeName" class="tabs-wrap">
      <el-tab-pane label="详情" name="first">
        <!-- <el-form inline class="detail-form">
          <el-form-item
            :label="item.label"
            v-for="(item, index) in detailData"
            :key="index"
            :style="{ border: item.label ? '1px solid #e4e4e4' : '' }">
            <div style="width: 740px" v-if="item.label === '附件' && item.value">
              <el-button type="primary" text icon="Connection" @click="onFileUrl(item.value)" style="padding-left: 0">
                {{ item.value.split(';;;')[0] }}
              </el-button>
            </div>
            <div style="width: 740px" v-else-if="item.label === '备注'">{{ item.value }}</div>
            <div style="width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" v-else>{{ item.value }}</div>
          </el-form-item>
        </el-form> -->

        <el-row class="b" style="border-width: 0.5px">
          <el-col :span="12" flex class="b" style="border-width: 0.5px" v-for="(item, index) in detailData" :key="index">
            <div style="background-color: #f2f3f6; padding: 6px 8px; width: 100px" flex="main:center cross:center" class="br tc item">
              {{ item.label }}
            </div>
            <div v-if="item.label === '附件' && item.value" class="item" style="padding: 6px 8px; flex: 1">
              <el-button type="primary" text icon="Connection" @click="onFileUrl(item.value)" style="padding-left: 0">
                {{ item.value.split(';;;')[0] }}
              </el-button>
            </div>
            <div v-else-if="item.label === '备注'" class="item" style="padding: 6px 8px; flex: 1">{{ item.value }}</div>
            <div v-else class="item" style="padding: 6px 8px; flex: 1">{{ item.value }}</div>
          </el-col>
        </el-row>

        <div class="info-title ml12 mb16 mt16">商品列表</div>

        <ProTable ref="proTableRef" title="列表" :columns="columns" :data="pageData.goodsList" :pagination="false" :tool-button="false"></ProTable>
      </el-tab-pane>
      <el-tab-pane label="进度" name="second">
        <el-steps direction="vertical" :active="1">
          <el-step v-for="(item, index) in progressData" :key="index" :process-status="statusColorMap.get(item.applyStatus)">
            <template #title>
              <span>节点{{ index + 1 }} {{}}</span>
            </template>
            <template #description>
              <!-- eslint-disable vue/no-use-v-if-with-v-for -->
              <div
                v-for="(subItem, j) in item.approvalNodeRelUser"
                :key="j + 'sub'"
                style="color: #333333; width: 800px"
                v-if="item && item.approvalNodeRelUser && item.approvalNodeRelUser.length > 0">
                <el-form inline class="detail-form mt16 mb16">
                  <el-form-item label="审核人" style="border: 1px solid #e4e4e4">
                    <div>{{ subItem.approvalUserName }}</div>
                  </el-form-item>
                  <el-form-item label="审核状态" style="border: 1px solid #e4e4e4">
                    <div :class="subItem.approvalStatus === 3 ? 'color-success' : subItem.approvalStatus === 4 ? 'color-error' : ''">
                      {{ statusMap.get(subItem.approvalStatus) }}
                    </div>
                  </el-form-item>
                  <el-form-item label="操作时间" style="border: 1px solid #e4e4e4">
                    <div v-if="subItem.approvalTime">{{ dayjs(subItem.approvalTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
                  </el-form-item>
                  <el-form-item label="审批意见" style="border: 1px solid #e4e4e4">
                    <div
                      style="width: 180px; overflow: hidden; height: 32px; text-overflow: ellipsis; white-space: nowrap"
                      :title="subItem.approvalDesc">
                      {{ subItem.approvalDesc }}
                    </div>
                  </el-form-item>
                </el-form>
              </div>
              <div v-else style="color: #999999" class="mb24">无审批人</div>
            </template>
          </el-step>
        </el-steps>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <DetailDialog ref="GoodsDetailDialogRef" @dialogClosed="dialogClosed"></DetailDialog>
</template>

<script lang="jsx" setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
import DetailDialog from '../../components/DetailDialog.vue'

import { http } from '@/api'
import { /* downloadFile, */ downloadFileLink } from '@/api/modules/app'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const detailData = ref([])
const pageData = ref({})
const progressData = ref([])
let GoodsDetailDialogRef = ref(null)
const activeName = ref('first')

const statusMap = new Map([
  [1, '审核中'],
  [2, '待我审核'],
  [3, '通过'],
  [4, '驳回'],
  [5, '撤销']
])

const statusColorMap = new Map([
  [1, 'wait'],
  [2, 'wait'],
  [3, 'success'],
  [4, 'error'],
  [5, 'finish']
])

/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  showDialog.value = true
  detailData.value = []
  getDetailData(row.id)
  approvalRecordApprovalProgress(row)
}
/**
 * 点击附件
 */
const onFileUrl = (item) => {
  // console.log(item)
  let name = item.split(';;;')[0]
  let url = item.split(';;;')[1]
  if (url) {
    downloadFileLink(url, name)
  }
}
/**
 * 获取详情
 */
const getDetailData = async (id) => {
  const params = { id }
  try {
    let res = await http('goodsApplyFindById', params)
    if (res.isError) return showReqError(res)
    pageData.value = res.content
    handleDetailData(res.content)
  } catch (error) {
    console.log(error)
  }
}
/**
 * 进度详情
 */
const approvalRecordApprovalProgress = async (row) => {
  const params = {
    approvalId: row.approvalId,
    approvalNum: row.id
  }
  try {
    let res = await http('approvalRecordApprovalProgress', params)
    if (res.isError) return showReqError(res)
    progressData.value = res.content
  } catch (error) {
    console.log(error)
  }
}

/**
 * 处理详情数据
 */
const handleDetailData = (data = {}) => {
  // console.log(data)

  data = JSON.parse(JSON.stringify(data))

  const keysMap = new Map([
    ['title', '申请主题'],
    ['applyType', '签报类型'],
    ['applyName', '申请人'],
    ['applyTime', '申请时间'],
    ['serviceAreaName', '服务区'],
    ['storeName', '店铺'],
    ['note', '备注'],
    ['fileName', '附件']

    // ['creator', '创建人'],
    // ['modifier', '更新人'],
    // ['createTime', '创建时间'],
    // ['modifyTime', '更新时间']
  ])
  keysMap.forEach((key, value) => {
    if (value === 'applyType') {
      data[value] = data[value] === '01' ? '新品申请' : '商品调整'
    }
    if (value === 'fileName') {
      data[value] = data.fileName ? `${data.fileName};;;${data.fileUrl}` : ''
    }

    if (value === 'applyTime') {
      data[value] = dayjs(data[value]).format('YYYY-MM-DD HH:mm:ss')
    }

    detailData.value.push({
      label: key,
      value: data[value]
    })
  })
}

const columns = [
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
    render: (scope) => <span>{scope.row.name || '--'}</span>
  },
  {
    prop: 'goodsId',
    label: '商品ID',
    minWidth: 180,
    // isShow: false, // 在列表中不显示
    // render: (scope) => <span>{scope.row.id || '--'}</span>
    render: (scope) => (
      <el-button link type="primary" onClick={() => GoodsDetailDialogRef.value.show(scope.row)}>
        {scope.row.id || '--'}
      </el-button>
    )
  },
  {
    prop: 'info',
    label: '商品信息',
    width: 220,
    // isShow: false, // 在列表中不显示
    // render: (scope) => <span>{scope.row.name || '--'}</span>
    render: (scope) => {
      let str = (
        <div class="goods_info" flex="cross:center">
          <el-image src={scope.row.picUrl} preview-src-list={[scope.row.picUrl]} style="width:50px;height:42px"></el-image>
          <span class="ml16">{scope.row.name || '--'}</span>
        </div>
      )

      return str
    }
  },
  {
    prop: 'categoryName',
    label: '商品分类',
    minWidth: 120
  },
  {
    prop: 'goodsType',
    label: '商品类型',
    minWidth: 120,
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
      },
      {
        label: '组合套餐',
        value: '04'
      }
    ]
  },
  {
    prop: 'sizeList',
    // isShow: false, // 在列表中不显示
    label: '商品规格',
    minWidth: 120,
    render: (scope) => {
      let result = scope.row.sizeList.map((item) => (
        <div class="goods_info" flex="cross:center">
          <span>{item.sizeTypeName}</span>
          <span class="ml16">¥ {item.price} </span>
        </div>
      ))

      return <div class="size_info">{result}</div>
    }
  },

  {
    prop: 'createTime',
    minWidth: 180,
    label: '创建时间',
    render: (scope) => <span>{dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
  }
]
defineExpose({ show })
</script>
<style lang="scss">
.tabs-wrap {
  .card {
    border-radius: 0;
    padding: 0;
    border: none !important;
    box-shadow: none !important;
  }
}

.goods-title {
  display: block;
  display: -webkit-box;
  text-align: left;
  font-size: 13px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line; /*允许换行*/
  -webkit-box-orient: vertical; /*行向垂直排列*/
  -webkit-line-clamp: 2; /*限制2行*/
}
</style>
