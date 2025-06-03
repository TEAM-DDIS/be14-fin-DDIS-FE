<template>
  <div class="team-work-status">
    <!-- 1) 프로필 이미지 -->
    <img
      :src="profileImg"
      alt="프로필"
      class="avatar"
      @error="onImageError"
    />

    <!-- 2) 사원 이름 / 직책 -->
    <div class="info">
        <div class="role">{{ role }}</div>
        <div class="name">{{ name }}</div>
    </div>

        <!-- 3) 근무 상태 (badge) : 동적으로 클래스 추가 -->
    <div :class="['status', statusClass]">
      {{ status }}
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    profileImg: { type: String, default: '' },
    name:       { type: String, required: true },
    role:       { type: String, required: true },
    status:     { type: String, required: true }
  });

  // 이미지 로딩에 실패할 경우, 기본(빈) 이미지로 대체하고자 한다면 아래처럼 작성할 수 있습니다.
  //function onImageError(e) {
  //e.target.src = '/img/default-profile.png'; // public 폴더에 적당한 기본 이미지 경로
  //}

  // status 값에 따라 badge용 클래스를 리턴
  const statusClass = computed(() => {
    switch (props.status) {
      case '근무 중':       return 'badge-근무중';
      case '연차':       return 'badge-연차';
      case '오전반차':
      case '오후반차':   return 'badge-반차';
      case '출장':       return 'badge-출장';
      case '외근':       return 'badge-외근';
      case '지각':       return 'badge-지각';
      case '결근':       return 'badge-결근';
      case '-':       return 'badge-출근전';
      default:           return '';
    }
  });
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
    color: black;
  }

  .role {
    font-weight: bold;
    font-size: 14px;
    color: #C6C6C6;
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
    color: white;
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
</style>
