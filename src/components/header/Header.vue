<template>
  <header class="header">
    <!-- 왼쪽: 로고 -->
    <div class="header-left">
      <RouterLink to="/">
        <img src="/images/erpizza_logo.svg" alt="logo" class="logo-img" />
      </RouterLink>
    </div>

    <!-- 오른쪽: 알림 + 유저 정보 -->
    <div class="header-right">
      <!-- 알림 아이콘 -->
      <div class="notice">
        <img src="@/assets/icons/bell.svg" alt="notice"/>
      </div>

      <!-- 사용자 정보 -->
      <div class="profile-wrapper">
        <img src="/images/erpizza_profile.svg" alt="profile" class="profile-img"/>
        <span class="user-name">김띠스 대리님</span>
      </div>
    </div>
  </header>
</template>

<script setup>
// 별도 스크립트 없음
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px; /* ✅ 헤더 높이 고정 */
  padding: 0 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
  box-sizing: border-box;
}

.logo-img {
  height: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice{
  width: 24px;
  height: 24px;
}

.profile-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-img {
  width: 24px;
  height: 24px;
  display: block;           /* ✅ 인라인 기본 정렬 문제 제거 */
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  line-height: 24px;        /* ✅ 이미지 높이와 일치시켜 정렬 */
  display: inline-block;
}
</style>
