<template>
  <div class="team-work-status">
    <img
      :src="getProfileUrl(profileImg)"
      alt="프로필"
      class="avatar"
      @error="onImageError"
    />
    <div class="info">
      <div class="role">{{ role }}</div>
      <div class="name">{{ name }}</div>
    </div>
    <div :class="['status', badgeClass]">
      {{ displayStatus }}
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    profileImg: String,
    name: String,
    role: String,
    status: String,
    checkOutTime: String
  })

  const S3_BASE_URL = 'https://ddisbucket-fin.s3.ap-northeast-2.amazonaws.com'

  const getProfileUrl = path =>
    path ? `${S3_BASE_URL}/${path}` : '/images/erpizza_profile.svg'

  const badgeClass = computed(() => {
    if (props.checkOutTime && (props.status === '지각' || props.status === '정상근무')) {
      return 'badge-퇴근'
    }

    switch (props.status) {
      case '정상근무': return 'badge-근무중'
      case '연차': return 'badge-연차'
      case '오전반차':
      case '오후반차': return 'badge-반차'
      case '출장': return 'badge-출장'
      case '외근': return 'badge-외근'
      case '지각': return 'badge-지각'
      case '결근': return 'badge-결근'
      case '-': return 'badge-출근전'
      default: return ''
    }
  })

  const displayStatus = computed(() => {
    if (props.checkOutTime && (props.status === '지각' || props.status === '정상근무')) return '퇴근'
    if (props.status === '정상근무') return '근무 중'
    return props.status
  })
</script>

<style scoped>
  .team-work-status {
    display: flex;
    align-items: center;
    padding: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 12px;
  }

  .info {
    flex: 1;
  }

  .name {
    font-weight: bold;
    font-size: 16px;
    color: var(--text-main, #000);
  }

  .role {
    font-weight: bold;
    font-size: 14px;
    color: var(--text-sub, #C6C6C6);
  }

  /* 기본 badge 스타일 */
  .status {
    width: 66px;
    height: 30px;
    font-size: 15px;
    font-weight: bold;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 30px;
    color: var(--text-on-primary, #fff);
    text-align: center;
    white-space: nowrap;
    box-shadow: 1px 1px 10px 1px rgba(0, 0, 0, 0.1);
  }

  /* 상태별 배경색 지정 */
  .badge-근무중 {
    background-color: #50D4C6;
  }
  .badge-연차 {
    background-color: #8C9FFF;
  }
  .badge-반차 {
    background-color: #8CC2FF;
  }
  .badge-출장 {
    background-color: #C5E695;
  }
  .badge-외근 {
    background-color: #D0F0B0;
  }
  .badge-지각 {
    background-color: #FFD38C;
  }
  .badge-결근 {
    background-color: #FF8C9A;
  }
  .badge-출근전 {
    background-color: #c1c1c1;
  }
  .badge-퇴근 {
    background-color: #6d6d6d;
  }
</style>
