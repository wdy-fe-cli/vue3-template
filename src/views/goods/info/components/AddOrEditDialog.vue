<template>
  <el-dialog width="550px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>{{ isAddorEdit === 'add' ? '新增属性' : '编辑属性' }}</span>
    </template>
    <el-table :data="propListTableData" border stripe>
      <el-table-column label="属性类型" width="180">
        <template #default="scope">
          <el-select v-model="scope.row.classId" class="" placeholder="请选择" clearable @change="setProp(scope.row, scope.$index)">
            <el-option v-for="item in propOptions" :key="item.classId" :label="item.className" :value="item.classId" :disabled="item.disabled"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="商品属性">
        <template #default="scope">
          <el-select v-model="scope.row.attrId" multiple class="mb12 mt10" placeholder="请选择" clearable>
            <el-option v-for="item in scope.row.propList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="80">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="batchDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button icon="CirclePlus" @click="addProp" class="mt10">新增属性</el-button>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
let orgLabelOptions = ref([])
const propListTableData = ref([])

const emit = defineEmits(['getPropData'])

let propOptions = ref([])

/**
 * 父组件调弹框显示方法
 */
let oldTbList = []
// 记录新增还是编辑
let isAddorEdit = ref('add')
const show = (val, type) => {
  console.log('val', val)

  if (type === 'add') {
    isAddorEdit.value = 'add'
    oldTbList = val
    propListTableData.value = []
  } else {
    isAddorEdit.value = 'edit'
    oldTbList = val
    propListTableData.value = JSON.parse(JSON.stringify(val))
  }

  showDialog.value = true
  findPropTree()
}

const addProp = () => {
  let oldTbIdList = oldTbList.map((item) => item.classId)

  propOptions.value.forEach((item) => {
    if (oldTbIdList.includes(item.classId)) {
      item.disabled = true
    }
  })

  propListTableData.value.push({})
}

const setProp = (val, index) => {
  // console.log(val, index)
  // console.log('test', propListTableData.value, propOptions.value)

  propListTableData.value[index].attrId = [] // 清空副下拉框选项
  propOptions.value.forEach((item) => {
    if (item.classId === val.classId) {
      propListTableData.value[index] = {
        ...item,
      }
    }
  })
  // console.log(propListTableData.value)
}

const submitForm = async () => {
  console.log('666', propListTableData.value, oldTbList)

  let flagArr = propListTableData.value.map((item) => item.propList === undefined)
  if (flagArr.some((item) => item === true)) {
    ElMessage.warning('新增属性不能为空')
    return
  }

  // 如果是新增(新增时才合并旧的，编辑直接赋值)
  if (isAddorEdit.value === 'add') {
    propListTableData.value = oldTbList.concat(propListTableData.value)
  }

  // 去空处理 属性类型，或者商品属性 其中有一个不存在，则数据中删除该项
  // 如果classId或者attrId为空，则删除该项
  propListTableData.value = propListTableData.value.filter((item) => item.classId && item.attrId && item.attrId.length > 0)

  showDialog.value = false

  emit('getPropData', JSON.parse(JSON.stringify(propListTableData.value)))
}

const findPropTree = async () => {
  try {
    let res = await http('findPropTree')
    if (res.isError) return showReqError(res)
    propOptions.value = res.content

    if (isAddorEdit.value === 'edit') {
      // 回显数据arrtId
      propListTableData.value.forEach((item) => {
        item.attrId = item.propList.map((k) => k.id)
      })

      // 同步下拉框数据
      propListTableData.value.forEach((item) => {
        propOptions.value.forEach((k) => {
          if (item.classId === k.classId) {
            item.propList = k.propList
          }
        })
      })
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * 获取分类标签
 */
const apiFindOrgLabelEnList = async () => {
  try {
    let res = await http('findPropClassList')
    if (res.isError) return showReqError(res)
    orgLabelOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
}

const batchDelete = (index) => {
  propListTableData.value.splice(index, 1)
}

/* const rules = reactive({
  classId: [{ required: true, message: '请选择属性分类', trigger: 'blur' }],
  name: [{ required: true, message: '请输入属性名称', trigger: 'blur' }]
}) */

apiFindOrgLabelEnList()
defineExpose({ show })
</script>
<style lang="scss" scoped></style>
