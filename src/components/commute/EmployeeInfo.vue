<template>
    <div v-if="employee" class="employee-info-card">
        <table class="info-table">
            <thead>
                <tr>
                    <th>사번</th>
                    <th>성명</th>
                    <th>본부</th>
                    <th>부서</th>
                    <th>팀</th>
                    <th>직급</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ employee.employeeId }}</td>
                    <td>{{ employee.employeeName }}</td>
                    <td>{{ employee.headName }}</td>
                    <td>{{ employee.departmentName }}</td>
                    <td>{{ employee.teamName }}</td>
                    <td>{{ employee.rankName }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const props = defineProps({
        employeeId: {
            type: String,
            required: true
    }
    })

    const employee = ref(null)

    onMounted(async () => {
        const res = await fetch('/attendance.json')
        const json = await res.json()
        // 예: all_commute 배열에서 필터
        employee.value = json.employee_info.find(e => e.employeeId === props.employeeId)
    })
</script>

<style scoped>
    .employee-info-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
        margin-bottom: 30px;
        overflow-x: auto;
    }

    .info-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed; /* ✅ 각 열 너비 균등 */
        text-align: center;
        font-size: 14px;
    }

    .info-table th,
    .info-table td {
        border: 1px solid #e0e0e0;
        padding: 12px;
        white-space: nowrap;        /* 줄바꿈 방지 */
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .info-table th {
        background-color: #f8f8f8;
        font-weight: bold;
        color: #333;
    }

    .info-table td {
        color: #555;
    }
</style>
