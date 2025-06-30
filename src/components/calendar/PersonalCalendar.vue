<template>
  <div class="personal-calendar">
    <div class="legend-wrapper">
      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <span class="dot leave"></span>연차
        </div>
        <div class="legend-item">
          <span class="dot half"></span>반차
        </div>
        <div class="legend-item">
          <span class="dot trip"></span>출장
        </div>
        <div class="legend-item">
          <span class="dot out"></span>외근
        </div>
        <div class="legend-item">
          <span class="dot late"></span>지각
        </div>
        <div class="legend-item">
          <span class="dot absent"></span>결근
        </div>
        <div class="legend-item">
          <span class="dot schedule"></span>개인 일정
        </div>
        <button class="register-btn" @click="show = true">일정 등록</button>
      </div>
    </div>
    <div style="padding: 20px;">
      <div style="width: 1100px;">
        <FullCalendar class="calendar--personal" :options="calendarOptions" style="width: 100%;" />
      </div>
    </div>
    <Teleport to="body">
      <div v-if="show" class="overlay">
        <div class="modal">
          <span class="modal-desc">개인 일정 등록</span>
          <!-- PersonalEventCard 삽입 -->
          <PersonalEventCard @add="onAdd" @cancel="show = false" />
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showEditModal" class="overlay">
        <div class="modal">
          <span class="modal-desc">개인 일정 수정</span>
          <PersonalEventEditCard
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
  import { onMounted, reactive, ref } from 'vue'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import koLocale from '@fullcalendar/core/locales/ko'
  import PersonalEventCard from '../attendance/PersonalEventCard.vue'
  import PersonalEventEditCard from '../attendance/PersonalEventEditCard.vue'
  import { useUserStore } from '@/stores/user'
  import BaseToast from '@/components/toast/BaseToast.vue'

  const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

  const show = ref(false)

  const showEditModal = ref(false)
  const selectedEvent = ref(null)

  async function onAdd({ date, title, time }) {
      const userStore = useUserStore()
      const token = userStore.accessToken

      try {
          const res = await fetch('https://api.isddishr.site/attendance/schedule/personal', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  scheduleDate: date,
                  scheduleTitle: title,
                  scheduleTime: time
              })
          })

          if (!res.ok) {
              const errorText = await res.text()
              throw new Error(errorText)
      }

      const saved = await res.json()

      // console.log('[등록 응답]', saved)

      // 일정 등록 성공 시 캘린더에 추가
      calendarOptions.events.push({
      title: '',
      start: saved.scheduleDate,
      className: 'event-personal',
      extendedProps: {
        id: saved.id,
        type: 'personal',
        title: saved.scheduleTitle,
        time: saved.scheduleTime
      }
    })

  show.value = false
  } catch (err) {
      console.error('개인 일정 등록 실패:', err.message)
      showToast('일정 등록 중 오류가 발생했습니다.')
  }
}

  // 날짜 숫자만 보이게
  const handleDayCellContent = (arg) => {
      return { html: `<span>${arg.date.getDate()}</span>` }
  }

  // 상태명 → 클래스명 변환 함수
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

  // FullCalendar 옵션
  const calendarOptions = reactive({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: koLocale,
      firstDay: 0,
      contentHeight: 'auto',
      fixedWeekCount: true,
      dayCellContent: handleDayCellContent,
      events: [],
      eventContent: function(arg) {
          const props = arg.event.extendedProps

          if (props.type === 'personal') {
              return {
                  html: `
                  <div class="calendar--personal event-label">
                          <span class="event-employee-schedule">${props.time}</span>
                          <span class="event-status-schedule">${props.title}</span>
                      </div>
                  `
              }
          }

          return {
              html: `
                  <div class="calendar--personal event-label">
                      <span class="event-status">${props.status}</span>
                      <span class="event-employee">${props.employee}</span>
                  </div>
              `
          }
      },
      eventClick: function(info) {
        const props = info.event.extendedProps

        // console.log('[이벤트 클릭] extendedProps:', props)

        if (props.type === 'personal') {
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

  const handleUpdate = async (updated) => {
  const token = useUserStore().accessToken

  await fetch(`https://api.isddishr.site/attendance/schedule/personal/${updated.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scheduleDate: updated.date,
      scheduleTitle: updated.title,
      scheduleTime: updated.time
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

    await fetch(`https://api.isddishr.site/attendance/schedule/personal/${id}`, {
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

      if (!token) {
          console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
          return
      }

      const res = await fetch('https://api.isddishr.site/attendance/calendar/personal', {
          headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      calendarOptions.events = data
      .sort((a, b) => {
        // 날짜 기준 정렬 먼저
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1

        // 날짜가 같은 경우
        if (a.type === 'personal' && b.type === 'personal') {
          return a.time.localeCompare(b.time)
        }

        // meeting은 항상 위로 정렬
        if (a.type === 'personal') return -1
        if (b.type === 'personal') return 1

        return 0 // attendance 간 순서 유지
      })
      .map(item => ({
        title: '',
        start: item.date,
        className: item.type === 'personal' ? 'event-personal' : convertStatusToClass(item.status),
        extendedProps: item.type === 'personal'
          ? {
              id: item.personalScheduleId,
              type: 'personal',
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
  /* 캘린더 박스 */
.personal-calendar {
  background-color: var(--bg-box);
  border-radius: 12px;
  box-shadow: 1px 1px 20px var(--shadow-sidebar);
  padding: 25px 0 25px 25px;
}

  /* legend + 버튼을 좌우 정렬 */
  .legend-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* Legend */
  .legend {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    color: var(--text-sub);
  }

  .legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--text-sub);
  }

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
  }
  .dot.leave { background-color: #8C9FFF; }
  .dot.half    { background-color: #8CC2FF; }
  .dot.trip  { background-color: #C5E695; }
  .dot.out  { background-color: #D0F0B0; }
  .dot.late  { background-color: #FFD38C; }
  .dot.absent  { background-color: #FF8C9A; }
  .dot.schedule  { background-color: #AE8CFF; }

  /* 일정 등록 버튼 */
  .register-btn {
    background-color: var(--primary);
    border: 1px solid var(--primary);
    color: var(--text-on-primary);
    font-weight: bold;
    border-radius: 10px;
    padding: 4px 12px;
    margin-left: 639px;
    width: 93px;
    height: 37px;
    font-size: 14px;
  }
  .register-btn:hover {
    background-color: var(--bg-main) !important;
    color: var(--primary) !important;
    border: 1px solid var(--primary);
    box-shadow: inset 1px 1px 6px rgba(0,0,0,0.1);
  }

  .register-btn:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  .overlay {
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000;
  }

  .modal {
    background: var(--modal-bg2) !important;
    color: var(--modal-text);
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

  .desc {
    display: block;
    font-size: 18px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 20px;
  }

  /* 요일 헤더 색상 */
  :deep(.calendar--personal .fc-col-header-cell.fc-day-sun) {
    color: red;
  }

  :deep(.calendar--personal .fc-col-header-cell.fc-day-sat) {
    color: blue;
  }

  :deep(.calendar--personal .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number) {
    color: red;
  }

  :deep(.calendar--personal .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number) {
    color: blue;
  }

  :deep(.calendar--personal .fc-day-today) {
    background-color: var(--ch-today) !important;
  }

  /* 이벤트 색상 */
  :deep(.calendar--personal .event-leave) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #8C9FFF !important;
  }

  :deep(.calendar--personal .event-half-am),
  :deep(.calendar--personal .event-half-pm) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #8CC2FF !important;
  }

  :deep(.calendar--personal .event-trip) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #C5E695 !important;
  }

  :deep(.calendar--personal .event-out) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #D0F0B0 !important;
  }

  :deep(.calendar--personal .event-late) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #FFD38C !important;
  }

  :deep(.calendar--personal .event-absent) {
    background-color: var(--event-bg-default) !important;
    border: 3.5px solid #FF8C9A !important;
  }

  :deep(.calendar--personal .event-personal) {
    background-color: #a988f7 !important;
    border: 2px solid #a988f7 !important;
    opacity: 80%;
  }

  /* 이벤트 공통 레이아웃 */
  :deep(.calendar--personal .fc-daygrid-event) {
    height: auto !important;
    min-height: 24px !important;
    line-height: 24px;
    font-size: 10px;
    padding: 0 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin: 5px 10px 1px!important;
    border-radius: 15px !important;
    padding-bottom: 3px !important;
    box-shadow: 0 2px 2px rgba(0,0,0,0.1) !important;
  }

  /* 이벤트 내부 구조 */
  :deep(.calendar--personal .event-label) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 30px !important;
    padding: 3px 4px;
  }

  :deep(.calendar--personal .event-status),
  :deep(.calendar--personal .event-status-schedule) {
    font-size: 16px;
    /* font-weight: 600; */
    color: var(--text-main);
  }

  :deep(.calendar--personal .event-status),
  :deep(.calendar--personal .event-employee) {
    color: var(--text-main);
    font-size: 16px;
  }

  :deep(.calendar--personal .event-status) {
    font-weight: 600;
  }

  :deep(.calendar--personal .event-employee),
  :deep(.calendar--personal .event-employee-schedule) {
    font-size: 16px;
    color: var(--text-main);
  }

  :deep(.calendar--personal .event-status) {
    font-weight: 600;
  }

  /* 스케줄 타입은 white text */
  :deep(.calendar--personal .event-status-schedule),
  :deep(.calendar--personal .event-employee-schedule) {
    color: var(--text-on-primary);
  }

  /* 버튼들 */
  :deep(.calendar--personal .fc-button) {
    background-color: var(--primary) !important;
    color: var(--text-on-primary) !important;
    border: 1px solid transparent !important;
    padding: 4px 10px !important;
    border-radius: 6px !important;
    font-size: 12px !important;
    font-weight: bold !important;
    height: 30px !important;
  }

  :deep(.calendar--personal .fc-prev-button),
  :deep(.calendar--personal .fc-next-button) {
    width: 40px !important;
    margin-left: 4px !important;

  }

  :deep(.calendar--personal .fc-today-button) {
    width: 50px !important;
  }

  :deep(.calendar--personal .fc-today-button.fc-button-primary:hover) {
    background-color: var(--bg-main) !important;
    color: var(--primary) !important;
    border: 1px solid var(--primary) !important;
    box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
  }

  :deep(.calendar--personal .fc-button:hover) {
    background-color: var(--bg-main) !important;
    color: var(--primary) !important;
    border: 1px solid var(--primary) !important;
    box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
  }

  :deep(.calendar--personal .fc-button:disabled) {
    opacity: 1 !important;
  }

  :deep(.calendar--personal .fc-today-button:disabled) {
    background-color: var(--primary) !important;
    color: white !important;
  }

  /* 헤더 */
  :deep(.calendar--personal .fc-toolbar-title) {
    font-size: 18px !important;
    font-weight: 700 !important;
    color: var(--text-main) !important;
    font-family: 'Pretendard', sans-serif !important;
  }
</style>