<template>
    <h1 class="page-title">팀 근태 현황</h1>
    <div class="team-attendance-page">
        <div class="left-panel">
            <div class="team-work-status-card">
                <span class="desc">팀 근무 현황</span>
                <TeamWorkStatusCard/>
            </div>
            <div class="meeting-event-card">
                <span class="desc">오늘 회의 일정</span>
                <TodayMeetingCard/>
            </div>
        </div>
        <div class="right-panel">
            <span class="desc">팀 캘린더</span>
            <TeamCalendar/>
        </div>
    </div>
</template>

<script setup>
    import TeamCalendar from '@/components/calendar/TeamCalendar.vue'
    import TeamWorkStatusCard from '@/components/attendance/TeamWorkStatusCard.vue'
    import TodayMeetingCard from '@/components/attendance/TodayMeetingCard.vue'
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 30px;
        color: var(--primary);
    }

    .desc {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
    }

    .team-attendance-page {
        display: flex;
        gap: 40px;
        /* padding: 20px; */
         margin: 0 20px 24px;
    }

    .left-panel {
        width: 400px;
        display: flex;
        flex-direction: column;
    }

    .team-work-status-card {
        margin-bottom: 30px;
    }

    .meeting-event-card {
        margin-bottom: 30px;
    }

    .right-panel {
        flex: 1;
    }
</style>