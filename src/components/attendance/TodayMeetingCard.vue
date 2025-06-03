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
          <td>{{ meeting.meeting_title }}</td>
          <td>{{ meeting.meeting_time }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  // 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환하는 헬퍼 함수
  function getTodayString() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const loading = ref(true)
  const allMeetings = ref([])
  const todayMeetings = ref([])

  onMounted(async () => {
    try {
      // public/attendance.json 안의 meetings 배열을 불러옵니다.
      const res = await fetch('/attendance.json')
      const obj = await res.json()
      allMeetings.value = obj.meetings || []
      const todayStr = getTodayString()

      // meetings 중 오늘 날짜에 해당하는 것만 필터링
      todayMeetings.value = allMeetings.value.filter(item => item.meeting_date === todayStr)
    } catch (err) {
      console.error('attendance.json의 meetings 로드 실패:', err)
      todayMeetings.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
  .meeting-event-card {
    background-color: #ffffff;
    border-radius: 20px;
    box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
    padding: 20px;
    min-height: 200px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }

  .msg {
    font-size: 14px;
    color: #777;
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
    background-color: #E7E7E7;
  }

  .meeting-table th,
  .meeting-table td {
    border: 2px solid #F8F9FA;
    padding: 8px 12px;
    font-size: 14px;
    color: #333;
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
    background-color: #f3f4f6;
  }
</style>
