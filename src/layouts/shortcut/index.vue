<template>
  <page title="快捷导航设置" has-handler>
    <section flex="cross:center">
      <span class="mr16">启用快捷导航</span>
      <el-switch :model-value="showShortcut" @change="changeShowShortcut"></el-switch>
    </section>

    <div class="table-header bb mt24 bt bold" flex="cross:center">
      <div class="s-w126 s-title-margin br s-line-height">一级菜单</div>
      <div class="s-w245 s-title-margin br s-line-height">下级菜单</div>
    </div>

    <div class="limit-wrap">
      <div v-show="treeOptions.length > 0" class="mt24">
        <el-tree
          :data="treeOptions"
          :props="{ label: 'title' }"
          show-checkbox
          default-expand-all
          node-key="id"
          ref="treeRef"
          icon-class=""
          :expand-on-click-node="false"></el-tree>
      </div>
    </div>

    <page-handle confirm-text="保存" @confirm="onConfirm" />
  </page>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'
import { isEmpty } from '@/utils/validate'
import { http } from '@/api'

let treeOptions = ref([])
let treeRef = ref([])

const authStore = useAuthStore()

const showShortcut = computed(() => authStore.showShortcutGet)
const shortcuts = computed(() => authStore.shortcutsGet)

const menuList = computed(() => authStore.authMenuList)

/**
 * 修改 switch 状态
 * @param {Boolean} val switch 切换状态
 */
const changeShowShortcut = async (val) => {
  try {
    let res = await http('apiUpdateShortcutStatus', { status: val })
    if (res.isError) return
    authStore.showShortcut = val
  } catch (error) {
    console.log(error)
  }
}
/**
 *  确认保存这个设置
 * @param {*} checked 是否选中
 * @param {*} id 选中的 id
 */
const onConfirm = async () => {
  const params = {
    menuIds: treeRef.value.getCheckedKeys()
  }
  try {
    let res = await http('apiSaveUserMenuSetting4Batch', params)
    if (res.isError) return
    ElMessage.success('保存成功')
    authStore.apiUserConfig()
  } catch (error) {
    console.log(error)
  }
}

/**
 * 处理菜单数据
 * @param {*} children 递归传入的参数
 */
const handleSystemMenu = (children) => {
  const arr = []
  if (!isEmpty(children) && children.length > 0) {
    children.forEach((item) => {
      item.children = handleSystemMenu(item.children)
      if (!item.isHide) {
        arr.push(item)
      }
    })
  }
  return arr
}

watch(
  menuList,
  () => {
    treeOptions.value = handleSystemMenu(menuList.value)
  },
  { immediate: true }
)
watch(
  shortcuts,
  () => {
    nextTick(() => {
      let tempIds = shortcuts.value.map((item) => item.id)
      treeRef.value.setCheckedKeys(tempIds)
    })
  },
  { immediate: true }
)
</script>
<style lang="scss" scoped>
$headerHeight: 50px;
$marginLeft: 50px;
$color-de: #dedede;

.limit-wrap {
  height: calc(100% - 50px);
  position: relative;
  .btn-save {
    margin-right: 24px;
  }
  :deep .el-tree {
    border-top: #eeeeee solid 1px;
    border-bottom: #eeeeee solid 1px;
    margin-top: -1px;
  }
  :deep .el-tree-node {
    border-top: #eeeeee solid 1px;
    margin-top: -1px;
  }
  :deep .el-tree-node__content {
    width: 140px !important;
    float: left !important;
    margin: 12px 22px;
  }

  :deep .el-tree-node__expand-icon.is-leaf {
    display: none;
  }

  :deep .el-tree-node__expand-icon.expanded {
    display: none;
  }

  :deep .el-tree-node.is-current > .el-tree-node__content:hover {
    background: #fff !important;
  }

  :deep .el-tree > div {
    height: auto;
    overflow: hidden;
    background: #fff !important;
  }

  :deep .el-tree-node__children {
    border-left: #eeeeee solid 1px;
  }

  :deep .el-tree-node:hover {
    background: #fff !important;
  }
}
.s-title-margin {
  margin-left: $marginLeft;
}
.s-line-height {
  line-height: $headerHeight;
}
.s-w126 {
  width: 126px;
}
.s-w245 {
  width: 245px;
}
.s-ml40 {
  margin-left: 40px;
}
.shortcut-wrap {
  padding-bottom: 100px;
  overflow-y: scroll;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}
.table-header {
  height: $headerHeight;
  background-color: #f9f9f9;
}
.current-value-text {
  font-weight: bold;
}

.table-wrap {
  .first-box {
    .first {
      min-height: 50px;
      width: 176px;
      flex-shrink: 0;
    }
  }

  .second-wrap {
    flex: 1;
    .second {
      width: 295px;
    }
  }

  .third {
    padding: 16px 0;
    flex: 1;
  }

  .mtb16 {
    margin: 16px 0;
  }

  .ml25 {
    margin-left: 25px;
  }

  .ml50 {
    margin-left: 50px;
  }
}
</style>
