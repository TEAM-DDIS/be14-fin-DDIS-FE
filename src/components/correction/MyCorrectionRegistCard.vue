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
                <button class="apply-btn" @click="showModal = true">신청하기</button>
            </div>
        </div>
        <Teleport to="body">
            <div v-if="showModal" class="overlay">
                <div class="modal">
                    <span class="modal-desc">출근 시각 정정 신청</span>
                    <CorrectionRegistEvent @submit="handleSubmit" @cancel="showModal = false" />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'
    import CorrectionRegistEvent from './CorrectionRegistEvent.vue'

    const leaveRegistData = ref([])
    const showModal = ref(false)

    function handleSubmit(data) {
        console.log('제출된 데이터:', data)
        // 예: 백엔드 요청 or 데이터 추가 로직
        showModal.value = false
    }

    const columnDefs = [
        { headerName: '번호', field: 'id', sort: 'desc' },
        { headerName: '처리상태', field: 'approval_status' },
        { headerName: '신청일', field: 'request_time' },
        { headerName: '출근시각', field: 'check_in_time' },
        { headerName: '변경요청시각', field: 'requested_time_change' },
        { headerName: '처리시간', field: 'processed_time' },
        { headerName: '사유', field: 'reason' },
        { headerName: '반려사유', field: 'rejection_reason' }
    ]

    onMounted(async () => {
        const res = await fetch('/attendance.json')
        const json = await res.json()
        leaveRegistData.value = json.correction_regist
    })
</script>

<style scoped>
    .section {
        background: #fff;
        padding: 30px;
        border-radius: 12px;
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
        background-color: #00a8e8;
        color: white;
        font-weight: bold;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }

    .apply-btn:hover {
        background-color: white;
        color: #00a8e8;
        border-color: #00a8e8;
        box-shadow:
        inset 1px 1px 10px rgba(0, 0, 0, 0.25);
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
        border-radius: 20px;
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
</style>
