<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container scrollbar">
      <header class="modal-header">
        <h3 class="modal-title">알림함</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </header>
      <section class="modal-body">
        <ul class="notification-list">
          <li
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
          >
            <!-- 미확인(unread) 알림: 파란색 링크 -->
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
            <!-- 이미 확인한 알림: 일반 텍스트 -->
            <p v-else class="notification-text">
                <span class="notification-time">
                  {{ formatDate(item.createdAt) }}    
                  </span>
              [{{ item.type }}] {{ item.content }}
            </p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
// import { defineProps, defineEmits, onMounted } from 'vue'
import { onMounted, computed  } from 'vue'
// import SockJS from 'sockjs-client'
// import Stomp from 'stompjs'
import { Client } from '@stomp/stompjs'

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
  }
})
const emit = defineEmits(['close', 'notificationClick'])

// 날짜 문자열에서 YYYY-MM-DD 부분만 추출
function formatDate(dateTime) {
  return dateTime ? dateTime.split('T')[0] : ''
}

onMounted(() => {
  const token = localStorage.getItem('token')
  const employeeId = localStorage.getItem('employeeId')

  const stompClient = new Client({
    brokerURL: `ws://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/ws-notice`,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    onConnect: () => {
      stompClient.subscribe(`/topic/notice/${employeeId}`, ({ body }) => {
        const notice = JSON.parse(body)
        const newItem = {
          id: notice.noticeId,
          type: notice.noticeType,
          content: notice.noticeContent,
          createdAt: item.createdAt,
          unread: !notice.isRead,
          relatedId: notice.relatedId
        }
        localNotifications.value.unshift(newItem)
        emit('newNotification', newItem)
      })
    },
    debug: (str) => console.log('[STOMP]', str),
    reconnectDelay: 5000
  })

  stompClient.activate()
})

async function onClick(item) {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/notice/${item.id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      console.error('읽음 처리 실패:', res.status)
    } else {
      // UI 즉시 반영
      item.unread = false
    }
  } catch (err) {
    console.error('읽음 처리 중 예외 발생:', err)
  }
  // 부모 컴포넌트로도 클릭 이벤트 전달 (내비게이션 등)
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
  width: 550px;
  height: 250px;
  background: #fff;
  border-radius: 8px;
  margin-top: 60px;
  margin-bottom: auto;
  margin-right: 120px;
  overflow: hidden;
  overflow-y: auto;
  overflow-x: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-container.scrollbar {
    scrollbar-width: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-title {
  margin: 0;
  padding: 6px 12px;
  font-weight: bold;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.modal-body {
  display: flex;
  align-items: center;
  max-height: 300px;
  overflow-y: auto;
  margin-left: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification-item + .notification-item {
  margin-top: 10px;
}

.notification-link {
  color: #00aeef;
  font-size: 15px;
  font-weight: bold;
  text-decoration: none;
  cursor: pointer;
}

.notification-link:hover {
  text-decoration: underline;
}

.notification-text {
  color: #000000;
  font-size: 15px;
  /* font-weight: 500; */
  margin: 0;
}

.notification-time {
    color: #333;
    font-weight: bold;
    font-size: 14px;
    text-align: end;    
}

/* 간단한 뱃지 스타일 예시 */
.badge {
  background: #e00;
  color: #fff;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
  margin-left: 8px;
}
</style>