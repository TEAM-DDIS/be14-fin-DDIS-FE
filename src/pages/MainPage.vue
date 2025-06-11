<template>
  <div class="dashboard-layout">
    <!-- 각 박스 컴포넌트 -->
    <CalendarBox />
    <AttendanceBox />
    <MyStatusBox />
    <NoticeBox />
    <ReminderBox />

    <!-- 자주 쓰는 메뉴 박스 (ref 등록) -->
    <FavoriteMenuBox ref="favoriteMenuRef" @edit="showModal = true" />

    <!-- 메뉴 편집 모달 -->
    <MenuModal
      v-if="showModal"
      :employee-id="userStore.user.employeeId"
      @close="handleModalClose"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

// 대시보드 박스 컴포넌트
import CalendarBox from '@/components/home/CalendarBox.vue'
import AttendanceBox from '@/components/home/AttendanceBox.vue'
import MyStatusBox from '@/components/home/MyStatusBox.vue'
import NoticeBox from '@/components/home/NoticeBox.vue'
import ReminderBox from '@/components/home/ReminderBox.vue'
import FavoriteMenuBox from '@/components/home/FavoriteMenuBox.vue'

// 메뉴 편집 모달
import MenuModal from '@/components/home/menumodal/MenuModal.vue'

// 모달 상태 및 사용자 스토어
const showModal = ref(false)
const userStore = useUserStore()

// ref: FavoriteMenuBox 인스턴스
const favoriteMenuRef = ref(null)

// 모달 닫을 때 메뉴 다시 불러오기
function handleModalClose(payload) {
  showModal.value = false
  if (payload?.updated) {
    favoriteMenuRef.value?.fetchFavorites()
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 45% 20% 23% 10%;
  grid-template-rows: auto auto;
  grid-template-areas:
    "calendar attendance my-status quick-menu"
    "notice reminder reminder quick-menu";
  gap: 16px;
  padding: 18px;
  min-width: 1200px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
</style>
