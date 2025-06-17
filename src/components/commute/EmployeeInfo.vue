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
  import { useUserStore } from '@/stores/user'

  const props = defineProps({
    employeeId: {
      type: String,
      required: true
    },
    dateRange: {
      type: Object,
      default: () => ({ start: '', end: '' })
    }
  })

  const employee = ref(null)

  onMounted(async () => {
    try {
      const userStore = useUserStore()
      const token = userStore.accessToken
      
      if (!token) {
        console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
        return
      }

      const query = new URLSearchParams({
        startDate: props.dateRange.start,
        endDate: props.dateRange.end
      })

      const res = await fetch(`http://localhost:8000/attendance/commute/${props.employeeId}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('직원 정보 조회 실패')

      const json = await res.json()
      employee.value = json.employeeInfo
    } catch (err) {
      console.error(err)
    }
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
