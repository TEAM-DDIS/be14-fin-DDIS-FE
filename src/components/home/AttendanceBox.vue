<template>
  <div class="box attendance">
    <div class="header-title">팀 근무 현황</div>
    <div class="scroll-area">
      <TeamStatusCard />
    </div>
  </div>
</template>

<script setup>
import TeamStatusCard from '@/components/attendance/TeamWorkStatusCard.vue'
</script>

<style scoped>
.box {
  margin-top: 30px;
  background: var(--bg-box);
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
  color: var(--text-main);
}

.attendance {
  grid-area: attendance;
  min-height: 420px;
}

.header-title {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-main);
}

/* 스크롤 영역 */
.scroll-area {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

/* 스크롤바 커스터마이징 */
.scroll-area::-webkit-scrollbar {
  width: 4px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

/* ↓ TeamStatusCard 내부 그림자 제거 및 스타일 커스터마이징 */
::v-deep(.team-status-card) {
  box-shadow: none !important;
  border-radius: 12px !important;
  padding: 0px !important;
  background: transparent !important;
}

::v-deep(.team-title) {
  margin-left: 3px;
  font-size: 16px;
  color: var(--primary);
  margin-bottom: 5px;
}

::v-deep(.status-list) {
  gap: -4px;
}
::v-deep(.status-list > * + *) {
  margin-top: 4px;
}
</style>
