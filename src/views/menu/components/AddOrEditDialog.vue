<template>
  <el-dialog width="420px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <!-- <span>分类信息</span> -->
      <span>{{ !isEdit ? '新增模板' : '编辑模板' }}</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="模板类型" prop="groupTypes">
        <el-checkbox-group v-model="ruleForm.groupTypes" class="ml-4">
          <el-checkbox label="0">全部类型</el-checkbox>
          <el-checkbox label="1">堂食</el-checkbox>
          <el-checkbox label="2">扫码点餐</el-checkbox>
          <el-checkbox label="3">外卖</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input class="w280" v-model="ruleForm.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="生效日期" prop="datePicker">
        <!-- :default-time="['00:00:00', '23:59:59']" -->
        <el-date-picker
          v-model="ruleForm.datePicker"
          type="daterange"
          range-separator="—"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="生效时间" required>
        <el-form-item prop="startTime">
          <el-time-select style="width: 115px" v-model="ruleForm.startTime" start="00:00" step="00:01" end="23:45" placeholder="请选择" @change="ruleForm.endTime = '23:59'" />
        </el-form-item>
        <span class="ml8 mr8">—</span>
        <el-form-item prop="endTime">
          <el-time-select style="width: 115px" v-model="ruleForm.endTime" :min-time="ruleForm.startTime" start="00:00" step="00:01" end="23:59" placeholder="请选择" />
        </el-form-item>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="ruleForm.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="-1">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="showDialog = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// import UploadImg from '@/components/Upload/Img.vue'
import dayjs from 'dayjs'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'
import { getStorage } from '@/utils/storage'

const showDialog = ref(false)
const ruleFormRef = ref()

// const defaultTime = reactive([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)])

// let categoryOptions = ref([])
// let statiscOptions = ref([])

const emit = defineEmits(['dialogClosed'])
let isEdit = false
let ruleForm = ref({
  name: '',
  description: '',
  datePicker: [],
})
// let datePicker = ref([])

/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  showDialog.value = true

  console.log(row)

  if (row) {
    // tempParentId = row.id
    ruleForm.value = JSON.parse(JSON.stringify(row))
    // datePicker.value = [dayjs(row.startDate).format('YYYY-MM-DD'), dayjs(row.endDate).format('YYYY-MM-DD')]

    ruleForm.value.datePicker = [`${dayjs(row.startDate).format('YYYY-MM-DD')} ${row.startTime}`, `${dayjs(row.endDate).format('YYYY-MM-DD')} ${row.endTime}`]
    console.log(ruleForm.value.datePicker)

    isEdit = true
  } else {
    ruleForm.value = {
      groupTypes: [],
      name: '',
      status: 1,
      startTime: '00:00',
      endTime: '23:59',
    }
    isEdit = false
    // resetRuleFormData()
  }
  /* showDialog.value = true
  ruleForm.value = {}
  if (type) {
    findCategoryTree()
    statiscategoryFindList()
    ruleForm.value.parentId = row.id
    console.log(row.id)
  }
  if ((row && row.parentId !== '0') || (row && row.parentId === '0' && !type)) {
    findCategoryById(row.id)
    isEdit = true
    return
  }
  isEdit = false */
}
/**
 * 获取详情
 */
/* const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findCategoryById', params)
    if (res.isError) return showReqError(res)

    ruleForm.value = res.content
  } catch (error) {
    console.log(error)
  }
} */
/**
 *  弹框关闭，父组件更新
 */
const dialogClosed = () => {
  emit('dialogClosed')
}

/**
 * 获取地址信息树
 */
/* const statiscategoryFindList = async () => {
  try {
    let res = await http('statiscategoryFindList')
    if (res.isError) return showReqError(res)
    statiscOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
} */

/**
 * 获取详情
 */
/* const findCategoryTree = async () => {
  const params = { deep: 1 }
  try {
    let res = await http('findCategoryTree', params)
    if (res.isError) return showReqError(res)
    categoryOptions.value = res.content
  } catch (error) {
    console.log(error)
  }
} */
// /**
//  * 校验 form 表单
//  * @param {El} formEl form 的对象
//  */
// const submitForm = async (formEl) => {
//   if (!formEl) return
//   await formEl.validate((valid, fields) => {
//     if (valid) {
//       handleSubmitData()
//     } else {
//       console.log('error submit!', fields)
//     }
//   })
// }

// /**
//  * 处理请求数据
//  */
// const handleSubmitData = async () => {
//   const apiName = !isEdit ? 'insertCategory' : 'modifyCategory'
//   const params = {
//     ...ruleForm.value
//   }

//   try {
//     let res = await http(apiName, params)
//     if (res.isError) return showReqError(res)
//     ElMessage.success('保存成功')
//     showDialog.value = false
//     dialogClosed()
//   } catch (error) {
//     console.log(error)
//   }
// }

/**
 * 校验 form 表单
 * @param {El} formEl form 的对象
 */
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      handleSubmitData()
    } else {
      console.log('error submit!', fields)
    }
  })
}

/**
 * 处理请求数据
 */
const handleSubmitData = async () => {
  const params = {
    ...ruleForm.value,
    groupId: ruleForm.value.id,
    orgId: getStorage('orgId'),
  }
  params.startDate = ruleForm.value.datePicker[0]
  params.endDate = ruleForm.value.datePicker[1]
  // params.startTime = ruleForm.value.datePicker[0].split(' ')[1]
  // params.endTime = ruleForm.value.datePicker[1].split(' ')[1]
  console.log(params)
  try {
    let res = await http('saveOrUpdateGoodsGroup', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

const rules = reactive({
  name: [{ required: true, message: '请输入', trigger: 'blur' }],
  groupTypes: [{ required: true, message: '请选择', trigger: 'blur' }],
  datePicker: [{ required: true, message: '请选择', trigger: 'blur' }],
})

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
