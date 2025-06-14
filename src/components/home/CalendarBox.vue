<!-- home > 캘린더 박스 -->
<template>
  <div class="calendar-wrapper calendar--home">
    <!-- 상단 탭 -->
    <div class="tab-menu">
      <button :class="{ active: activeTab === 'personal' }" @click="activeTab = 'personal'">내 캘린더</button>
      <button :class="{ active: activeTab === 'team' }" @click="activeTab = 'team'">팀 캘린더</button>
    </div>

    <!-- 캘린더 카드 -->
    <div class="calendar-card">
      <div class="legend" v-if="activeTab === 'personal'">
        <div class="legend-item"><span class="dot leave" />연차</div>
        <div class="legend-item"><span class="dot half" />반차</div>
        <div class="legend-item"><span class="dot trip" />출장</div>
        <div class="legend-item"><span class="dot out" />외근</div>
        <div class="legend-item"><span class="dot late" />지각</div>
        <div class="legend-item"><span class="dot absent" />결근</div>
        <div class="legend-item"><span class="dot schedule" />개인 일정</div>
      </div>
      <div class="legend" v-else>
        <div class="legend-item"><span class="dot leave" />연차</div>
        <div class="legend-item"><span class="dot half" />반차</div>
        <div class="legend-item"><span class="dot trip" />출장</div>
        <div class="legend-item"><span class="dot out" />외근</div>
        <div class="legend-item"><span class="dot late" />지각</div>
        <div class="legend-item"><span class="dot absent" />결근</div>
        <div class="legend-item"><span class="dot meeting" />회의</div>
      </div>

      <FullCalendar
        class="calendar--home"
        ref="calendarRef"
        :options="activeTab === 'personal' ? calendarOptionsPersonal : calendarOptionsTeam"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, watch, nextTick, onActivated } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'

// 현재 활성화된 탭 (personal/team)
const activeTab = ref('personal')

// FullCalendar DOM 참조
const calendarRef = ref(null)

// 상태명에 따른 클래스 매핑 함수
const convertStatusToClass = (status) => {
  switch (status) {
    case '연차': return 'event-leave'
    case '오전반차': return 'event-half-am'
    case '오후반차': return 'event-half-pm'
    case '출장': return 'event-trip'
    case '외근': return 'event-out'
    case '지각': return 'event-late'
    case '결근': return 'event-absent'
    default: return ''
  }
}

// 개인 일정 캘린더 옵션
const calendarOptionsPersonal = reactive({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  height: 360,
  headerToolbar: {
    left: 'title',
    center: '',
    right: 'today prev,next'
  },
  dayCellContent: (arg) => ({ html: `<span>${arg.date.getDate()}</span>` }),
  events: [],
  eventContent(arg) {
    const props = arg.event.extendedProps
    if (props.type === 'personal') {
      return {
        html: `
          <div class="calendar--home event-label">
            <span class="event-status-schedule">${props.time}</span>
            <span class="event-employee-schedule">${props.title}</span>
          </div>`
      }
    }
    return {
      html: `
        <div class="calendar--home event-label">
          <span class="event-status">${props.status}</span>
          <span class="event-employee">${props.employee}</span>
        </div>`
    }
  }
})

// 팀 일정 캘린더 옵션
const calendarOptionsTeam = reactive({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: koLocale,
  height: 360,
  headerToolbar: {
    left: 'title',
    center: '',
    right: 'today prev,next'
  },
  events: [],
  dayCellContent: (arg) => ({ html: `<span>${arg.date.getDate()}</span>` }),
  eventContent(arg) {
    const props = arg.event.extendedProps
    if (props.type === 'meeting') {
      return {
        html: `
          <div class="calendar--home event-label">
            <span class="event-status-meeting">${props.time}</span>
            <span class="event-employee-meeting">${props.title}</span>
          </div>`
      }
    }
    return {
      html: `
        <div class="calendar--home event-label">
          <span class="event-status">${props.status}</span>
          <span class="event-employee">${props.employee}</span>
        </div>`
    }
  }
})

// 일정 데이터 로드
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const [resPersonal, resTeam] = await Promise.all([
    fetch('http://localhost:8000/attendance/calendar/personal', {
      headers: { Authorization: `Bearer ${token}` }
    }),
    fetch('http://localhost:8000/attendance/calendar/team', {
      headers: { Authorization: `Bearer ${token}` }
    })
  ])

  const personalData = await resPersonal.json()
  const teamData = await resTeam.json()

  calendarOptionsPersonal.events = personalData.map(item => ({
    title: item.title || '',
    start: item.date,
    className: item.type === 'personal' ? 'event-personal' : convertStatusToClass(item.status),
    extendedProps: item
  }))

  calendarOptionsTeam.events = teamData.map(item => ({
    title: '',
    start: item.date,
    className: item.type === 'meeting' ? 'event-meeting' : convertStatusToClass(item.status),
    extendedProps: item
  }))

  nextTick(() => calendarRef.value?.getApi()?.updateSize())
})

// 탭 전환 시 캘린더 리사이즈
watch(activeTab, () => {
  nextTick(() => calendarRef.value?.getApi()?.updateSize())
})

// 활성화될 때 캘린더 리사이즈
onActivated(() => {
  nextTick(() => calendarRef.value?.getApi()?.updateSize())
})
</script>


<style scoped>
/* 요일 헤더 색상 */
:deep(.calendar--home .fc-col-header-cell.fc-day-sun) {
  color: red;
}
:deep(.calendar--home .fc-col-header-cell.fc-day-sat) {
  color: blue;
}

/* 날짜 숫자 색상 */
:deep(.calendar--home .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number) {
  color: red;
}
:deep(.calendar--home .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number) {
  color: blue;
}

/* FullCalendar 전체 스타일 */
:deep(.fc) {
  font-size: 10px;
  height: 420px !important;
}
:deep(.calendar--home .fc-day-today) {
  background-color: #ddf2ff !important;
}
:deep(.calendar--home .fc-daygrid-day-number) {
  font-size: 11px;
  padding: 2px;
}

:deep(.calendar--home .fc-event) {
  border-radius: 10px;
  font-size: 10px !important;
  padding: 2px 4px !important;
  margin-bottom: 2px;
  line-height: 14px;
  min-height: 10px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.calendar--home .event-label) {
  padding: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 15px;
  width: 100%;
}
:deep(.calendar--home .event-status),
:deep(.calendar--home .event-employee) {
  font-size: 11px;
  color: black;
}
:deep(.calendar--home .event-status) {
  font-weight: 500;
}
:deep(.calendar--home .event-status-schedule),
:deep(.calendar--home .event-employee-schedule),
:deep(.calendar--home .event-status-meeting),
:deep(.calendar--home .event-employee-meeting) {
  font-size: 11px;
  color: white;
}
:deep(.calendar--home .event-status-schedule),
:deep(.calendar--home .event-status-meeting) {
  font-weight: 400;
}

/* 이벤트 타입별 테두리 색상 */
:deep(.calendar--home .event-leave) {
  background-color: white !important;
  border: 2px solid #8C9FFF !important;
}
:deep(.calendar--home .event-half-am),
:deep(.calendar--home .event-half-pm) {
  background-color: white !important;
  border: 2px solid #8CC2FF !important;
}
:deep(.calendar--home .event-trip) {
  background-color: white !important;
  border: 2px solid #C5E695 !important;
}
:deep(.calendar--home .event-out) {
  background-color: white !important;
  border: 2px solid #D0F0B0 !important;
}
:deep(.calendar--home .event-late) {
  background-color: white !important;
  border: 2px solid #FFD38C !important;
}
:deep(.calendar--home .event-absent) {
  background-color: white !important;
  border: 2px solid #FF8C9A !important;
}
:deep(.calendar--home .event-personal) {
  background-color: #a988f7 !important;
  border: 2px solid #a988f7 !important;
  opacity: 60% !important;
}
:deep(.calendar--home .event-meeting) {
  background-color: #c1c1c1 !important;
  border: 2px solid #c1c1c1 !important;
}
:deep(.calendar--home .fc-day-grid) {
  min-height: 10px;
}
/* 툴바 버튼 */
:deep(.calendar--home .fc-button) {
  background-color: #00A8E8 !important;
  color: white !important;
  border: 1px solid transparent !important;
  padding: 1px 1px !important;
  border-radius: 6px !important;
  font-size: 10px !important;
  font-weight: bold !important;
  height: 20px !important;
}
:deep(.calendar--home .fc-prev-button),
:deep(.calendar--home .fc-next-button) {
  width: 40px !important;
  margin-left: 4px !important;

}
:deep(.calendar--home .fc-today-button) {
  width: 50px !important;
}
:deep(.calendar--home .fc-button:hover) {
  background-color: white !important;
  color: #00A8E8 !important;
  border: 1px solid #00A8E8 !important;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
}
:deep(.calendar--home .fc-button:disabled) {
  opacity: 1 !important;
}
:deep(.calendar--home .fc-today-button:disabled) {
  background-color: #00A8E8 !important;
  color: white !important;
}
:deep(.calendar--home .fc-today-button.fc-button-primary:hover) {
  background-color: white !important;
  color: #00A8E8 !important;
  border: 1px solid #00A8E8 !important;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
}
:deep(.calendar--home .fc-toolbar-title) {
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #333 !important;
  font-family: 'Pretendard', sans-serif !important;
}

/* 스크롤바 */
:deep(.calendar--home .fc-scroller::-webkit-scrollbar) {
  width: 4px;
}
:deep(.calendar--home .fc-scroller::-webkit-scrollbar-thumb) {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
:deep(.calendar--home .fc-scroller::-webkit-scrollbar-track) {
  background: transparent;
}

.calendar-wrapper {
  padding: 0;
}

/* 탭 버튼 스타일 */
.tab-menu {
  display: flex;
  gap: 4px;
}
.tab-menu button {
  font-size: 15px;
  padding: 6px 14px;
  background-color: #c8c8c8;
  border: none;
  border-radius: 10px 10px 0 0;
  margin-right: -8px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  color: white;
  cursor: pointer;
}
.tab-menu button.active {
  background-color: white;
  color: black;
  font-weight: bold;
}

/* 캘린더 카드 */
.calendar-card {
  background-color: white;
  border-radius: 0px 10px 10px 10px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

/* 범례 스타일 */
.legend {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 11px;
}
.legend-item {
  display: flex;
  align-items: center;
  color: #333;
}
.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot.leave   { background-color: #8C9FFF; }
.dot.half    { background-color: #8CC2FF; }
.dot.trip    { background-color: #C5E695; }
.dot.out     { background-color: #D0F0B0; }
.dot.late    { background-color: #FFD38C; }
.dot.absent  { background-color: #FF8C9A; }
.dot.schedule { background-color: #AE8CFF; }
.dot.meeting { background-color: #c1c1c1; }

</style>
