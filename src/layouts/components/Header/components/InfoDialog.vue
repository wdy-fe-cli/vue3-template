<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="500px" draggable>
    <el-form ref="ruleFormRef" :model="ruleForm" label-width="90px">
      <el-form-item label=" 上传头像" prop="avatar">
        <UploadImg v-model:image-url="ruleForm.avatar" width="80px" height="80px" border-radius="40px" file-size="2">
          <template #empty>
            <el-icon><Picture /></el-icon>
          </template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="个人邮箱" prop="email">
        <el-input v-model="ruleForm.email" class="w240" type="text" placeholder="请输入邮箱" clearable></el-input>
      </el-form-item>

      <el-form-item label="生日" prop="birthday">
        <div class="wrap">
          <el-date-picker v-model="ruleForm.birthday" type="date" format="YYYY-MM-DD" value-format="x" clearable editable></el-date-picker>
        </div>
      </el-form-item>

      <el-form-item :label="item.label" v-for="(item, index) in commonInfo" :key="index">
        <span>{{ ruleForm[item.key] || '--' }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button v-blur @click="dialogVisible = false">取消</el-button>
        <el-button v-blur type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from 'dayjs'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import UploadImg from '@/components/Upload/Img.vue'
import { useUserStore } from '@/store/modules/user.js'
import { http } from '@/api'
import { showReqError } from '@/hooks/useError'

const dialogVisible = ref(false)
const userStore = useUserStore()
const openDialog = () => {
  dialogVisible.value = true
}
const ruleFormRef = ref(null)
let ruleForm = ref({
  avatar: null,
  email: '',
  birthday: null
})

/**
 * 请求参数
 */
const handleSubmitData = async () => {
  const params = { ...ruleForm.value }
  try {
    let res = await http('updateModuleUserInfoById', params)
    if (res.isError) return showReqError(res)
    ElMessage.success('保存成功')
    dialogVisible.value = false
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

let commonInfo = [
  { label: '用户角色', key: 'roleName' },
  { label: '用户姓名', key: 'name' },
  { label: '用户性别', key: 'sex' },
  { label: '用户手机号', key: 'phone' },
  { label: '员工工号', key: 'jobNo' },
  { label: '创建时间', key: 'createTime' },
  { label: '创建人', key: 'creatorName' },
  { label: '修改时间', key: 'modifyTime' }
]

watch(
  () => userStore.userInfo,
  () => {
    let temData = JSON.parse(JSON.stringify(userStore.userInfo))
    temData.createTime = dayjs(temData.createTime).format('YYYY-MM-DD HH:mm:ss')
    temData.modifyTime = dayjs(temData.modifyTime).format('YYYY-MM-DD HH:mm:ss')
    temData.sex = temData.sex === 1 ? '男' : temData.sex === 2 ? '女' : '保密'
    // 处理用户角色
    // 模拟多角色测试
    // temData.roleDTOS.push({ id: '118555371260478464', name: '测试1', type: '01' })
    // temData.roleDTOS.push({ id: '118555371260478464', name: '测试2', type: '01' })
    if (temData?.roleDTOS && Array.isArray(temData.roleDTOS) && temData?.roleDTOS.length > 0) {
      temData.roleName = temData.roleDTOS
        .map((item) => item.name)
        .reduce((pre, cur) => {
          // 第一项前不加逗号
          if (pre === '') {
            return cur
          }

          return `${pre}、${cur}`
        }, '')
    }

    ruleForm.value = temData
  },
  { immediate: true },
  () => {}
)

defineExpose({ openDialog })
</script>

<style lang="scss" scoped>
.wrap {
  :deep {
    .el-input__wrapper {
      width: 218px;
    }
  }
}
</style>
