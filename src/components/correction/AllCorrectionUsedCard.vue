<template>
    <div class="all-leave-used-card">
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
            <AgGrid
                class="ag-theme-alpine custom-theme"
                :gridOptions="{ theme: 'legacy' }"
                :columnDefs="columnDefs"
                :rowData="filteredEmployees"
                height="600px"
                :pagination="true"
                :paginationPageSize="20"
                :style="{ width: '100%' }"
            />
            <button @click="downloadCSV" class="download-btn">CSV 다운로드</button>
        </div>
    </div>
    <BaseToast ref="toastRef" />
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'
    import { useUserStore } from '@/stores/user'
    import BaseToast from '@/components/toast/BaseToast.vue'

    const toastRef = ref(null)

    function showToast(msg) {
        toastRef.value?.show(msg)
    }

    const userStore = useUserStore()

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
        { headerName: '번호', valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, width: 100 },
        { headerName: '사번', field: 'employeeId' },
        { headerName: '성명', field: 'employeeName', width: 150 },
        { headerName: '처리상태', field: 'approvalStatus', width: 150 },
        { headerName: '신청일', field: 'requestTime' },
        { headerName: '정정요청일', field: 'workDate'},
        { headerName: '출근시각', field: 'beforeCheckInTime', valueFormatter: ({ value }) => value ? value.split('.')[0] : '' },
        { headerName: '정정요청시각', field: 'requestedTimeChange',
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

        const res = await fetch('https://api.isddishr.site/attendance/correction/history/process/all', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`  
            }
        })

        if (!res.ok) {
        const text = await res.text()
        throw new Error(text || '출근 정정 내역 조회 실패')
        }

        const json = await res.json()
        employees.value = json
    } catch (err) {
        console.error('출근 정정 내역 조회 실패:', err)
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
            showToast('출근 정정 내역이 없습니다.')
            return
        }

        const headers = [
            '사번', '성명', '처리상태', '신청일', '정정요청일',
            '출근시각', '정정요청시각', '처리시간',
            '사유', '반려사유'
        ]

        const rows = filteredEmployees.value.map(item => [
            `\t${item.employeeId}`,
            item.employeeName,
            item.approvalStatus || '',
            item.workDate || '',
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
        link.setAttribute('download', '출근정정내역.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
</script>

<style scoped>
    .all-leave-used-card {
        background: var(--bg-box);
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
        margin-bottom: 15px;
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
        background: var(--modal-bg);
        color: var(--text-main);
        border-radius: 8px;
    }

    .search {
        width: 20px;
    }

    .filters {
        display: flex;
        gap: 30px;
        flex-wrap: wrap;
    }

    .filters select {
        padding: 6px 8px;
        border: 1px solid #ccc;
        background: var(--modal-bg);
        color: var(--text-main);
        border-radius: 8px;
    }

    .fixed-select {
        width: 150px;
    }

    .download-btn {
    font-size: 14px;
    font-weight: bold;
    background-color: var(--primary);
    color: var(--text-on-primary);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    margin-top: 20px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .download-btn:hover {
    background-color: var(--bg-main);
    color:  var(--primary);
    border-color: var(--primary);
    box-shadow:
    inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }
</style>
