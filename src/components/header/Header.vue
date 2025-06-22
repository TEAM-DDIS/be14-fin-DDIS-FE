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
      <div class="notice" @click="toggleNotification()">
        <img src="@/assets/icons/bell.svg" alt="notice"  class="notice-img"/>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
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

    <NoticeModal
      v-if="showNotification"
      :notifications="notifications"
      @close="closeNotification"
      @notificationClick="handleNotificationClick"
    />
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NoticeModal from '@/components/notice/NoticeModal.vue'

const router = useRouter()
const userStore = useUserStore()

// 모달 표시 여부
const showNotification = ref(false)
// 알림 목록
const notifications = ref([])

// ① 페이지 로드 직후 알림을 한 번 가져와서
//    새로고침 직후에도 벳지를 보여 줄 수 있게 한다.
onMounted(async () => {
  try {
    await fetchNotifications()
  } catch (e) {
    console.error('초기 알림 불러오기 실패:', e)
  }
})

// 읽지 않은 알림 개수
const unreadCount = computed(() =>
  notifications.value.filter(n => n.unread).length
)

// 로그인 상태 (Pinia store)
const user = computed(() => userStore.user)

// 로그아웃 처리
function logout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

// 모달 토글: 열릴 때마다 최신 알림 조회, 오류 있어도 열기 유지
async function toggleNotification() {
  // if (!showNotification.value) {
  //   try {
  //     await fetchNotifications()
  //   } catch (e) {
  //     console.error('알림 불러오기 중 오류:', e)
  //   }
  // }
  showNotification.value = !showNotification.value
}

// 알림 목록 조회 함수
async function fetchNotifications() {
  const token = localStorage.getItem('token')
  const res = await fetch('https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/notice/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) {
    throw new Error(`알림 불러오기 실패: ${res.status}`)
  }
  const data = await res.json()
  notifications.value = data.map(item => ({
    id: item.noticeId,
    type: item.noticeType,
    content: item.noticeContent,
    createdAt: item.createdAt,
    unread: !item.isRead,
    relatedId: item.relatedId
  }))
}

// 알림 클릭 시 읽음 처리 + 라우팅
async function handleNotificationClick(item) {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/notice/${item.id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) console.warn('읽음 처리 실패:', res.status)
    // 로컬에서도 즉시 읽음 표시
    item.unread = false
  } catch (err) {
    console.error('읽음 처리 중 예외 발생:', err)
  }

  // 모달 닫기
  showNotification.value = false

  // 타입별 네비게이션
  switch (item.type) {
    case '연차촉진':
      router.push({ path: '/attendance/myLeave' })
      break
    case '결재':
      router.push({ path: '/draftdoc/approve' })
      break
    case '인사발령':
      router.push({ path: '/org/appointment' })
      break
    default:
      router.push({ path: '/' })
  }
}

// 모달 닫기 함수
function closeNotification() {
  showNotification.value = false
}
</script>

<style scoped>
.header {
  width: 100%;
  height: 60px;
  min-height: 60px;     /* ✅ 높이 보장 */
  max-height: 60px;
  overflow: hidden;      /* ✅ 내부 넘침 방지 */
  white-space: nowrap;   /* ✅ 한 줄 유지 */
  text-overflow: ellipsis; /* ✅ 텍스트 넘칠 때 말줄임 */
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
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
  background: rgb(255, 0, 0);
  color: #fff;
  border-radius: 50%;
  padding: 0 6px;
  font-size: 0.75rem;
  line-height: 1.5;
}

.notice-img {
  width: 28px;
  height: 28px;
  cursor: pointer;
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
