<template>
  <div class="team-calendar">
    <div class="legend-wrapper">
      <div class="legend">
        <div class="legend-item"><span class="dot leave"></span>연차</div>
        <div class="legend-item"><span class="dot half"></span>반차</div>
        <div class="legend-item"><span class="dot trip"></span>출장</div>
        <div class="legend-item"><span class="dot out"></span>외근</div>
        <div class="legend-item"><span class="dot late"></span>지각</div>
        <div class="legend-item"><span class="dot absent"></span>결근</div>
        <div class="legend-item"><span class="dot meeting"></span>회의</div>
        <button class="register1-btn" @click="show = true">회의 등록</button>
      </div>
    </div>
    <div style="padding: 20px;">
      <div style="width: 1100px;">
        <FullCalendar class="calendar--team" :options="calendarOptions" style="width: 100%;" />
      </div>
    </div>
    <Teleport to="body">
      <div v-if="show" class="overlay">
        <div class="modal">
          <span class="modal-desc">회의 일정 등록</span>
          <MeetingEventCard @add="onAdd" @cancel="show = false" />
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showEditModal" class="overlay">
        <div class="modal">
          <span class="modal-desc">회의 일정 수정</span>
          <MeetingEventEditCard
            :initialData="selectedEvent"
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>
      </div>
    </Teleport>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import koLocale from '@fullcalendar/core/locales/ko'
  import MeetingEventCard from '../attendance/MeetingEventCard.vue'
  import MeetingEventEditCard from '../attendance/MeetingEventEditCard.vue'
  import { useUserStore } from '@/stores/user'
  import BaseToast from '@/components/toast/BaseToast.vue'

  const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

  const show = ref(false)
  
  const showEditModal = ref(false)
  const selectedEvent = ref(null)

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

  const handleDayCellContent = (arg) => ({ html: `<span>${arg.date.getDate()}</span>` })

  const calendarOptions = reactive({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: koLocale,
    firstDay: 0,
    contentHeight: 'auto',
    fixedWeekCount: true,
    dayCellContent: handleDayCellContent,
    events: [],
    eventContent: (arg) => {
      const props = arg.event.extendedProps
      if (props.type === 'meeting') {
        return {
          html: `
            <div class="calendar--team event-label">
              <span class="event-employee-meeting">${props.time}</span>
              <span class="event-status-meeting">${props.title}</span>

            </div>`
        }
      }
      return {
        html: `
          <div class="calendar--team event-label">
            <span class="event-status">${props.status}</span>
            <span class="event-employee">${props.employee}</span>
          </div>`
      }
    },
    eventClick: function(info) {
      const props = info.event.extendedProps

      console.log('[이벤트 클릭] extendedProps:', props)

      if (props.type === 'meeting') {
        selectedEvent.value = {
          id: props.id,
          date: info.event.startStr,
          title: props.title,
          time: props.time
        }
        showEditModal.value = true
      }
    }
  })

      async function onAdd({ date, title, time }) {
      const userStore = useUserStore()
      const token = userStore.accessToken

      try {
          const res = await fetch('http://localhost:5000/attendance/schedule/meeting', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  meetingDate: date,
                  meetingTitle: title,
                  meetingTime: time
              })
          })

          if (!res.ok) {
              const errorText = await res.text()
              throw new Error(errorText)
          }

          const saved = await res.json()

          console.log('[등록 응답]', saved)

          // 일정 등록 성공 시 캘린더에 추가
          calendarOptions.events.push({
          title: '',
          start: saved.meetingDate,
          className: 'event-meeting',
          extendedProps: {
            id: saved.id,
            type: 'meeting',
            title: saved.meetingTitle,
            time: saved.meetingTime
          }
        })

          show.value = false
      } catch (err) {
          console.error('회의 일정 등록 실패:', err.message)
          showToast('회의 일정 등록 중 오류가 발생했습니다.')
      }
  }

  const handleUpdate = async (updated) => {
  const token = useUserStore().accessToken

  await fetch(`http://localhost:5000/attendance/schedule/meeting/${updated.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meetingDate: updated.date,
      meetingTitle: updated.title,
      meetingTime: updated.time
    })
  })

  // 캘린더에서 수정
  const target = calendarOptions.events.find(e => e.extendedProps.id === updated.id)
    if (target) {
      target.start = updated.date
      target.extendedProps.title = updated.title
      target.extendedProps.time = updated.time
    }

    showEditModal.value = false
  }

  const handleDelete = async (id) => {
    const token = useUserStore().accessToken

    await fetch(`http://localhost:5000/attendance/schedule/meeting/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    calendarOptions.events = calendarOptions.events.filter(e => e.extendedProps.id !== id)

    showEditModal.value = false
  }

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) return

    const res = await fetch('http://localhost:5000/attendance/calendar/team', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()

    calendarOptions.events = data
      .sort((a, b) => {
        // 날짜 기준 정렬 먼저
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1

        // 날짜가 같은 경우
        if (a.type === 'meeting' && b.type === 'meeting') {
          return a.time.localeCompare(b.time)
        }

        // meeting은 항상 위로 정렬
        if (a.type === 'meeting') return -1
        if (b.type === 'meeting') return 1

        return 0 // attendance 간 순서 유지
      })
      .map(item => ({
        title: '',
        start: item.date,
        className: item.type === 'meeting' ? 'event-meeting' : convertStatusToClass(item.status),
        extendedProps: item.type === 'meeting'
          ? {
              id: item.meetingId,
              type: 'meeting',
              title: item.title,
              time: item.time
            }
          : {
              type: item.type,
              status: item.status,
              employee: item.employee
            }
      }))
  })
</script>

<style scoped>
  /* 핵심 스타일: calendar--team 구분자 사용 */
  :deep(.calendar--team .fc-col-header-cell.fc-day-sun) { color: red; }
  :deep(.calendar--team .fc-col-header-cell.fc-day-sat) { color: blue; }
  :deep(.calendar--team .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number) { color: red; }
  :deep(.calendar--team .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number) { color: blue; }
  :deep(.calendar--team .fc-day-today) { background-color: #ddf2ff !important; }

  :deep(.calendar--team .fc-daygrid-event) {
    height: auto !important;
    min-height: 24px !important;
    line-height: 24px !important;
    padding: 0 4px !important;
    margin: 5px 10px 1px!important;
    font-size: 12px !important;
    border-radius: 15px !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-shadow: 0 2px 2px rgba(0,0,0,0.1) !important;
  }

  :deep(.calendar--team .event-label) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 30px;
    padding: 3px 4px;
  }

  :deep(.calendar--team .event-status),
  :deep(.calendar--team .event-employee) {
    color: black;
    font-size: 16px;
  }

  :deep(.calendar--team .event-status) {
    font-weight: 600;
  }

  :deep(.calendar--team .event-status-meeting),
  :deep(.calendar--team .event-employee-meeting) {
    color: white;
    font-size: 16px;
  }

  :deep(.calendar--team .event-status-meeting) {
    font-weight: 600;
  }

  /* 상태별 색상 */
  :deep(.calendar--team .event-leave) { background: white !important; border: 3px solid #8C9FFF !important; }
  :deep(.calendar--team .event-half-am),
  :deep(.calendar--team .event-half-pm) { background: white !important; border: 3px solid #8CC2FF !important; }
  :deep(.calendar--team .event-trip) { background: white !important; border: 3px solid #C5E695 !important; }
  :deep(.calendar--team .event-out) { background: white !important; border: 3px solid #D0F0B0 !important; }
  :deep(.calendar--team .event-late) { background: white !important; border: 3px solid #FFD38C !important; }
  :deep(.calendar--team .event-absent) { background: white !important; border: 3px solid #FF8C9A !important; }
  :deep(.calendar--team .event-meeting) {   background-color: #c1c1c1 !important;
    border: 2px solid #c1c1c1 !important;}

  /* 버튼 */
  :deep(.calendar--team .fc-button) {
    background-color: #00A8E8 !important;
    color: white !important;
    border: 1px solid transparent !important;
    border-radius: 6px !important;
    padding: 4px 10px !important;
    font-size: 12px !important;
    font-weight: bold !important;
    height: 30px !important;
  }

  :deep(.calendar--team .fc-prev-button),
  :deep(.calendar--team .fc-next-button) {
    width: 40px !important;
    margin-left: 4px !important;
  }

  :deep(.calendar--team .fc-today-button) {
    width: 50px !important;
  }

  :deep(.calendar--team .fc-button:hover) {
    background-color: white !important;
    color: #00A8E8 !important;
    border: 1px solid #00A8E8 !important;
    box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.2) !important;
  }

  :deep(.calendar--team .fc-button:disabled) {
    opacity: 1 !important;
  }

  :deep(.calendar--team .fc-today-button:disabled) {
    background-color: #00A8E8 !important;
    color: white !important;
  }

  :deep(.calendar--team .fc-prev-button),
  :deep(.calendar--team .fc-next-button),
  :deep(.calendar--team .fc-today-button) {
    background-color: #00A8E8 !important;
    color: white !important;
    border: 1px solid transparent !important;
    border-radius: 6px !important;
    font-size: 12px !important;
    font-weight: bold !important;
    height: 30px !important;
    width: 40px !important;
    margin-left: 4px !important;
    padding: 4px 10px !important;
  }

  :deep(.calendar--team .fc-today-button) {
    width: 50px !important;
  }

  :deep(.calendar--team .fc-button:hover) {
    background-color: white !important;
    color: #00A8E8 !important;
    border: 1px solid #00A8E8 !important;
    box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
  }

  :deep(.calendar--team .fc-toolbar-title) {
    font-size: 18px !important;
    font-weight: bold !important;
    color: #333 !important;
  }

  /* 기타 스타일 유지 */
  .team-calendar {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
          padding-left: 25px;
          padding-top: 25px;
          padding-bottom: 25px;
  }

  .legend-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #333;
  }

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
  }
  .dot.leave { background-color: #8C9FFF; }
  .dot.half { background-color: #8CC2FF; }
  .dot.trip { background-color: #C5E695; }
  .dot.out { background-color: #D0F0B0; }
  .dot.late { background-color: #FFD38C; }
  .dot.absent { background-color: #FF8C9A; }
  .dot.meeting { background-color: #c1c1c1; }
  .register1-btn {
      background-color: #00A8E8;
      border: 1px solid #00A8E8;
      color: #fff;
      font-weight: bold;
      border-radius: 10px;
      padding: 4px 12px;
      margin-left: 665px;
      width: 93px;
      height: 37px;
      font-size: 14px;
  }

  .register1-btn:hover {
    background-color: #fff;
    color: #00A8E8;
    border: 1px solid #00A8E8;
    box-shadow: inset 1px 1px 6px rgba(0,0,0,0.1);
  }

  .overlay {
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000;
  }

  .modal {
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 420px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  
  .modal-desc {
    display: block;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 20px;
  }
</style>
