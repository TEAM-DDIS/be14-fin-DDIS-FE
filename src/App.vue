<template>
  <div class="app">
    <!-- 1) 로그인 등 레이아웃 숨길 페이지 -->
    <RouterView v-if="route.meta.hideLayout" />

    <!-- 2) 그 외 전체 레이아웃 -->
    <template v-else>
      <!-- 상단 헤더 -->
      <Header />

      <!-- 사이드바 + 서브사이드바 + 메인 콘텐츠 레이아웃 -->
      <div class="layout" ref="layoutRef">
        <Sidebar
          @menu-selected="selectedMenu = $event"
          :selected="selectedMenu"
        />
        <SubSidebar
          v-if="selectedMenu"
          class="subsidebar"
          :menu="selectedMenu"
          @clear-menu="clearSelectedMenu"
        />

        <!-- 메인 콘텐츠 -->
        <main class="main-content">
          <RouterView />
        </main>
      </div>
    </template>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/header/Header.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import SubSidebar from './components/sidebar/SubSidebar.vue'

const route = useRoute()
const selectedMenu = ref(null)
const layoutRef = ref(null)

function handleClickOutside(event) {
  if (!layoutRef.value?.contains(event.target)) {
    selectedMenu.value = null
  }
}
function clearSelectedMenu() {
  selectedMenu.value = null
}

onMounted(() => {
  setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout {
  display: flex;
  flex: 1;
  position: relative;
  overflow: visible;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: #f5f5f5;
}
.subsidebar {
  position: absolute;
  top: 0;
  left: 180px;
  height: 100%;
  z-index: 10;
}
</style>
