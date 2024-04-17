<template>
  <el-dialog width="420px" v-model="showDialog" :close-on-click-modal="false" :modal-append-to-body="false" :close-on-press-escape="false">
    <template #header>
      <!-- <span>分类信息</span> -->
      <span>{{ !isEdit ? '新增分类信息' : '编辑分类信息' }}</span>
    </template>
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="一级分类" prop="parentId" v-if="ruleForm.parentId && ruleForm.parentId !== '0'">
        <!-- <el-select v-model="ruleForm.parentId" class="w240" placeholder="请选择" :disable="isEdit"> -->
        <el-select v-model="ruleForm.parentId" class="w240" placeholder="请选择">
          <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="统计分类" prop="statisCategoryId" v-if="ruleForm.parentId && ruleForm.parentId !== '0'"> -->
      <el-form-item label="统计分类" prop="statisCategoryId">
        <el-select v-model="ruleForm.statisCategoryId" class="w240" placeholder="请选择">
          <el-option v-for="item in statiscOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input class="w240" v-model="ruleForm.name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="排序码" prop="sequence">
        <el-input class="w240" v-model="ruleForm.sequence" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input class="w240" v-model="ruleForm.code" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="图标" prop="picUrl">
        <UploadImg v-model:image-url="ruleForm.picUrl" width="80px" height="80px" file-size="2">
          <template #empty>
            <el-icon><Picture /></el-icon>
          </template>
        </UploadImg>
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
import UploadImg from '@/components/Upload/Img.vue'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const showDialog = ref(false)
const ruleFormRef = ref()

let categoryOptions = ref([])
let statiscOptions = ref([])

const emit = defineEmits(['dialogClosed'])
let isEdit = false
let ruleForm = ref({
  name: '',
  description: ''
})

/**
 * 父组件调弹框显示方法
 */
const show = (row, type) => {
  console.log(row, type)
  showDialog.value = true
  ruleForm.value = {}
  statiscategoryFindList()
  if (type) {
    findCategoryTree()
    // statiscategoryFindList()
    ruleForm.value.parentId = row.id
    console.log(row.id)
  }
  if ((row && row.parentId !== '0') || (row && row.parentId === '0' && !type)) {
    findCategoryById(row.id)
    isEdit = true
    return
  }
  isEdit = false
}
/**
 * 获取详情
 */
const findCategoryById = async (id) => {
  const params = { id }
  try {
    let res = await http('findCategoryById', params)
    if (res.isError) return showReqError(res)

    ruleForm.value = res.content

    console.log(ruleForm.value)
  } catch (error) {
    console.log(error)
  }
}
/**
 *  弹框关闭，父组件更新
 */
const dialogClosed = () => {
  emit('dialogClosed')
}

/**
 * 获取地址信息树
 */
const statiscategoryFindList = async () => {
  try {
    let res = await http('statiscategoryFindList')
    if (res.isError) return showReqError(res)
    statiscOptions.value = res.content
    console.log(statiscOptions.value)
  } catch (error) {
    console.log(error)
  }
}

/**
 * 获取详情
 */
const findCategoryTree = async () => {
  const params = { deep: 1 }
  try {
    let res = await http('findCategoryTree', params)
    if (res.isError) return showReqError(res)
    categoryOptions.value = res.content
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
  const apiName = !isEdit ? 'insertCategory' : 'modifyCategory'
  const params = {
    ...ruleForm.value
  }

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
  name: [{ required: true, message: '请输入', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择', trigger: 'change' }],
  statisCategoryId: [{ required: true, message: '请选择', trigger: 'change' }]
})

defineExpose({ show })
</script>
<style lang="scss" scoped></style>
