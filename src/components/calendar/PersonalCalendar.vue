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
                <FullCalendar :options="calendarOptions" style="width: 100%;" />
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
    </div>
</template>

<script setup>
    import { onMounted, reactive, ref } from 'vue'
    import FullCalendar from '@fullcalendar/vue3'
    import dayGridPlugin from '@fullcalendar/daygrid'
    import interactionPlugin from '@fullcalendar/interaction'
    import koLocale from '@fullcalendar/core/locales/ko'
    import PersonalEventCard from '../attendance/PersonalEventCard.vue'

    const show = ref(false)

    function onAdd({ date, title, time }) {
        calendarOptions.events.push({
            title: '',              // eventContent에서 actual title/time을 렌더링
            start: date,            // ex) "2025-05-30"
            className: 'event-personal',
            extendedProps: {
                type: 'personal',
                title,
                time
            }
        })
        show.value = false
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
    const res = await fetch('/attendance.json')
    const { schedule } = await res.json()
    calendarOptions.events = schedule.map(item => ({
            title: '', // 직접 렌더링 하므로 필요 없음
            start: item.work_date,
            className: convertStatusToClass(item.work_status_id),
            extendedProps: {
                status: item.work_status_id,
                employee: item.employee_name
            }
        }))
    })
</script>

<style setup>
    /* 캘린더 박스 */
    .personal-calendar {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
        padding-left: 25px;
        padding-top: 25px;
        padding-bottom: 25px;
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
    .dot.half    { background-color: #8CC2FF; }
    .dot.trip  { background-color: #C5E695; }
    .dot.out  { background-color: #D0F0B0; }
    .dot.late  { background-color: #FFD38C; }
    .dot.absent  { background-color: #FF8C9A; }
    .dot.schedule  { background-color: #AE8CFF; }

    /* 일정 등록 버튼 */
    .register-btn {
        background-color: #00A8E8;
        border: 1px solid #00A8E8;
        color: #fff;
        font-weight: bold;
        border-radius: 10px;
        padding: 4px 12px;
        margin-left: 639px;
        width: 93px;
        height: 37px;
        font-size: 14px;
    }
    .register-btn:hover {
        background-color: #fff;
        color: #00A8E8;
        border: 1px solid #00A8E8;
        box-shadow: inset 1px 1px 6px rgba(0,0,0,0.1);
    }

    .register-btn:focus {
        outline: none !important;
        box-shadow: none !important;
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

    .desc {
        display: block;
        font-size: 18px;
        color: #666;
        line-height: 1.4;
        margin-bottom: 20px;
    }

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
        background-color: white !important;
        border: 3.5px solid #8C9FFF !important;
    }
    .event-half-am {
        background-color: white !important;
        border: 3.5px solid #8CC2FF !important;
    }
    .event-half-pm {
        background-color: white !important;
        border: 3.5px solid #8CC2FF !important;
    }
    .event-trip {
        background-color: white !important;
        border: 3.5px solid #C5E695 !important;
    }
    .event-out {
        background-color: white !important;
        border: 3.5px solid #D0F0B0 !important;
    }
    .event-late {
        background-color: white !important;
        border: 3.5px solid #FFD38C !important;
    }
    .event-absent {
        background-color: white !important;
        border: 3.5px solid #FF8C9A !important;
    }

    .fc-daygrid-event {
        /* 기존 height: 15px 를 해제하고, 자동 높이나 최소 높이를 설정 */
        height: auto !important;
        min-height: 24px !important;    /* 원하는 최소 높이 */
        line-height: 24px !important;    /* 텍스트가 세로 가운데 오도록 */
        padding-bottom: 3px !important;
        margin-left: 10px !important;
        margin-right: 10px !important;
        font-size: 12px !important;      /* 전체 폰트 크기도 살짝 키워보기 */
        border-radius: 15px !important;
        margin-bottom: 5px !important;
    }

    /* 라벨 내부 정렬 */
    .event-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3 4px;
        width: 100%;
        height: 30px;
    }

    .event-status {
        color: black;
        font-weight: 600;
        font-size: 18px;
    }
    .event-employee {
        color: black;
        font-weight: normal;
        font-size: 16px;
    }

    /* 라벨 테두리 제거 */
    .fc-event {
        box-shadow: 0 2px 2px rgba(0,0,0,0.1) !important;
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
        min-height: 100px !important;
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

    /* disabled 상태(opacity) 해제 */
    .fc-button:disabled {
        opacity: 1 !important;
    }

    /* disabled Today 버튼에 대한 배경/글자색 고정 */
    .fc-today-button:disabled {
        background-color: #00A8E8 !important;
        color: white       !important;
        border: 1px solid transparent !important;
    }

    /* 오늘 버튼 */
    .fc-today-button {
        background-color: #00A8E8 !important;
        color: white !important;
        border: 1px solid transparent !important;
        padding: 4px 10px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        width: 50px !important;
        height: 30px !important;
    }

    /* 이전/다음 버튼 */
    .fc-prev-button,
    .fc-next-button {
        background-color: #00A8E8 !important;
        color: white !important;
        border: 1px solid transparent !important;
        padding: 4px 10px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        margin-left: 4px !important;
        width: 40px !important;
        height: 30px !important;
    }

    /* 버튼 hover 효과 */
    .fc-button:hover {
        background-color: white !important;
        color: #00A8E8 !important;
        border: 1px solid #00A8E8 !important;
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25) !important;
    }

    /* 개인 일정 라벨 색 */
    .event-personal {
        background-color: white !important;
        border: 3.5px solid #AE8CFF !important;
    }
</style>