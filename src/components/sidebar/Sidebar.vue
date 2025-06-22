<template>
  <aside class="sidebar">
    <!-- 상단 HOME -->
    <RouterLink to="/" class="home-link">
      <div class="home">
        HOME
      </div>
    </RouterLink>

    <div
      v-for="(menu, index) in menuItems"
      :key="index"
      class="menu-button"
      @click="onClick(menu)"
    >
      {{ menu.name }}
    </div>

    <!-- 하단 출근 박스 -->
    <AttendanceCard class="attendance-card" />
  </aside>
</template>

<script setup>
import AttendanceCard from './AttendanceCard.vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['menu-selected'])
const router = useRouter()

const menuItems = [
  { name: '인사 정보' },
  { name: '근태 관리' },
  { name: '조직 및 직무' },
  { name: '전자 결재' },
  { name: '급여' },
  { name: '평가 및 성과' },
  { name: '공지 사항', path: '/post' },
  { name: '용어 사전', path: '/dictionary' }
]

function onClick(menu) {
  if (menu.path) {
    router.push(menu.path)
  } else {
    emit('menu-selected', menu.name)
  }
}
</script>

<style scoped>
.sidebar {
  overflow-x: hidden;
  margin-top: -6px;
  width: 180px;
  overflow-y: auto;
  min-height: calc(100vh - 60px);
  background-color: var(--bg-sidebar);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: 0.5px 0 5px var(--shadow-sidebar);
  gap: 22px;
  overflow: visible;
}

.attendance-card {
  opacity: 80%;
  margin-left: -5px;
  position: sticky;
  bottom: 20px;
  margin-top: auto;
}

.home {
  background-color: var(--primary);
  color: var(--text-on-primary);
  font-weight: bold;
  font-size: 18px;
  text-align: left;
  padding: 12px 20px;
  width: calc(100% + 20px);
  margin-right: -20px;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  letter-spacing: 1px;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
}

.home:hover {
  background-color: var(--primary-hover);
  cursor: pointer;
  box-shadow: inset 0px 0px 10px 10px var(--hover-shadow);
}

.home-link {
  text-decoration: none;
  color: inherit;
}

.menu-button {
  width: 95%;
  background: var(--bg-box);
  margin-left: 7px;
  font-weight: bold;
  border: none;
  border-radius: 23px;
  padding: 15px 0;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0px 0px 5px 4px var(--menu-btn-shadow);
  transition: background-color 0.3s, box-shadow 0.3s;
  text-align: center;
}

.menu-button:hover {
  background-color: var(--bg-menu-btn-hover);
  box-shadow: inset 0px 0px 10px 10px var(--hover-shadow);
}
</style>
