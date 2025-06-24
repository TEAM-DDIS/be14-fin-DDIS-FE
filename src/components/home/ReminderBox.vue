<template>
  <div class="box reminder">
    REMINDER
    <div class="reminder-inner">
      <!-- 내 일정 -->
      <div class="reminder-box my-schedule">
        <div class="reminder-title">내 일정</div>
          <ul v-if="!loading && schedules.length" class="reminder-list custom-bullet scrollable" >
            <li v-for="item in sortedSchedules" :key="item.personalScheduleId" class="my">
              <span class="bullet"></span>
              <div class="content-wrapper">
                <span class="time">[{{ formatTime(item.scheduleTime) }}]</span>
                <span class="title">{{ item.scheduleTitle }}</span>
              </div>
            </li>
          </ul>
      </div>

      <!-- 팀 일정 -->
      <div class="reminder-box team-schedule">
        <div class="reminder-title">팀 일정</div>
        <ul class="reminder-list custom-bullet scrollable">
          <li
            v-for="meeting in sortedMeetings"
            :key="`${meeting.teamId}-${meeting.meetingTime}`"
            class="team"
          >
            <span class="bullet"></span>
            <div class="content-wrapper">
              <span class="time">[{{ formatTime(meeting.meetingTime) }}]</span>
              <span class="title">{{ meeting.meetingTitle }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- 이벤트 -->
      <div class="reminder-box event-schedule ">
        <div class="reminder-title">
          이벤트
          <span class="date-range">({{ birthdayRangeText }})</span>
        </div>
          <ul class="reminder-list custom-bullet scrollable">
            <li v-for="user in birthdayUsers" :key="user.employeeId" class="event">
              <span class="bullet"></span>
              <span class="time">[{{ formatBirthDate(user.employeeBirth) }}]</span>
              {{ user.employeeName }} {{ user.positionName }} 생일
            </li>
            <li v-if="birthdayUsers.length === 0" class="event">
              <span class="bullet"></span>
              <span class="time">[없음]</span>
              이벤트가 없습니다
            </li>
          </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const schedules = ref([])
const loading = ref(true)
const teamMeetings = ref([])

const birthdayUsers = computed(() => userStore.birthdayUsersNext7Days)


// 일정 시간순 정렬
const sortedSchedules = computed(() => {
  return [...schedules.value].sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime))
})

const sortedMeetings = computed(() => {
  return [...teamMeetings.value].sort((a, b) => a.meetingTime.localeCompare(b.meetingTime))
})

function formatBirthDate(dateStr) {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}월 ${day}일`
}
// 오전/오후 포맷 변환
function formatTime(timeStr) {
  const [hourStr, minute] = timeStr.split(':')
  let hour = parseInt(hourStr, 10)
  const isAM = hour < 12
  const period = isAM ? '오전' : '오후'
  if (!isAM && hour > 12) hour -= 12
  if (hour === 0) hour = 12
  return `${period} ${hour}:${minute}`
}

onMounted(async () => {
  const token = useUserStore().accessToken
  if (!token) {
    console.error('토큰 없음')
    return
  }

  try {
      await userStore.fetchAllEmployees()

    // 개인 일정
    const scheduleRes = await fetch('https://api.isddishr.site/attendance/schedule/today', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const scheduleData = await scheduleRes.json()
    schedules.value = Array.isArray(scheduleData) ? scheduleData : [scheduleData]

    // 팀 회의 일정
    const meetingRes = await fetch('https://api.isddishr.site/attendance/meeting/today', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const meetingData = await meetingRes.json()
    teamMeetings.value = Array.isArray(meetingData) ? meetingData : [meetingData]

  } catch (err) {
    console.error('데이터 불러오기 실패:', err)
    schedules.value = []
    teamMeetings.value = []
  } finally {
    loading.value = false
  }
})

const birthdayRangeText = computed(() => {
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 6)

  const formatDate = (date) => {
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${m}월 ${d}일`
  }

  return `${formatDate(today)} ~ ${formatDate(endDate)}`
})

</script>

<style scoped>
.scrollable {
  max-height: 90px;
  overflow-y: auto;
  padding-right: 4px;
}
.reminder-list::-webkit-scrollbar {
  width: 4px;
}
.reminder-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.reminder-list::-webkit-scrollbar-track {
  background: transparent;
}
.reminder {
  grid-area: reminder;
  display: flex;
  flex-direction: column;
}

.reminder-inner {
  margin-top: 15px;
  display: flex;
  gap: 20px;
  flex: 1;
}

.reminder-box {
  background-color: var(--bg-box);
  font-size: 15px;
  flex: 1;
  /* background-color: #fff; */
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.reminder-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
}

.reminder-msg {
  font-size: 13px;
  color: #888;
}

/* 공통 리스트 스타일 */
.reminder-list {
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  margin: 0;
}
.custom-bullet {
  list-style: none;
  padding: 0;
  margin: 0;
}
.custom-bullet li {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}


/* 마커 공통 스타일 */
.bullet {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 4px;
  flex-shrink: 0;
}

/* 일정 유형별 마커 색상 */
.my .bullet {
  background-color: #AE8CFF;
}
.team .bullet {
  background-color: #c1c1c1;
}
.event .bullet {
  background-color: #00a8e8;
}
/* 내용 묶음 */
.content-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
}
/* 시간 */
.time {
  color: #00A8E8;
  font-weight: 500;
  font-size: 13px;
  min-width: 70px;
  flex-shrink: 0;
}
/* 제목 */
.title {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-main);
  word-break: break-word;
}
/* 외곽 박스 공통 */
.box {
  background-color: var(--bg-box);
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}
.date-range {
  font-size: 12px;
  font-weight: 400;
  color: #666;
  margin-left: 6px;
}

</style>
