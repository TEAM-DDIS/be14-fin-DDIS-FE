<!-- home > 팀 근태 현황 박스 -->
<template>
  <div class="box attendance scrollable">
    팀 근무 현황
    <TeamStatusCard />
  </div>
</template>

<script setup>
import TeamStatusCard from '@/components/attendance/TeamWorkStatusCard.vue' 
</script>

<style scoped>
.box::-webkit-scrollbar {
  width: 4px;
}
.box::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.box::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 4px;
}
.attendance {
  grid-area: attendance;
  min-height: 420px;
}
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
::v-deep(.team-status-card) {
  box-shadow: none !important;
  border-radius: 12px !important;
  padding: 0px !important;
  /* min-height: 420px !important; */
}
::v-deep(.team-title) {
  margin-left:3px;
  font-size: 16px;
  color: var(--text-main);
  margin-bottom: 5px;
}
::v-deep(.status-list) {
  gap: -4px;
}
/* 리스트 아이템 간 간격 줄이기 */
::v-deep(.status-list > * + *) {
  margin-top: 4px;
}
</style>
