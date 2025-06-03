<template>
    <div class="leave-used-wrapper">
        <div class="section">
            <AgGrid
                class="ag-theme-alpine custom-theme"
                :gridOptions="{ theme: 'legacy' }"
                :columnDefs="columnDefs"
                :rowData="leaveUsedData"
                height="600px"
                :pagination="true"
                :paginationPageSize="10"
            />
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'

    const leaveUsedData = ref([])

    const columnDefs = [
        { headerName: '날짜', field: 'work_date', sort: "desc"},
        { headerName: '근무상태', field: 'work_status_id'},
        { headerName: '출근시간', field: 'check_in_time'},
        { headerName: '퇴근시간', field: 'check_out_time'},
        { headerName: '근무시간', field: 'work_duration'},
        { headerName: '시간외근무시간', field: 'over_work'},
        { headerName: '야간근무시간', field: 'night_work'},
        { headerName: '휴일근무시간', field: 'holiday_work'},
        { headerName: '총 근무시간', field: 'work_sum'}
    ]

    onMounted(async () => {
        const res = await fetch('/attendance.json')
        const json = await res.json()
        leaveUsedData.value = json.commute
    })
</script>

<style scoped>
    .leave-used-wrapper {
        display: flex;
        justify-content: space-between;
        background: #fff;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
        flex-wrap: wrap;
    }

    .section {
        width: 100%;
    }
</style>
