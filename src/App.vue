<template>
  <div :class="['app', { 'no-header': hideLayout }]">
    <!-- 고정된 헤더 -->
    <div class="header-wrapper" v-if="!hideLayout">
      <Header :isDarkMode="isDarkMode" @toggle-dark-mode="isDarkMode = !isDarkMode" />
    </div>

    <!-- 사이드바 + 메인 레이아웃 -->
    <div class="layout" v-if="!hideLayout">
      <Sidebar
        @menu-selected="selectedMenu = $event"
        :selected="selectedMenu"
      />
      <div class="content-area">
        <SubSidebar
          v-if="selectedMenu"
          :menu="selectedMenu"
          @clear-menu="clearSelectedMenu"
        />
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- 레이아웃 없이 RouterView만 보여줌 -->
    <div v-else>
      <RouterView />
    </div>

    <!-- 챗봇 -->
    <FloatingChat v-if="!hideLayout" @toggle="showChatbot = !showChatbot" />
    <transition name="chat-pop" appear>
      <ChatModal v-if="showChatbot" @close="showChatbot = false" />
    </transition>

    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import Header from './components/header/Header.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import SubSidebar from './components/sidebar/SubSidebar.vue'
import FloatingChat from './components/chatbot/FloatingChat.vue'
import ChatModal from './components/chatbot/ChatModal.vue'
import BaseToast from '@/components/toast/BaseToast.vue'
import { useAttendanceStore } from '@/stores/attendance'

const toastRef = ref(null)
const attendanceStore = useAttendanceStore()
const route = useRoute()
const selectedMenu = ref(null)
const showChatbot = ref(false)
const hideLayout = computed(() => route.meta.hideLayout)

let alertedAtSix = false

const isDarkMode = ref(false)

onMounted(async () => {
  window.addEventListener('wheel', preventZoom, { passive: false })
  window.addEventListener('keydown', preventKeyZoom)

  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      const { data } = await axios.get('/api/user/dark-mode', {
        headers: { Authorization: `Bearer ${token}` },
      })
      isDarkMode.value = data
    } catch (err) {
      console.error('다크모드 불러오기 실패:', err)
      isDarkMode.value = localStorage.getItem('darkMode') === 'true'
    }
  } else {
    isDarkMode.value = localStorage.getItem('darkMode') === 'true'
  }

  setInterval(() => {
    const nowTime = new Date()
    const checkIn = attendanceStore.checkIn
    const checkOut = attendanceStore.checkOut
    const isCheckedIn = attendanceStore.isCheckedIn

    if (
      nowTime.getHours() === 18 &&
      nowTime.getMinutes() === 0 &&
      !checkOut &&
      checkIn &&
      isCheckedIn &&
      !alertedAtSix
    ) {
      alertedAtSix = true
      showToast('18시가 되었습니다. 퇴근을 등록해주세요.')
    }
  }, 1000)
})

watch(isDarkMode, async (val) => {
  document.body.classList.toggle('dark', val)
  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      await axios.post(
        '/api/user/dark-mode',
        { darkModeEnabled: val },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error('다크모드 저장 실패:', err)
    }
  } else {
    localStorage.setItem('darkMode', val)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', preventZoom)
  window.removeEventListener('keydown', preventKeyZoom)
})

function preventZoom(e) {
  if (e.ctrlKey) e.preventDefault()
}
function preventKeyZoom(e) {
  if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
    e.preventDefault()
  }
}
function clearSelectedMenu() {
  selectedMenu.value = null
}
function showToast(msg) {
  toastRef.value?.show(msg)
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: auto;
  font-family: sans-serif;
  background-color: var(--bg-body);
  color: var(--text-main);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.app {
  min-height: 100vh;
  padding-top: 60px;
  background-color: var(--bg-app);
}

.app.no-header {
  padding-top: 0;
}

.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background-color: var(--bg-header);
  box-shadow: 0 2px 4px var(--shadow-header);
}

.layout {
  display: flex;
  position: relative;
  width: 100%;
}

.sidebar {
  width: 180px;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--bg-sidebar);
}

.content-area {
  flex: 1;
  position: relative;
}

.sub-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 160px;
  height: 100%;
  background-color: var(--bg-sub-sidebar);
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

.main-content {
  padding: 20px;
  /* background-color: var(--bg-main); */
  box-sizing: border-box;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
