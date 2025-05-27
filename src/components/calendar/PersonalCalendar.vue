<template>
    <div style="padding: 20px;">
        <div style="width: 700px; height: 700px;">
            <FullCalendar :options="calendarOptions" style="height: 100%; width: 100%;" />
        </div>
    </div>
    <el-dialog
        v-model="showPersonalForm"
        :title="`${clickedDate} 개인 일정 추가`"
        width="400px"
        destroy-on-close>
        <el-form :model="personalForm">
            <el-form-item label="일정명">
                <el-input v-model="personalForm.title" placeholder="예: 병원 예약" />
            </el-form-item>
            <el-form-item label="시간">
                <el-time-picker v-model="personalForm.time"
                            placeholder="시간 선택"
                            format="HH:mm"
                            value-format="HH:mm"
                            :picker-options="{
                                start: '08:00',
                                step: '00:30',
                                end: '20:00'
                            }" 
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showPersonalForm = false">취소</el-button>
            <el-button type="primary" @click="addPersonalEvent">등록</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
    import { onMounted, reactive, ref } from 'vue'
    import FullCalendar from '@fullcalendar/vue3'
    import dayGridPlugin from '@fullcalendar/daygrid'
    import interactionPlugin from '@fullcalendar/interaction'
    import koLocale from '@fullcalendar/core/locales/ko'
    import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElTimePicker } from 'element-plus'

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
        height: '100%',
        contentHeight: 600,
        fixedWeekCount: true,
        dayMaxEventRows: 3,
        moreLinkContent: function(args) {
            return {
                html: `<span style="font-size: 8px; color: #555;">+ ${args.num}건 더 보기</span>`
            }
        },
        dayCellContent: handleDayCellContent,
        events: [],
        eventContent: function(arg) {
            const props = arg.event.extendedProps

            if (props.type === 'personal') {
                return {
                    html: `
                        <div class="event-label">
                            <span class="event-status">${props.title}</span>
                            <span class="event-employee">${props.time}</span>
                        </div>
                    `
                }
            }

            return {
                html: `
                    <div class="event-label">
                        <span class="event-status">${props.status}</span>
                        <span class="event-employee">${props.employee}</span>
                    </div>
                `
            }
        }
    })

    // JSON 데이터 로드
    onMounted(async () => {
    const res = await fetch('/schedule.json')
    const data = await res.json()
    calendarOptions.events = data.map(item => ({
        title: '', // 직접 렌더링 하므로 필요 없음
        start: item.date,
        className: convertStatusToClass(item.status),
        extendedProps: {
            status: item.status,
            employee: item.employee
        }
    }))
    })

    const showModal = ref(false)
    const clickedDate = ref('')
    const selectedEvents = ref([])

    calendarOptions.dateClick = function (info) {
    clickedDate.value = info.dateStr
    showPersonalForm.value = true
    }


    /* 개인 일정 등록 */
    const showPersonalForm = ref(false)
    const personalForm = reactive({ title: '', time: '' })

    const addPersonalEvent = () => {
        if (!personalForm.title || !personalForm.time) return
        calendarOptions.events.push({
            title: '',
            start: clickedDate.value,
            className: 'event-personal',
            extendedProps: {
                type: 'personal',
                title: personalForm.title,
                time: personalForm.time
            }
        })
        personalForm.title = ''
        personalForm.time = ''
        showPersonalForm.value = false
    }
</script>

<style setup>
    /* 요일 헤더 색상 */
    .fc-col-header-cell.fc-day-sun {
        color: red;
    }
    .fc-col-header-cell.fc-day-sat {
        color: blue;
    }

    /* 날짜 셀 숫자 색상 */
    .fc-daygrid-day.fc-day-sun .fc-daygrid-day-number {
        color: red;
    }
    .fc-daygrid-day.fc-day-sat .fc-daygrid-day-number {
        color: blue;
    }

    /* 근무 상태별 배경 색상 */
    .event-leave {
        background-color: #A3C7F3 !important;
        color: white !important;
    }
    .event-half-am {
        background-color: #B5E4F0 !important;
        color: white !important;
    }
    .event-half-pm {
        background-color: #B5E4F0 !important;
        color: white !important;
    }
    .event-trip {
        background-color: #B7E4C7 !important;
        color: white !important;
    }
    .event-out {
        background-color: #D0F0B0 !important;
        color: white !important;
    }
    .event-late {
        background-color: #FFD59E !important;
        color: black !important;
    }
    .event-absent {
        background-color: #F7A6A6 !important;
        color: white !important;
    }

    /* 라벨 내부 정렬 */
    .event-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        padding: 0 4px;
        width: 100%;
    }
    .event-status {
        font-weight: 600;
        font-size: 10px;
    }
    .event-employee {
        font-weight: normal;
        font-size: 8px;
    }

    /* 라벨 테두리 제거 */
    .fc-event {
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
    }

    /* 오늘 날짜 */
    .fc-day-today {
        background-color: #ddf2ff !important;  /* 연한 파랑 */
    }

    /* 셀 내부 고정 높이 유지 */
    .fc-daygrid-day-frame {
        display: flex;
        flex-direction: column;
        justify-content: start;
        height: 90px !important;
        overflow: hidden;
    }

    /* 이벤트 라벨 높이 고정 */
    .fc-daygrid-event {
        height: 15px;
        line-height: 15px;
        font-size: 10px;
        padding: 0 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    /* 현재 연도/월 텍스트 */
    .fc-toolbar-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: #333 !important;
        font-family: 'Pretendard', sans-serif !important;
    }

    /* 오늘 버튼 */
    .fc-today-button {
        background-color: #00A8E8 !important;
        color: white !important;
        border: none !important;
        padding: 4px 10px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
    }

    /* 이전/다음 버튼 */
    .fc-prev-button,
    .fc-next-button {
        background-color: #00A8E8 !important;
        color: white !important;
        border: none !important;
        padding: 4px 10px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        margin-left: 4px !important;
    }

    /* 버튼 hover 효과 */
    .fc-button:hover {
        filter: brightness(1.1) !important;
        cursor: pointer !important;
    }

    /* 개인 일정 라벨 색 */
    .event-personal {
        background-color: #e19bf9 !important;
        color: white !important;
    }
</style>
