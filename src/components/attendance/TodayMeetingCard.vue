<template>
  <div class="meeting-event-card">
    <!-- 1) 로딩 중 또는 데이터가 없을 때 메시지 -->
    <div v-if="loading" class="msg">데이터 로딩 중…</div>
    <div v-else-if="todayMeetings.length === 0" class="msg">오늘 예정된 회의가 없습니다.</div>
    <!-- 2) 데이터가 있으면 HTML table로 보여주기 -->
    <table v-else class="meeting-table">
      <thead>
        <tr>
          <th class="col-title">회의명</th>
          <th class="col-time">시간</th>
        </tr>
      </thead>
      <tbody>
        <!-- 오늘 날짜에 해당되는 회의만 반복 렌더링 -->
        <tr v-for="(meeting, idx) in todayMeetings" :key="idx">
          <td>{{ meeting.meetingTitle }}</td>
          <td>{{ meeting.meetingTime }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'


  const loading = ref(true)
  const todayMeetings = ref([])

  function getTodayString() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) {
      console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
      loading.value = false
      return
    }

    try {
      const res = await fetch('http://localhost:5000/attendance/meeting/today', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`)
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        throw new Error('API 응답이 배열이 아닙니다.')
      }

      todayMeetings.value = data
    } catch (err) {
      console.error('오늘 회의 일정 API 호출 실패:', err)
      todayMeetings.value = []
    } finally {
      loading.value = false
    }
  })
</script>


<style scoped>
  .meeting-event-card {
    background-color: var(--bg-box);
    border-radius: 20px;
    box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
    padding: 20px;
    min-height: 200px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-main);
  }

  .msg {
    font-size: 14px;
    color: var(--text-muted);
    text-align: center;
    padding: 40px 0;
  }

  /* --------------- 테이블 스타일 --------------- */
  .meeting-table {
    margin-top: 10px;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .meeting-table thead {
    background-color: var(--bg-menu-btn-hover2);

  }

  .meeting-table th,
  .meeting-table td {
    border: 2px solid var(--border-color);
    padding: 8px 12px;
    font-size: 14px;
    color: var(--text-main);
  }

  .meeting-table th {
    font-weight: 600;
    text-align: left;
  }

  /* 컬럼 너비 조절 (flexible) */
  .col-title {
    width: 70%;
  }
  .col-time {
    width: 30%;
    text-align: center;
  }

  /* 행 Hover 효과 */
  .meeting-table tbody tr:hover {
    background-color: var(--bg-menu-btn-hover);
  }
</style>
