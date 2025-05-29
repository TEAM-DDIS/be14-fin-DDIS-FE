<template>
  <div class="app">
    <!-- 상단 헤더 -->
     <header>
      <Header />
     </header>
    

    <!-- 사이드바 + 서브사이드바 + 메인 콘텐츠 레이아웃 -->
    <div class="layout" ref="layoutRef">
      <Sidebar class="sidebar"
        @menu-selected="selectedMenu = $event"
        :selected="selectedMenu"
      />
      <SubSidebar
        v-if="selectedMenu"
        class="subsidebar"
        :menu="selectedMenu"
        @clear-menu="clearSelectedMenu"
      />

      <!-- 라우터 뷰: 메인 콘텐츠 영역 -->
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Header from './components/header/Header.vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import SubSidebar from './components/sidebar/SubSidebar.vue'
import { RouterView } from 'vue-router'

const selectedMenu = ref(null)
const layoutRef = ref(null)

function handleClickOutside(event) {
  // 레이아웃 영역 외부 클릭 시 서브사이드바 닫기
  const inside = layoutRef.value?.contains(event.target)
  if (!inside) selectedMenu.value = null
}

function clearSelectedMenu() {
  selectedMenu.value = null
}

onMounted(() => {
  // 마운트 직후 이벤트 등록 (0 딜레이)
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
html, body {
  margin: 0; padding: 0;
  height: 100%;
  overflow-x: hidden;       /* 전체 페이지 스크롤 감추기 */
}

.app {
  display: flex;
  flex-direction: column;
  /* min-height: 100vh;
  min-width:100vh; */
  height: 100%;
  background-color: #f9f9f9;
  margin-top: 30px;
}


header {
  width: 100%;
  height: 60px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

/* 사이드바 + 콘텐츠 레이아웃 */
.layout {
  display: flex;
  flex: 1;
  position: relative;
  overflow: visible;
  height: 100%;
  margin-top: 40px;
}

/* 메인 콘텐츠 영역 */
.main-content {
  flex: 1;
  background-color: #f9f9f9;
  overflow-y: auto;
  margin-bottom: -10px;
    margin-top: 30px;

    scrollbar-gutter: stable; 

}

/* SubSidebar 절대 위치 */
.subsidebar {
  position: absolute;
  top: 0;
  left: 180px;
  height: 100%;
  z-index: 10;
}
</style>