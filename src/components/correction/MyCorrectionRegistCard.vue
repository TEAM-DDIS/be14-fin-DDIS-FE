<template>
    <div>
        <div class="section leave-regist-section">
            <AgGrid
                class="ag-theme-alpine custom-theme"
                :gridOptions="{ theme: 'legacy' }"
                :columnDefs="columnDefs"
                :rowData="leaveRegistData"
                height="250px"
                :pagination="true"
                :paginationPageSize="10"
                :style="{ width: '100%' }"
            />
            <div class="btn-area">
                <button class="apply-btn">신청하기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'

    const leaveRegistData = ref([])

    const columnDefs = [
        { headerName: '번호', field: 'id', sort: 'desc'},
        { headerName: '처리상태', field: 'approval_status'},
        { headerName: '신청일', field: 'request_time'},
        { headerName: '출근시각', field: 'check_in_time'},
        { headerName: '변경요청시각', field: 'requested_time_change'},
        { headerName: '처리시간', field: 'processed_time'},
        { headerName: '사유', field: 'reason'},
        { headerName: '반려사유', field: 'rejection_reason'}
    ]

    onMounted(async () => {
        const res = await fetch('/attendance.json')
        const json = await res.json()
        leaveRegistData.value = json.correction_regist
    })
</script>

<style scoped>
    .section {
        display: flex;
        justify-content: space-between;
        background: #fff;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
        flex-wrap: wrap;
    }

    .btn-area {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .apply-btn {
        display: block;
        width: 93px;
        height: 37px;
        background-color: #00A8E8;
        color: white;
        font-size: 14px;
        font-weight: bold;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        padding: 5px 10px;
        margin: 16px 0 0 auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
    }

    .apply-btn:hover {
        background-color: white;
        color: #00A8E8;
        border: 1px solid #00A8E8;
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }
</style>
