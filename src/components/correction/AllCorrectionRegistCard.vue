<template>
    <div class="all-leave-regist-card">
        <div class="section">
            <!-- 검색 + 필터 -->
            <div class="filters-row">
                <div class="search-bar">
                    <img src="@/assets/icons/search.svg" class="search" />
                    <input v-model="searchKeyword" placeholder="사번 또는 성명 검색" />
                </div>
                <div class="filters">
                    <div>
                        <label>본부 </label>
                        <select v-model="filters.headName" class="fixed-select">
                            <option value="">전체 본부</option>
                            <option v-for="h in uniqueHeads" :key="h">{{ h }}</option>
                        </select>
                    </div>
                    <div>
                        <label>부서 </label>
                        <select v-model="filters.departmentName" class="fixed-select">
                            <option value="">전체 부서</option>
                            <option v-for="d in filteredDepartments" :key="d">{{ d }}</option>
                        </select>
                    </div>
                    <div>
                        <label>팀 </label>
                        <select v-model="filters.teamName" class="fixed-select">
                            <option value="">전체 팀</option>
                            <option v-for="t in filteredTeams" :key="t">{{ t }}</option>
                        </select>
                    </div>
                    <div>
                        <label>직급 </label>
                        <select v-model="filters.rankName" class="fixed-select">
                            <option value="">전체 직급</option>
                            <option v-for="r in uniqueRanks" :key="r">{{ r }}</option>
                        </select>
                    </div>
                </div>
            </div>
            <!-- 표 -->
            <div class="section all-correction-regist">
                <AgGrid
                    class="ag-theme-alpine custom-theme"
                    :gridOptions="{ theme: 'legacy' }"
                    :columnDefs="columnDefs"
                    :rowData="filteredEmployees"
                    height="600px"
                    :pagination="true"
                    :paginationPageSize="10"
                    :style="{ width: '100%' }"
                    @row-click="onRowClick"
                />
                <div class="btn-area">
                    <button class="reject-btn" @click="openModal('reject')">반려</button>
                    <button class="apply-btn" @click="openModal('approve')">승인</button>
                </div>
            </div>
        </div>
        <!-- 모달 -->
        <Teleport to="body">
            <div v-if="showModal" class="overlay">
                <div class="modal">
                    <span class="modal-desc">
                        {{ modalType === 'reject' ? '출근 정정 요청 반려' : '출근 정정 요청 승인' }}
                    </span>
                    <CorrectionRejectEvent
                        v-if="modalType === 'reject'"
                        @submit="handleSubmit"
                        @cancel="showModal = false"
                    />
                    <CorrectionApproveEvent
                        v-else
                        @confirm="handleConfirm"
                        @cancel="showModal = false"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'
    import CorrectionRejectEvent from './CorrectionRejectEvent.vue'
    import CorrectionApproveEvent from './CorrectionApproveEvent.vue'

    const showModal = ref(false)
    const modalType = ref('reject') // 'reject' or 'approve'
    const selectedRow = ref(null)

    function onRowClick(event) {
        selectedRow.value = event.data
    }

    const componentListeners = computed(() => {
        return modalType.value === 'reject'
            ? { submit: handleSubmit }
            : { confirm: handleConfirm }
    })

    function openModal(type) {
        if (!selectedRow.value) {
            alert('항목을 선택해주세요.')
            return
        }
        modalType.value = type
        showModal.value = true
    }

    function handleConfirm() {
        console.log('승인')
        showModal.value = false
        selectedRow.value = null
    }


    function handleSubmit(data) {
        console.log(`제출된 데이터 [${modalType.value}]:`, data)
        showModal.value = false
        selectedRow.value = null
    }

    const employees = ref([])
    const searchKeyword = ref('')
    const filters = reactive({
        headName: '',
        departmentName: '',
        teamName: '',
        rankName: ''
    })

    const columnDefs = [
        { headerName: '번호', field: 'id', sort: 'desc' },
        { headerName: '사번', field: 'employeeId' },
        { headerName: '성명', field: 'employeeName' },
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
        employees.value = json.all_correction_regist
    })

    const uniqueHeads = computed(() => [...new Set(employees.value.map(e => e.headName).filter(Boolean))])
    const uniqueRanks = computed(() => [...new Set(employees.value.map(e => e.rankName).filter(Boolean))])
    const filteredDepartments = computed(() =>
    [...new Set(employees.value.filter(e => !filters.headName || e.headName === filters.headName).map(e => e.departmentName).filter(Boolean))]
    )
    const filteredTeams = computed(() =>
    [...new Set(employees.value.filter(e => !filters.departmentName || e.departmentName === filters.departmentName).map(e => e.teamName).filter(Boolean))]
    )

    const filteredEmployees = computed(() => {
    const keyword = searchKeyword.value.toLowerCase()
    return employees.value.filter(e =>
        (!keyword || e.employeeId.includes(keyword) || e.employeeName.toLowerCase().includes(keyword)) &&
        (!filters.headName || e.headName === filters.headName) &&
        (!filters.departmentName || e.departmentName === filters.departmentName) &&
        (!filters.teamName || e.teamName === filters.teamName) &&
        (!filters.rankName || e.rankName === filters.rankName)
    )
    })
</script>

<style scoped>
    .all-leave-regist-card {
        background: #fff;
        padding: 30px;
        border-radius: 0px 12px 12px 12px;
        box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
        flex-wrap: wrap;
    }

    .filters-row {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
    }

    .search-bar {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .search-bar input {
        width: 150px;
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .search {
        width: 20px;
    }

    .filters {
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
    }

    .filters-row {
        margin-bottom: 15px;
    }

    .filters select {
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .fixed-select {
        width: 150px;
    }

    .btn-area {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        gap: 20px
    }

    .reject-btn {
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

    .reject-btn:hover {
        background-color: white;
        color: #00a8e8;
        border-color: #00a8e8;
        box-shadow:
        inset 1px 1px 10px rgba(0, 0, 0, 0.25);
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
        padding: 20px;
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
</style>
