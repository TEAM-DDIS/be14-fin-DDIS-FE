<!-- src/components/header/Header.vue -->
<template>
  <header class="header">
    <!-- 왼쪽: 로고 -->
    <div class="header-left">
      <RouterLink to="/">
        <img src="/images/erpizza_logo.svg" alt="logo" class="logo-img" />
      </RouterLink>
    </div>

    <!-- 오른쪽: 알림 + 유저 정보 or 로그인 버튼 -->
    <div class="header-right">
      <div class="notice">
        <img src="@/assets/icons/bell.svg" alt="notice"/>
      </div>

      <template v-if="user">
        <!-- 로그인 되었을 때: 프로필 + 로그아웃 -->
        <div class="profile-wrapper">
          <img src="/images/erpizza_profile.svg" alt="profile" class="profile-img"/>
          <span class="user-name">{{ user.employeeName }}님</span>
        </div>
        <button class="btn-logout" @click="logout">로그아웃</button>
      </template>
      <template v-else>
        <!-- 로그인 전일 때 -->
        <RouterLink to="/org/login" class="btn-login-header">
          로그인
        </RouterLink>
      </template>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// userStore.user 에 유저 객체가 담기면 로그인 상태
const user = computed(() => userStore.user)

function logout() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
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

.notice {
  width: 24px;
  height: 24px;
}

.profile-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  line-height: 28px;
  font-weight: 500;
}

.btn-login-header {
  padding: 6px 12px;
  background-color: #00aeef;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-login-header:hover {
  background-color: #0096d6;
}

.btn-logout {
  padding: 2px 6px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-logout:hover {
  background-color: #c0392b;
}
</style>
