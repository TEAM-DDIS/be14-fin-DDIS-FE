<template>
  <div class="team-status-card">
    <h2 class="team-title">{{ teamName }}</h2>

    <div v-if="loading" class="loading-msg">데이터 로딩 중…</div>
    <div v-else-if="statuses.length === 0" class="no-data-msg">해당 팀의 오늘 근무 데이터가 없습니다.</div>

    <div v-else class="status-list">
      <TeamWorkStatus
        v-for="(user, idx) in statuses"
        :key="user.employeeId"
        :profileImg="user.employeePhotoUrl"
        :name="user.employeeName"
        :role="user.positionName"
        :status="user.workStatusName"
        :checkOutTime="user.checkOutTime"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import TeamWorkStatus from './TeamWorkStatus.vue'
  import { useUserStore } from '@/stores/user'

  const teamName = ref('')
  const statuses = ref([])
  const loading = ref(true)

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken
    
    if (!token) {
      console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
      return
    }

    try {
      const res = await fetch('https://api.isddishr.site/attendance/status/team', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('API 오류')

      const data = await res.json()
      teamName.value = data.teamName
      statuses.value = data.statuses || []
    } catch (err) {
      console.error('팀 근무 현황 불러오기 실패:', err)
      statuses.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
  .team-status-card {
    background-color: var(--bg-box);
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
    color: var(--primary);
    border-bottom: 0.5px solid #C6C6C6;
  }

  .loading-msg,
  .no-data-msg {
    font-size: 14px;
    color: var(--text-muted);
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
