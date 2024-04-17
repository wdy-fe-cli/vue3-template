<template>
  <el-dialog width="450px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <span>{{ !isEdit ? '新增属性' : '编辑属性' }}</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="130px">
      <el-form-item label="属性分类" prop="classId">
        <el-select v-model="ruleForm.classId" class="w240" placeholder="请选择">
          <el-option v-for="item in orgLabelOptions" :key="item.id" :label="item.name" :value="item.id" v-auth="'findPropClassList'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="属性名称" prop="name">
        <el-input class="w240" v-model="ruleForm.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="加价价格" prop="propValue">
        <el-input class="w240" v-model="ruleForm.propValue" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="排序码" prop="sequence">
        <el-input class="w240" v-model="ruleForm.sequence" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="是否参与单品折扣" prop="isDiscount">
        <el-radio-group v-model="ruleForm.isDiscount" class="ml-4" style="margin-top: -4px">
          <el-radio :label="1" size="large">是</el-radio>
          <el-radio :label="0" size="large">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="分类下属性是否允许修改数量" prop="isModifyQuantity">
        <el-radio-group v-model="ruleForm.isModifyQuantity" class="ml-4">
          <el-radio label="1" size="large">是</el-radio>
          <el-radio label="0" size="large">否</el-radio>
        </el-radio-group>
      </el-form-item> -->
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
import { ref, reactive /* nextTick */ } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'
import { getStorage } from '@/utils/storage'

const showDialog = ref(false)
const ruleFormRef = ref()
let tempParentId = ''
let orgLabelOptions = ref([])

const emit = defineEmits(['dialogClosed'])
let isEdit = false
let ruleForm = ref({
  name: '',
  isDiscount: 0
})

/**
 * 父组件调弹框显示方法
 */
const show = (row) => {
  console.log(row)
  showDialog.value = true

  if (row) {
    // tempParentId = row.id
    isEdit = true
    ruleForm.value = JSON.parse(JSON.stringify(row))
    console.log(ruleForm.value)
  } else {
    // resetRuleFormData()
    ruleForm.value = {
      name: '',
      isDiscount: 0
    }
    isEdit = false
  }
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
 * 获取分类标签
 */
const apiFindOrgLabelEnList = async () => {
  try {
    let res = await http('findPropClassList')
    if (res.isError) return showReqError(res)
    orgLabelOptions.value = res.content
    // console.log('获取分类标签', res.content)
  } catch (error) {
    console.log(error)
  }
}
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
  const apiName = !isEdit ? 'insertProp' : 'modifyProp'
  const params = {
    ...ruleForm.value,
    orgId: getStorage('orgId')
  }

  if (tempParentId) {
    params.parentId = tempParentId
  }
  console.log(params)
  try {
    let res = await http(apiName, params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    showDialog.value = false
    dialogClosed()
  } catch (error) {
    console.log(error)
  }
}

const rules = reactive({
  classId: [{ required: true, message: '请选择', trigger: 'blur' }],
  name: [{ required: true, message: '请输入', trigger: 'blur' }]
})

apiFindOrgLabelEnList()
defineExpose({ show })

/* const resetRuleFormData = async () => {
  nextTick(() => {
    ruleFormRef.value.resetFields()
    ruleForm.value = {}
  })
} */
</script>
<style lang="scss" scoped></style>
