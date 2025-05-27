<template>
  <header>
    <Header />
  </header>
  <div class="layout" ref="layoutRef">
    <Sidebar
      @menu-selected="selectedMenu = $event"
      :selected="selectedMenu"
    />

    <transition name="slide-fade">
      <SubSidebar v-if="selectedMenu" :menu="selectedMenu" @clear-menu="clearSelectedMenu"/>
    </transition>
      <div class="main-content">
        <RouterView />
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
    // layout 영역 바깥 클릭 시 메뉴 초기화
    const clickedInside = layoutRef.value?.contains(event.target)
    if (!clickedInside) {
      selectedMenu.value = null
    }
  }

  function clearSelectedMenu() {
    selectedMenu.value = null
  }

  onMounted(() => {
    setTimeout(() => { // ✅ 마운트 직후 자동 클릭 방지용
      document.addEventListener('click', handleClickOutside)
    }, 0)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

</script>

<style scoped>
  .layout {
    display: flex;
    position: relative;
    z-index: 10;
  }

  .main-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 24px;
    background-color: #fff;
  }

    .slide-fade-enter-active,
    .slide-fade-leave-active {
        transition: all 0.3s ease;
    }
    .slide-fade-enter-from {
        opacity: 0;
        transform: translateX(-20px);
    }
    .slide-fade-enter-to {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-fade-leave-from {
        opacity: 1;
        transform: translateX(0);
    }
    .slide-fade-leave-to {
        opacity: 0;
        transform: translateX(-20px);
    }
</style>
