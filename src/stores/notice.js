// src/stores/notifications.js

import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    list: []
  }),
  getters: {
    // 안 읽은 알림 개수
    unreadCount: state => state.list.filter(n => n.unread).length
  },
  actions: {
    /** 새 알림 추가 (실시간 STOMP 콜백에서 호출) */
    add(notification) {
      this.list.unshift(notification)
    },

    /** 특정 알림 읽음 처리 */
    markRead(id) {
      const item = this.list.find(n => n.id === id)
      if (item) item.unread = false
    },

    /** 서버에서 전체 알림 한 번 불러오기 (초기 로딩) */
    async fetch() {
      try {
        const userStore = useUserStore()
        const token     = userStore.accessToken

        // 전체 알림 목록 조회 (GET /notice)
        const res = await axios.get(
          `http://localhost:5000/notice`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        // 응답 데이터 변환
        this.list = res.data.map(nt => ({
          id:        nt.noticeId,
          type:      nt.noticeType,
          content:   nt.noticeContent,
          createdAt: nt.createdAt,
          unread:    !nt.isRead,
          relatedId: nt.relatedId
        }))
      } catch (e) {
        console.error('알림 리스트 로드 실패:', e)
      }
    }
  }
})
