<template>
  <div class="leave-count-wrapper">
    <div class="count-box">
      <div class="count-item">
        <span class="label">총 연차</span>
        <span class="value">{{ leaveData.total_days }}</span>
      </div>
      <div class="count-item">
        <span class="label">사용연차</span>
        <span class="value">{{ leaveData.used_days }}</span>
      </div>
      <div class="count-item">
        <span class="label">신청중연차</span>
        <span class="value blue">{{ leaveData.pending_leave_days }}</span>
      </div>
      <div class="count-item">
        <span class="label">잔여연차</span>
        <span class="value red">{{ leaveData.remaining_days }}</span>
      </div>
    </div>
    <div class="vertical-divider"></div>
    <div class="notice-box">
      <div class="notice-item">
        <span class="label">1차촉진(사용계획작성)</span>
        <span class="value blue">{{ leaveData.first_notice_date || '-' }}</span>
      </div>
      <div class="notice-item">
        <span class="label">2차촉진(사용시기통보)</span>
        <span class="value blue">{{ leaveData.second_notice_date || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'

  const leaveData = ref({
    total_days: 0,
    used_days: 0,
    remaining_days: 0,
    pending_leave_days: 0,
    first_notice_date: '',
    second_notice_date: ''
  })

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) {
      console.error('로그인이 필요합니다.')
      return
    }

    try {
      const res = await fetch('https://api.isddishr.site/attendance/leave/status/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('연차 정보 조회 실패')
      }

      const json = await res.json()

      leaveData.value = {
        total_days: json.totalLeave,
        used_days: json.usedLeave,
        pending_leave_days: json.pendingLeave,
        remaining_days: json.remainingLeave,
        first_notice_date: json.firstPromotionDate,
        second_notice_date: json.secondPromotionDate
      }

    } catch (err) {
      console.error('API 오류:', err)
    }
  })
</script>

<style scoped>
  .leave-count-wrapper {
    display: flex;
    justify-content: space-between;
    background: var(--bg-box);
    padding-top: 30px;
    padding-bottom: 30px;
    border-radius: 12px;
      box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
  }

  .count-box {
    display: flex;
    gap: 80px;
    padding-left: 50px;
    flex-wrap: wrap;
    flex: 1;
  }

  .vertical-divider {
    width: 1px;
    background-color: #C7C7C7;
    margin: 0 100px;
  }

  .notice-box {
    display: flex;
    gap: 80px;
    padding-right: 80px;
    align-items: center;
    white-space: nowrap;
  }

  .count-item, .notice-item {
    display: flex;
    flex-direction: column;
    min-width: 120px;
    align-items: center;
    text-align: center;
  }

  .label {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-main);
    margin-bottom: 10px;
  }

  .value {
    font-size: 25px;
    font-weight: bold;
    color: var(--text-main);
  }

  .blue {
    color: #00a8e8;
  }

  .red {
    color: #e63946;
  }
</style>