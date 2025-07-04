// src/stores/user.js
import { defineStore } from 'pinia'
import router from '@/router/index'

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    allEmployees: []
  }),
  actions: {
    setAccessToken(token) {
      this.accessToken = token
      localStorage.setItem('token', token)
    },
    setUser(userData) {
      this.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
    },
    logout() {
        localStorage.removeItem('draft-auto-cache');
        localStorage.removeItem('pinia-user')  // ← persist 키!
        localStorage.removeItem('token')       // 토큰
        localStorage.removeItem('user')        // 예비

        router.replace({ name: 'Login' })
    },
    async fetchAllEmployees() {
      if (!this.accessToken) return
      try {
        const res = await fetch('https://api.isddishr.site/employees/list', {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        })
        const data = await res.json()
        this.allEmployees = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('⚠️ 사원 목록 불러오기 실패:', error)
        this.allEmployees = []
      }
    }
  },
// src/stores/user.js
getters: {
  birthdayUsersNext7Days: (state) => {
    const today = new Date()
    const datesToInclude = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      const mmdd = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      datesToInclude.push(mmdd)
    }

    const getMonthDay = (dateStr) => {
      const date = new Date(dateStr)
      return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    return state.allEmployees.filter(emp => {
      const mmdd = getMonthDay(emp.employeeBirth)
      return datesToInclude.includes(mmdd)
    })
  },
  profileUrl: (state) => {
    const emp = state.allEmployees.find(
      e => String(e.employeeId) === String(state.user?.employeeId)
    )
    const path = emp?.employeePhotoUrl
      return path
        ? `https://ddisbucket-fin.s3.ap-northeast-2.amazonaws.com/${path}`
        : '/images/erpizza_profile.svg'
    }
}

})
