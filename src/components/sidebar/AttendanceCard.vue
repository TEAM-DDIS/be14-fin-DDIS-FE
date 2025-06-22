<template>
  <div class="attendance-card">
    <div class="attendance-header">
      <img src="@/assets/icons/attendance.svg" alt="attendance" class="icon" />
      <span class="title">ATTENDANCE</span>
    </div>

    <div class="attendance-date">{{ formattedDate }}</div>
    <div class="attendance-time">{{ formattedTime }}</div>

    <button
      class="attendance-status"
      @click="handleCheck"
      :disabled="isDone"
    >
      {{ buttonText }}
    </button>

    <div v-if="checkInTime" class="checked-time">
      출근: {{ checkInTime }}
    </div>
    <div v-if="checkOutTime" class="checked-time">
      퇴근: {{ checkOutTime }}
    </div>
    <Teleport to="body">
      <BaseToast ref="toastRef" />
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useAttendanceStore } from '@/stores/attendance'
  import BaseToast from '@/components/toast/BaseToast.vue'

  const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

  const userStore = useUserStore()
  const attendanceStore = useAttendanceStore()

  const formattedDate = ref('')
  const formattedTime = ref('')
  const workStatusName = ref('')

  const checkInTime = computed(() => attendanceStore.checkIn)
  const checkOutTime = computed(() => attendanceStore.checkOut)
  const isDone = computed(() => !!checkInTime.value && !!checkOutTime.value)
  const isCheckedIn = computed(() => attendanceStore.isCheckedIn)

  const buttonText = computed(() => {
    if (!checkInTime.value) return '출근'
    if (!checkOutTime.value) return '퇴근'
    return '완료됨'
  })

  const weekNames = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT']
  function updateTime() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const date = String(now.getDate()).padStart(2, '0')
    const day = weekNames[now.getDay()]
    formattedDate.value = `${year}-${month}-${date} ${day}`

    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    formattedTime.value = `${hours} : ${minutes} : ${seconds}`
  }

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  async function handleCheck() {
    const token = userStore.accessToken
    if (!token) return showToast('로그인 정보가 없습니다.')

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()

    try {
      // 출근
      if (!checkInTime.value) {
        if (
          (workStatusName.value === '오전반차' && hours < 12) ||
          (workStatusName.value !== '오전반차' && (hours > 11 || (hours === 11 && minutes >= 59)))
        ) {
          showToast('출근 가능 시간이 아닙니다.')
          return
        }

        const res = await fetch('https://api.isddishr.site/attendance/check-in', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) throw new Error(await res.text())

        attendanceStore.setCheckIn(formatTime(now))
      }

      // 퇴근
      else if (!checkOutTime.value) {
        if (
          (workStatusName.value === '오후반차' && hours < 12) ||
          (workStatusName.value !== '오후반차' && hours < 18)
        ) {
          showToast('퇴근 가능 시간이 아닙니다.')
          return
        }

        const res = await fetch('https://api.isddishr.site/attendance/check-out', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) throw new Error(await res.text())

        attendanceStore.setCheckOut(formatTime(now))
      }

    } catch (err) {
      console.error('출퇴근 등록 실패:', err.message)
      showToast('출퇴근 등록 중 오류가 발생했습니다.')
    }
  }

  let intervalId
  onMounted(async () => {
    updateTime()
    intervalId = setInterval(updateTime, 1000)

    const token = userStore.accessToken
    if (!token) return

    const res = await fetch('https://api.isddishr.site/attendance/status/me', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await res.json()
    workStatusName.value = data.workStatusName

    if (data.checkInTime) attendanceStore.setCheckIn(data.checkInTime.split('.')[0])
    if (data.checkOutTime) attendanceStore.setCheckOut(data.checkOutTime.split('.')[0])
  })
  onBeforeUnmount(() => clearInterval(intervalId))
</script>


<style scoped>
    .attendance-card {
        width: 120px;
        padding: 16px;
        background-color: #00A8E8;
        border-radius: 16px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-top: 50px;
        margin-bottom: 50px;
    }

    .attendance-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: bold;
        font-size: 13px;
        margin-bottom: 10px;
    }

    .icon {
        width: 20px;
        height: 20px;
    }

    .attendance-date {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .attendance-time {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .attendance-status {
        background-color: white;
        color: black;
        border-radius: 20px;
        padding: 6px 40px;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        border: none;
    }

    .attendance-status:hover:not(:disabled) {
        background-color: #e7e7e7;
    }

    .attendance-status:disabled {
        background-color: #ccc;
        color: #666;
        cursor: not-allowed;
    }

    .checked-time {
        font-size: 12px;
        margin-top: 6px;
        color: #ffffff;
    }
</style>
