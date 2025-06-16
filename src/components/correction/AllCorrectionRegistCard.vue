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
                <div class="btn-area-wrapper">
                    <!-- 왼쪽: CSV 다운로드 -->
                    <div class="left-btn">
                        <button @click="downloadCSV" class="download-btn">CSV 다운로드</button>
                    </div>

                    <!-- 오른쪽: 승인 / 반려 -->
                    <div class="right-btn">
                        <button class="reject-btn" @click="openModal('reject')">반려</button>
                        <button class="apply-btn" @click="openModal('approve')">승인</button>
                    </div>
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
    import { useUserStore } from '@/stores/user'

    const userStore = useUserStore()

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

    async function handleConfirm() {
    if (!selectedRow.value?.attendanceId) {
        alert('attendanceId가 없습니다.')
        return
    }

    try {
        const token = userStore.accessToken

        const res = await fetch(`http://localhost:8000/attendance/correction/approve`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,        // ✅ 인증 토큰 추가
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendanceId: selectedRow.value.attendanceId })
        })

        if (!res.ok) throw new Error('승인 실패')
        alert('승인 완료!')
        showModal.value = false
        selectedRow.value = null
        location.reload()
    } catch (err) {
        console.error('승인 에러:', err)
        alert('승인 중 오류 발생')
    }
    }

    async function handleSubmit(data) {
    if (!selectedRow.value?.attendanceId) {
        alert('attendanceId가 없습니다.')
        return
    }

    try {
        const token = userStore.accessToken // ✅ userStore에서 토큰 가져오기

        const res = await fetch(`http://localhost:8000/attendance/correction/reject`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,        // ✅ 인증 토큰 추가
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attendanceId: selectedRow.value.attendanceId,
            rejectReason: data.reason
        })
        })

        if (!res.ok) throw new Error('반려 실패')
        alert('반려 완료!')
        showModal.value = false
        selectedRow.value = null
        location.reload()
    } catch (err) {
        console.error('반려 에러:', err)
        alert('반려 중 오류 발생')
    }
    }

    const employees = ref([])
    const searchKeyword = ref('')
    const filters = reactive({
        headName: '',
        departmentName: '',
        teamName: '',
        rankName: ''
    })

    const props = defineProps({
        dateRange: {
            type: Object,
            default: () => ({ start: '', end: '' })
        }
    })

    const columnDefs = [
        { headerName: '번호', valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false },
        { headerName: '사번', field: 'employeeId' },
        { headerName: '성명', field: 'employeeName' },
        { headerName: '처리상태', field: 'approvalStatus' },
        { headerName: '신청일', field: 'requestTime' },
        { headerName: '출근시각', field: 'beforeCheckInTime', valueFormatter: ({ value }) => value ? value.split('.')[0] : '' },
        { headerName: '변경요청시각', field: 'requestedTimeChange',
            valueFormatter: ({ value }) => {
                if (!value) return ''
                const time = new Date(value).toTimeString().split(' ')[0]
                return time
            } 
        },
        { headerName: '처리시간', field: 'processedTime' },
        { headerName: '사유', field: 'reason' },
        { headerName: '반려사유', field: 'rejectReason' }
    ]

    onMounted(async () => {
    try {
        const token = userStore.accessToken
        const res = await fetch('http://localhost:8000/attendance/correction/history/request/all', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
        })

        if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || '출근 정정 신청 내역 조회 실패')
        }

        const json = await res.json()
        employees.value = json
    } catch (err) {
        console.error('출근 정정 신청 내역 조회 실패:', err)
        alert('권한이 없거나 요청에 실패했습니다.')
    }
    })

    const uniqueHeads = computed(() =>
        [...new Set(employees.value.map(e => e.headName).filter(Boolean))]
    )
    const uniqueRanks = computed(() =>
        [...new Set(employees.value.map(e => e.rankName).filter(Boolean))]
    )
    const filteredDepartments = computed(() =>
        [...new Set(employees.value.filter(e => !filters.headName || e.headName === filters.headName).map(e => e.departmentName).filter(Boolean))]
    )
    const filteredTeams = computed(() =>
        [...new Set(employees.value.filter(e => !filters.departmentName || e.departmentName === filters.departmentName).map(e => e.teamName).filter(Boolean))]
    )

    const filteredEmployees = computed(() => {
    const keyword = searchKeyword.value.toLowerCase()

    return employees.value.filter(e => {
        const inKeyword =
        !keyword ||
        e.employeeId.toString().includes(keyword) ||
        e.employeeName.toLowerCase().includes(keyword)

        const inOrgFilter =
        (!filters.headName || e.headName === filters.headName) &&
        (!filters.departmentName || e.departmentName === filters.departmentName) &&
        (!filters.teamName || e.teamName === filters.teamName) &&
        (!filters.rankName || e.rankName === filters.rankName)

        const requestMonth = e.requestTime?.slice(0, 7)
        const inDateRange =
            (!props.dateRange.start || requestMonth >= props.dateRange.start) &&
            (!props.dateRange.end || requestMonth <= props.dateRange.end)
        return inKeyword && inOrgFilter && inDateRange
    })
    })

    function downloadCSV() {
        if (!filteredEmployees.value.length) {
            alert('출근 정정 신청 내역이 없습니다.')
            return
        }

        const headers = [
            '사번', '성명', '처리상태', '신청일',
            '출근시각', '변경요청시각', '처리시간',
            '사유', '반려사유'
        ]

        const rows = filteredEmployees.value.map(item => [
            `\t${item.employeeId}`,
            item.employeeName,
            item.approvalStatus || '',
            item.requestTime || '',
            item.beforeCheckInTime?.split('.')[0] || '',
            item.requestedTimeChange
                ? new Date(item.requestedTimeChange).toTimeString().split(' ')[0]
                : '',
            item.processedTime || '',
            item.reason || '',
            item.rejectReason || ''
        ])

        const csvContent = [headers, ...rows]
            .map(e => e.map(v => `"${v}"`).join(','))
            .join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;'
        })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', '출근정정신청내역.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
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

    .btn-area-wrapper {
        width: 100%;
        display: flex;
        justify-content: space-between; /* 양쪽 정렬 */
        align-items: center;            /* 수직 정렬 */
        margin-top: 20px;
    }

    /* 버튼 그룹 가로 정렬 */
    .left-btn,
    .right-btn {
        display: flex;
        align-items: center;
    }

    /* 오른쪽 버튼 간 간격 */
    .right-btn {
        gap: 20px;
    }

    .download-btn {
        font-size: 14px;
        font-weight: bold;
        background-color: #00a8e8;
        color: white;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        white-space: nowrap;
    }

    .download-btn:hover {
        background-color: white;
        color: #00a8e8;
        border-color: #00a8e8;
        box-shadow:
        inset 1px 1px 10px rgba(0, 0, 0, 0.25);
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
