<template>
  <div class="calendar-box">
    <!-- 탭 메뉴 -->
    <div class="tab-menu">
      <button
        :class="{ active: activeTab === 'personal' }"
        @click="activeTab = 'personal'"
      >
        내 일정
      </button>
      <button
        :class="{ active: activeTab === 'team' }"
        @click="activeTab = 'team'"
      >
        팀 일정
      </button>
    </div>

    <!-- 탭 콘텐츠 -->
    <div class="tab-content">
      <HomePersonalCalendar v-if="activeTab === 'personal'" />
      <HomeTeamCalendar v-else />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HomePersonalCalendar from '@/components/calendar/HomePersonalCalendar.vue'
import HomeTeamCalendar from '@/components/calendar/HomeTeamCalendar.vue'

const activeTab = ref('personal')
</script>

<style scoped>
.calendar-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 25px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
}

.tab-menu {
  display: flex;
  margin-bottom: 12px;
}

.tab-menu button {
  font-size: 16px;
  padding: 8px 20px;
  background-color: #c8c8c8;
  border: none;
  color: white;
  cursor: pointer;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: -10px;
  z-index: 1;
  transition: 0.2s;
}

.tab-menu button.active {
  background-color: #fff;
  color: #000;
  z-index: 2;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.tab-content {
  z-index: 1;
  position: relative;
}
</style>
