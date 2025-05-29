<template>
  <div class="my-attendance-page">
    <div class="left-panel">
      <AttendanceSummaryCard />
      <WeeklyOvertimeCard
        :extended="8"
        :night="2"
        :holiday="2"
        @apply="onOvertimeApply"
        />
    </div>
    <div class="right-panel">
      <PersonalCalendar />
    </div>
  </div>
</template>

<script setup>
import PersonalCalendar from '../components/calendar/PersonalCalendar.vue'
import AttendanceSummaryCard from '../components/attendance/AttendanceSummaryCard.vue'
import WeeklyOvertimeCard from '../components/attendance/WeeklyOvertimeCard.vue'
</script>

<style scoped>
.my-attendance-page {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.left-panel {
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
    flex: 1;
}
</style>
