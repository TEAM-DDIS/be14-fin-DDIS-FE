<template>
  <div class="app">
    <!-- 고정된 헤더 -->
    <div class="header-wrapper">
      <Header />
    </div>

    <!-- 실제 콘텐츠 영역: 사이드바 + 서브사이드바 + 메인 -->
    <div class="layout">
      <Sidebar
        @menu-selected="selectedMenu = $event"
        :selected="selectedMenu"
      />
      <div class="content-area">
        <!-- ✅ SubSidebar는 main 위에 겹쳐서 위치 -->
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
  </div>
  
</template>

<script setup>
import { ref,  onMounted, onBeforeUnmount } from 'vue'
import Header from './components/header/Header.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import SubSidebar from './components/sidebar/SubSidebar.vue'
import { RouterView } from 'vue-router'

const selectedMenu = ref(null)
onMounted(() => {
  window.addEventListener('wheel', preventZoom, { passive: false })
  window.addEventListener('keydown', preventKeyZoom)
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
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: auto;
  font-family: sans-serif;
  background-color: #f9f9f9;

    -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none

}

/* 앱 전체 */
.app {
  min-height: 100vh;
  padding-top: 60px; /* 헤더 높이만큼 공간 확보 */
  background-color: #f9f9f9;

}

/* 고정된 헤더 */
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 콘텐츠 레이아웃 */
.layout {
  display: flex;
    position: relative;  /* ✅ SubSidebar 위치 기준점 */

  width: 100%;
}

/* 사이드바 */
.sidebar {
  width: 180px;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f5f5;
}
/* 새로 묶은 content-area: position relative 기준 제공 */
.content-area {
  flex: 1;
  position: relative;
}
/* SubSidebar: 겹쳐서 절대 위치 */
.sub-sidebar {
  position: absolute;
  top: 0;
  left: 0; /* content-area 내부 기준이므로 여기선 0 */
  width: 160px;
  height: 100%;
  background-color: #f0f0f0;
  z-index: 10;
  box-shadow: 2px 0 5px rgba(0,0,0,0.05);
}

/* 메인 콘텐츠 */
.main-content {
  padding: 20px;
  background-color: #f9f9f9;
  box-sizing: border-box;
  overflow: hidden;
}

</style>
