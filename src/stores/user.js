// src/stores/user.js
import { defineStore } from 'pinia'

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
      this.accessToken = ''
      this.user = null
      this.allEmployees = []
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    async fetchAllEmployees() {
      if (!this.accessToken) return
      try {
        const res = await fetch('http://localhost:8000/employees/list', {
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
  }
}

})
