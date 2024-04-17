<template>
  <el-dropdown trigger="click">
    <div class="avatar">
      <img :src="avatar" v-if="avatar" alt="avatar" />
      <img src="@/assets/images/avatar.jpg" v-else alt="avatar" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="openDialog('infoRef')">
          <el-icon><User /></el-icon>
          {{ $t('header.personalData') }}
        </el-dropdown-item>
        <el-dropdown-item @click="openDialog('passwordRef')">
          <el-icon><Edit /></el-icon>
          {{ $t('header.changePassword') }}
        </el-dropdown-item>
        <el-dropdown-item divided @click="logout">
          <el-icon><SwitchButton /></el-icon>
          {{ $t('header.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <!-- infoDialog -->
  <InfoDialog ref="infoRef"></InfoDialog>
  <!-- passwordDialog -->
  <PasswordDialog ref="passwordRef"></PasswordDialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { confirmLogout } from '@/hooks/useLogin'

import InfoDialog from './InfoDialog.vue'
import PasswordDialog from './PasswordDialog.vue'

const userStore = useUserStore()
const avatar = computed(() => userStore.userInfo.avatar)

// 退出登录
const logout = () => {
  ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 重定向到登陆页
    confirmLogout()
  })
}

// 打开修改密码和个人信息弹窗
const infoRef = ref(null)
const passwordRef = ref(null)
const openDialog = (temRef) => {
  if (temRef === 'infoRef') infoRef.value?.openDialog()
  if (temRef === 'passwordRef') passwordRef.value?.openDialog()
}

onMounted(() => {})
</script>

<style scoped lang="scss">
.avatar {
  border: 1px solid #ccc;
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 50%;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
