<template>
  <div class="message">
    <el-popover placement="bottom" :width="310" trigger="click">
      <template #reference>
        <el-badge :value="messageReadData.unreadMessageCount" class="item" :hidden="!messageData.unreadMessageCount">
          <i :class="'iconfont icon-xiaoxi'" class="toolBar-icon" @click="findMessageByPage"></i>
        </el-badge>
      </template>

      <div class="message-list" v-if="messageList && messageList.length > 0">
        <!-- <div class="message-item" style="cursor: pointer" v-for="(item, index) in messageList" :key="index" @click="onMessage(item)"> -->
        <div class="message-item" v-for="(item, index) in messageList" :key="index">
          <img src="@/assets/images/msg01.png" alt="" class="message-icon" />
          <div class="message-content">
            <span class="message-title">{{ item.content }}</span>
            <!-- <span class="message-date">{{ simpleDuration(item.createTime) }}</span> -->
          </div>
        </div>
      </div>

      <div class="color-info" flex="main:center" style="padding: 32px" v-else>暂无消息</div>
      <!-- <el-tabs v-model="activeName">
        <el-tab-pane label="通知(5)" name="first">
          <div class="message-list">
            <div class="message-item" v-for="(item, index) in messageData" :key="index">
              <img src="@/assets/images/msg01.png" alt="" class="message-icon" />
              <div class="message-content">
                <span class="message-title">一键三连 Wdy-Admin 🧡</span>
                <span class="message-date">一分钟前</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="消息(0)" name="second">
          <div class="message-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无消息</div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="代办(0)" name="third">
          <div class="message-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无代办</div>
          </div>
        </el-tab-pane>
      </el-tabs> -->
    </el-popover>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { showReqError } from '@/hooks/useError'

// import { simpleDuration } from '@/utils/time'

// import { ElMessage } from 'element-plus'
import { http } from '@/api'

// const activeName = ref('first')
const messageList = ref([])
const messageData = ref({})

const messageReadData = ref({ unreadMessageCount: 0 })

const searchData = ref({
  pageNumber: 1,
  pageSize: 100
})

// const onMessage = (item) => {
//   findMessageById(item.id)
// }
/**
 * 消息详情
 */
// const findMessageById = async (id) => {
//   let params = {
//     id
//   }

//   try {
//     let res = await http('findMessageById', params)
//     if (res.isError) return showReqError(res)
//     messageData.value = res.content
//   } catch (error) {
//     console.log(error)
//   }
// }
/**
 * 未读消息接口
 */
let isShow = false
const findMessageByPage = async () => {
  isShow = !isShow
  if (!isShow) return
  let params = {
    ...searchData.value
  }

  try {
    let res = await http('findMessageByPage', params)
    if (res.isError) return showReqError(res)
    messageList.value = res.content.items
  } catch (error) {
    console.log(error)
  }
}
/**
 * 未读消息接口
 */
const findMessagesCountByUser = async () => {
  let params = {}

  try {
    let res = await http('findMessagesCountByUser', params)
    if (res.isError) return showReqError(res)
    messageReadData.value = res.content
  } catch (error) {
    console.log(error)
  }
}

setInterval(() => {
  findMessagesCountByUser()
}, 1000 * 60 * 60)
</script>

<style scoped lang="scss">
.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  line-height: 45px;
}
.message-list {
  display: flex;
  flex-direction: column;
  .message-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    &:last-child {
      border: none;
    }
    .message-icon {
      width: 40px;
      height: 40px;
      margin: 0 20px 0 5px;
    }
    .message-content {
      display: flex;
      flex-direction: column;
      .message-title {
        margin-bottom: 5px;
      }
      .message-date {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
