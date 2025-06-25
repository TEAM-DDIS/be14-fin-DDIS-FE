<template>
  <header class="header">
    <!-- 왼쪽: 로고 -->
    <div class="header-left">
      <RouterLink to="/">
        <img src="/images/erpizza_logo.svg" alt="logo" class="logo-img" />
      </RouterLink>
    </div>

    <!-- 오른쪽: 알림 + 다크모드 + 유저 정보 or 로그인 버튼 -->
    <div class="header-right">
      <!-- 알림 -->
      <div class="notice" @click="toggleNotification()">
        <img src="@/assets/icons/bell.svg" alt="notice" class="notice-img" />
        <span v-if="store.unreadCount > 0" class="badge">
          {{ store.unreadCount }}
        </span>
      </div>

      <!-- 다크모드 텍스트 + 파란 토글 스위치 -->
      <div class="darkmode-toggle">
        <span class="toggle-label">다크모드</span>
        <label class="switch">
          <input type="checkbox" :checked="isDarkMode" @change="$emit('toggle-dark-mode')" />
          <span class="slider"></span>
        </label>
      </div>

      <template v-if="user">
        <div class="profile-wrapper">
          <img
            :src="profileUrl"
            alt="프로필"
            class="profile"
            @error="onImageError"
          />
          <span class="user-name">{{ user.employeeName }}님</span>
        </div>
        <button class="btn-logout" @click="logout">로그아웃</button>
      </template>
      <template v-else>
        <RouterLink to="/org/login" class="btn-login-header">로그인</RouterLink>
      </template>
    </div>

    <NoticeModal
      v-if="showNotification"
      @close="closeNotification"
      @notificationClick="handleNotificationClick"
    />
  </header>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NoticeModal from '@/components/notice/NoticeModal.vue'
import { useNotificationStore } from '@/stores/notice'
const store = useNotificationStore()

defineProps({
  isDarkMode: Boolean
})

const router = useRouter()
const userStore = useUserStore()

const showNotification = ref(false)

const profileUrl = computed(() => userStore.profileUrl)

function onImageError(e) {
  e.target.src = '/images/erpizza_profile.svg'
}

onMounted(async () => {
  await userStore.fetchAllEmployees()
  store.fetch()

  console.log('HEADER ▶ profileUrl =', userStore.profileUrl)

})

const user = computed(() => userStore.user)

function logout() {
  userStore.logout()
  router.push({ name: 'Login' })
  localStorage.clear()
}

async function toggleNotification() {
  showNotification.value = !showNotification.value
}


async function handleNotificationClick(item) {
  const token = userStore.accessToken
  try {
    const res = await fetch(`https://api.isddishr.site/notice/${item.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) console.warn('읽음 처리 실패:', res.status)
    item.unread = false
  } catch (err) {
    console.error('읽음 처리 중 예외 발생:', err)
  }

  showNotification.value = false

  switch (item.type) {
    case '연차촉진':
      router.push({ path: '/attendance/myLeave' })
      break
    case '결재':
      router.push({ path: '/eapproval/approve' })
      break
    case '인사발령':
      router.push({ path: '/org/appointment' })
      break
    default:
      router.push({ path: '/' })
  }
}

function closeNotification() {
  showNotification.value = false
}
</script>

<style scoped>
.header {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background-color: var( --bg-sidebar);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: background-color 0.3s, border-color 0.3s;
}

.logo-img {
  height: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.notice {
  position: relative;
  margin-top: 4px;
}
.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 0 6px;
  font-size: 0.75rem;
  line-height: 1.5;
}
.notice-img {
  width: 28px;
  height: 28px;
  cursor: pointer;
  filter: var(--icon-filter, brightness(0));
}

.profile-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.profile {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.user-name {
  font-size: 14px;
  line-height: 28px;
  font-weight: 500;
  color: var(--text-main);
}

.btn-login-header,
.btn-logout {
  padding: 6px 12px;
  background-color: var(--primary);
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  border:  1px solid transparent;
  cursor: pointer;
  box-shadow: inset 0 0 0 transparent;
  text-decoration: none;
  color: white;
}

.btn-login-header:hover,
.btn-logout:hover {
  background-color: var(--bg-body);
  color: var(--primary);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--primary);
}

.darkmode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  background-color: #ccc;
  border-radius: 24px;
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
}
.slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}
input:checked + .slider {
  background-color: var(--primary);
}
input:checked + .slider::before {
  transform: translateX(24px);
}
</style>
