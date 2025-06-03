<template>
  <div class="team-status-card">
    <h2 class="team-title">{{ teamName }}</h2>
    <!-- 데이터가 아직 로드되지 않았거나, 해당 팀에 오늘 데이터가 없으면 안내 메시지 -->
    <div v-if="loading" class="loading-msg">
      데이터 로딩 중…
    </div>
    <div v-else-if="filteredList.length === 0" class="no-data-msg">
      해당 팀의 오늘 근무 데이터가 없습니다.
    </div>
    <!-- 실제 데이터가 있으면, TeamWorkStatus 컴포넌트를 반복 출력 -->
    <div v-else class="status-list">
      <TeamWorkStatus
        v-for="(user, idx) in filteredList"
        :key="idx"
        :profileImg="user.profile_img"
        :name="user.employee_name"
        :role="user.role"
        :status="user.work_status_id"
      />
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import TeamWorkStatus from './TeamWorkStatus.vue'

  // 부모가 반드시 넘겨야 하는 prop
  const props = defineProps({
    teamName: {
      type: String,
      required: true
    }
  })

  // 오늘 날짜를 "YYYY-MM-DD" 형식으로
  function getTodayString() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const todayStr = getTodayString()

  const rawList = ref([])       // attendance.json 전체 teamattendance 데이터
  const filteredList = ref([])  // 오늘 + 해당 팀만 필터링한 결과
  const loading = ref(true)

  onMounted(async () => {
    try {
      // 1) public/attendance.json 파일에서 teamattendance 배열을 읽어 옵니다.
      const res = await fetch('/attendance.json')
      const obj = await res.json()
      rawList.value = obj.teamattendance || []

      // 2) 필터링: team_id === props.teamName  &  work_date === todayStr
      filteredList.value = rawList.value.filter(item => {
        return (
          item.team_id === props.teamName &&
          item.work_date === todayStr
        )
      })
    } catch (err) {
      console.error('attendance.json 로드 실패:', err)
      filteredList.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
  .team-status-card {
    background-color: #ffffff;
    border-radius: 20px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    padding: 20px;
    min-height: 300px;
  }

  .team-title {
    font-size: 18px;
    font-weight: bold;
    padding-bottom: 10px;
    margin-bottom: 16px;
    color: #00A8E8;
    border-bottom: 0.5px solid #C6C6C6;
  }

  .loading-msg,
  .no-data-msg {
    font-size: 14px;
    color: #777;
    text-align: center;
    padding: 24px 0;
  }

  .status-list {
    display: flex;
    flex-direction: column;
  }

  /* TeamWorkStatus.vue 가 반복 출력될 때, 아래 패딩을 준다 */
  .status-list > * + * {
    margin-top: 8px;
  }
</style>
