<template>
  <div class="dashboard-layout">
    <!-- 달력 영역 -->
    <div class="box calendar">달력 영역</div>

    <!-- 팀 근태 현황 영역 -->
    <div class="box attendance">팀 근태 현황</div>

    <!-- 나의 현황 영역 -->
    <div class="box my-status">나의 현황</div>

    <!-- 공지사항 영역 -->
    <div class="box notice">공지 사항</div>

    <!-- REMINDER 내부 박스 (내 일정, 팀 일정, 이벤트) -->
    <div class="box reminder">REMINDER
      <div class="reminder-inner">
        <div class="reminder-box">내 일정</div>
        <div class="reminder-box">팀 일정</div>
        <div class="reminder-box">이벤트</div>
      </div>
    </div>

    <!-- 자주 쓰는 메뉴 영역 -->
    <div class="box quick-menu">
      자주 쓰는 메뉴

      <!-- 메뉴 편집 버튼 -->
      <button class="edit-button" @click="showModal = true">메뉴 편집</button>

      <!-- 메뉴 리스트 영역 -->
      <div class="menu-list">
        <!-- 메뉴 아이템 자리 -->
      </div>
    </div>

    <!-- 메뉴 편집 모달 컴포넌트 -->
    <MenuModal
      v-if="showModal"
      :employee-id="userStore.user.employeeId"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
// Vue의 ref 및 사용자 스토어 사용
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import MenuModal from '@/components/home/MenuModal.vue'

// 사용자 정보 스토어
const userStore = useUserStore()

// 모달 표시 여부 상태 변수
const showModal = ref(false)
</script>

<style scoped>
/* 전체 대시보드 레이아웃 */
.dashboard-layout {
  display: grid;
  grid-template-columns: 45% 20% 23% 10%; /* 열 너비 설정 */
  grid-template-rows: auto auto; /* 행 자동 높이 */
  grid-template-areas:
    "calendar attendance my-status quick-menu"
    "notice reminder reminder quick-menu"; /* 그리드 영역 명명 */
  gap: 16px;
  padding: 18px;
  min-width: 1200px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

/* 공통 박스 스타일 */
.box {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}

/* 개별 영역 스타일 지정 */
.calendar {
  grid-area: calendar;
  min-height: 430px;
}
.attendance {
  grid-area: attendance;
  min-height: 420px;
}
.my-status {
  grid-area: my-status;
  min-height: 420px;
}
.notice {
  grid-area: notice;
}
.reminder {
  grid-area: reminder;
  display: flex;
  flex-direction: column;
}

/* REMINDER 내부 콘텐츠 wrapper */
.reminder-inner {
  margin-top: 15px;
  display: flex;
  gap: 20px;
  flex: 1; /* 남은 공간 채우기 */
}

/* REMINDER 내 개별 박스 스타일 */
.reminder-box {
  font-size: 15px;
  flex: 1;
  background-color: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
}

/* 자주 쓰는 메뉴 박스 */
.quick-menu {
  grid-area: quick-menu;
  height: fit-content;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

/* 메뉴 편집 버튼 스타일 */
.edit-button {
  margin-top: 30px;
  background-color: #D3D3D3;
  border: none;
  border-radius: 10px;
  padding: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 50px;
  width: 90%;
  font-weight: 600;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
}

/* 메뉴 편집 버튼 호버 효과 */
.edit-button:hover {
  background-color: #000000;
  color: white;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
}

/* 메뉴 리스트 스타일 */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 개별 메뉴 아이템 스타일 */
.menu-item {
  padding: 8px 10px;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-size: 0.9rem;
}
</style>
