<template>
  <h1 class="page-title">내 근태 현황</h1>
  <div class="my-attendance-page">
    <div class="left-panel">
      <div class="attendance-summary-card">
        <span class="desc">근무 현황</span>
        <AttendanceSummaryCard />
      </div>
      <div class="weekly-over-time-card">
        <span class="desc">주간 초과 근무 현황</span>
        <WeeklyOvertimeCard/>
      </div>
    </div>
    <div class="right-panel">
      <span class="desc">개인 캘린더</span>
      <PersonalCalendar @add="handleAddPersonalEvent"/>
    </div>
  </div>
</template>

<script setup>
  import PersonalCalendar from '@/components/calendar/PersonalCalendar.vue'
  import AttendanceSummaryCard from '@/components/attendance/AttendanceSummaryCard.vue'
  import WeeklyOvertimeCard from '@/components/attendance/WeeklyOvertimeCard.vue'
</script>

<style scoped>
  .page-title {
      margin-left: 20px;
      margin-bottom: 30px;
      color: #00a8e8;
    }

  .desc {
    display: block;
    margin-bottom: 10px;
    font-size: 18px;
  }

  .my-attendance-page {
    display: flex;
    gap: 40px;
    padding: 20px;
  }

  .left-panel {
    width: 400px;
    display: flex;
    flex-direction: column;
  }

  .attendance-summary-card {
    margin-bottom: 30px;
  }

  .weekly-over-time-card {
    margin-bottom: 30px;
  }

  .right-panel {
      flex: 1;
  }
</style>
