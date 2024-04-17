<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <!-- <AssemblySize id="assemblySize" /> -->
      <!-- <Language id="language" /> -->
      <!-- <TopOrgsSelect id="topOrgsSelect" /> -->
      <SearchMenu id="searchMenu" />
      <ThemeSetting id="themeSetting" />
      <Message id="message" />
      <Fullscreen id="fullscreen" />
    </div>
    <span class="username">{{ username }}</span>
    <Avatar />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
// import AssemblySize from './components/AssemblySize.vue'
// import Language from './components/Language.vue'
import SearchMenu from './components/SearchMenu.vue'
import ThemeSetting from './components/ThemeSetting.vue'
import Message from './components/Message.vue'
import Fullscreen from './components/Fullscreen.vue'
import Avatar from './components/Avatar.vue'
// import TopOrgsSelect from './components/TopOrgsSelect.vue'

const userStore = useUserStore()
const username = computed(() => userStore.userInfo.name || userStore.userInfo.username)

onMounted(() => {
  userStore.getUserInfo()
})
</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 25px;
  .header-icon {
    display: flex;
    align-items: center;
    font-size: 9px;
    & > * {
      margin-left: 21px;
    }
  }
  .username {
    margin: 0 20px;
    font-size: 15px;
  }
}
</style>
