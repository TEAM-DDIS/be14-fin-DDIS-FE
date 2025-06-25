<template>
  <div class="modal-overlay">
    <div class="modal-container scrollbar">
      <header class="modal-header">
        <h3 class="modal-title">알림함</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </header>
      <section class="modal-body">
        <!-- 알림이 있으면 리스트, 없으면 안내문구 -->
        <ul v-if="notificationsComputed.length" class="notification-list">
          <li
            v-for="item in notificationsComputed"
            :key="item.id"
            class="notification-item"
          >
            <a
              v-if="item.unread"
              href="#"
              class="notification-link"
              @click.prevent="onClick(item)"
            >
              <span class="notification-time">
                {{ formatDate(item.createdAt) }}
              </span>
              [{{ item.type }}] {{ item.content }}
            </a>
            <p v-else class="notification-text">
              <span class="notification-time">
                {{ formatDate(item.createdAt) }}
              </span>
              [{{ item.type }}] {{ item.content }}
            </p>
          </li>
        </ul>
        <p v-else class="no-notice">표시할 알림이 없습니다.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Client } from '@stomp/stompjs'
import { useNotificationStore } from '@/stores/notice'
// Pinia 스토어 인스턴스
const store = useNotificationStore()
// 부모에게 전달할 이벤트
const emit  = defineEmits(['close', 'notificationClick'])

// 스토어의 list를 computed 로 바인딩
const notificationsComputed = computed(() => store.list)

// 날짜 포맷 (YYYY-MM-DD)
function formatDate(dateTime) {
  return dateTime ? dateTime.split('T')[0] : ''
}

onMounted(async () => {
  // 1) 초기 알림 불러오기
  await store.fetch()
  console.log('🔔 초기 로드된 알림:', store.list)

  // 2) WebSocket 구독
  const userStore = useUserStore()
  const token = userStore.accessToken
  const employeeId = localStorage.getItem('employeeId')
  const stomp      = new Client({
    brokerURL:      `ws://https://api.isddishr.site/ws-notice`,
    connectHeaders: { Authorization: `Bearer ${token}` },
    onConnect: () => {
      stomp.subscribe(`/topic/notice/${employeeId}`, ({ body }) => {
        const nt = JSON.parse(body)
        store.add({
          id:        nt.noticeId,
          type:      nt.noticeType,
          content:   nt.noticeContent,
          createdAt: nt.createdAt,
          unread:    !nt.isRead,
          relatedId: nt.relatedId
        })
      })
    },
    reconnectDelay: 5000,
    debug:          (msg) => console.log('[STOMP]', msg)
  })
  stomp.activate()
})

// 알림 클릭 시 읽음 처리 & 이벤트 방출
async function onClick(item) {
  const userStore = useUserStore()
  try {
    const res = await fetch(
      `https://api.isddishr.site/notice/${item.id}/read`,
      {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${userStore.accessToken}` }
      }
    )
    if (res.ok) {
      store.markRead(item.id)
    } else {
      console.error('읽음 처리 실패:', res.status)
    }
  } catch (err) {
    console.error('읽음 처리 중 예외 발생:', err)
  }
  emit('notificationClick', item)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1000;
}
.modal-container {
  width: 480px;
  height: 250px;
  background: var(--bg-box);
  border-radius: 8px;
  margin: 60px 120px auto auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #e5e5e5;
}
.modal-title { 
  font-weight: bold; 
  color: var(--text-main); 
}
.modal-close { 
  background: none; 
  border: none; 
  font-size: 1.25rem; 
  cursor: pointer; 
  color: var(--text-main);
}
.modal-body {
  flex: 1 1 auto;
  padding: 6px 20px;
  overflow-y: auto;
}

.modal-body::-webkit-scrollbar {
  display: none;
}
.modal-body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.notification-list { 
  list-style: none; 
  padding: 0; 
  margin: 0;
}

.notification-item + .notification-item { 
  margin-top: 10px; 
}
.notification-link { 
  color: #00aeef; 
  font-weight: bold; 
  text-decoration: none; 
}
.notification-link:hover { 
  text-decoration: underline; 
}
.notification-text { 
  color: var(--text-main); 
}
.notification-link,
.notification-text {
  display: block;              /* 전체 너비를 차지하도록 변경 */
  white-space: normal;         /* 줄바꿈 허용 */
  word-wrap: break-word;       /* 단어 단위로 줄바꿈 */
  overflow-wrap: break-word;   /* 긴 단어도 줄바꿈 */
  font-size: 16px;
  font-weight: bold;
}

.notification-time { 
  font-weight: bold; 
  font-size: 15px;
  margin-right: 8px; 
}
.no-notice { 
  text-align: center; 
  color: var(--text-sub); 
  margin-top: 40px; 
}
</style>
