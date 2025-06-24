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
                @row-click="e => emit('row-click', e.data)"
            />
            <button @click="downloadCSV" class="download-btn">CSV 다운로드</button>
        </div>
    </div>
    <BaseToast ref="toastRef" />
</template>

<script setup>
    import { ref, reactive, computed, onMounted } from 'vue'
    import AgGrid from '@/components/grid/BaseGrid.vue'
    import BaseToast from '@/components/toast/BaseToast.vue'

    const toastRef = ref(null)

    function showToast(msg) {
        toastRef.value?.show(msg)
    }

    const emit = defineEmits(['row-click'])

    const searchKeyword = ref('')
    const filters = reactive({
        headName: '',
        departmentName: '',
        teamName: '',
        rankName: ''
    })

    const props = defineProps({
        commuteList: {
            type: Array,
            required: true
        },
        dateRange: {
            type: Object,
            default: () => ({ start: '', end: '' })
        }
    })

    // 시간 포맷터
    const formatTime = (raw) => raw ? raw.split('.')[0] : '-'
    const convertMinutesToHours = (mins) => mins ? Math.floor(mins / 60) : 0

    // 날짜 필터링
    const filteredCommuteList = computed(() => {
        return props.commuteList.filter(item => {
            const date = item.workDate?.slice(0, 7)
            return (!props.dateRange.start || date >= props.dateRange.start) &&
                    (!props.dateRange.end || date <= props.dateRange.end)
        })
    })
    const columnDefs = [
        { headerName: '번호', valueGetter: params => params.node.rowIndex + 1, sortable: false, width: 100 },
        { headerName: '사번', field: 'employeeId' },
        { headerName: '성명', field: 'employeeName', width: 150 },
        { headerName: '연차', field: 'annualCount', width: 150 },
        { headerName: '반차', field: 'halfCount', width: 150 },
        { headerName: '출장', field: 'businessTripCount', width: 150 },
        { headerName: '외근', field: 'outsideCount', width: 150 },
        { headerName: '초과근무', field: 'overtimeCount', width: 150 },
        { headerName: '지각', field: 'lateCount', width: 150 },
        { headerName: '결근', field: 'absentCount', width: 150 },
        { headerName: '출근일수', field: 'presentCount', width: 150 },
        { headerName: '총 근무시간', field: 'totalWorkTime', valueFormatter: p => convertMinutesToHours(p.value), width: 150 }
    ]

    const uniqueHeads = computed(() =>
        [...new Set(props.commuteList.map(e => e.headName).filter(Boolean))]
    )
    const uniqueRanks = computed(() =>
        [...new Set(props.commuteList.map(e => e.rankName).filter(Boolean))]
    )
    const filteredDepartments = computed(() =>
        [...new Set(props.commuteList.filter(e => !filters.headName || e.headName === filters.headName).map(e => e.departmentName).filter(Boolean))]
    )
    const filteredTeams = computed(() =>
        [...new Set(props.commuteList.filter(e => !filters.departmentName || e.departmentName === filters.departmentName).map(e => e.teamName).filter(Boolean))]
    )

    const filteredEmployees = computed(() => {
        const keyword = searchKeyword.value.toLowerCase()

        return props.commuteList.filter(e => {
            const inKeyword =
            !keyword ||
            e.employeeId?.toString().includes(keyword) ||
            e.employeeName?.toLowerCase().includes(keyword)

            const inOrgFilter =
            (!filters.headName || e.headName === filters.headName) &&
            (!filters.departmentName || e.departmentName === filters.departmentName) &&
            (!filters.teamName || e.teamName === filters.teamName) &&
            (!filters.rankName || e.rankName === filters.rankName)

            return inKeyword && inOrgFilter
        })
    })

    function downloadCSV() {
        if (!filteredEmployees.value.length) {
            showToast('출퇴근 내역이 없습니다.')
            return
        }

        const headers = [
            '사번', '성명', '연차', '반차', '출장', '외근',
            '초과근무', '지각', '결근', '출근일수', '총 근무시간'
        ]

        const rows = filteredEmployees.value.map(item => [
            `\t${item.employeeId}`,
            item.employeeName,
            item.annualCount ?? '',
            item.halfCount ?? '',
            item.businessTripCount ?? '',
            item.outsideCount ?? '',
            item.overtimeCount ?? '',
            item.lateCount ?? '',
            item.absentCount ?? '',
            item.presentCount ?? '',
            item.totalWorkTime ?? ''
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
        link.setAttribute('download', '출퇴근_요약.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
</script>

<style scoped>
    .all-leave-used-card {
        background-color: var(--bg-box);
        padding: 30px;
        border-radius:12px;
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
        border-radius: 4px;
    }
    .search-bar input,
    .filters select {
    background-color: var(--bg-main);
    color: var(--text-main);
    border: 1px solid var(--border-color);
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
        border: 1px solid var(--border-color);
        border-radius: 4px;
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
    background-color: var(--text-on-primary);
    color:  var(--primary);
    border-color: var(--primary);
    box-shadow:
    inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }
</style>
