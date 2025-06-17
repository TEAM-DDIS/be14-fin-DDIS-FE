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
  </div>
</template>

<script setup>
    import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
    import { useUserStore } from '@/stores/user'

    const formattedDate = ref('')
    const formattedTime = ref('')

    const checkInTime = ref(null)
    const checkOutTime = ref(null)
    const workStatusName = ref('')
    const isCheckedIn = ref(false)
    const isDone = computed(() => !!checkInTime.value && !!checkOutTime.value)

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

async function handleCheck() {
  const userStore = useUserStore()
  const token = userStore.accessToken

  if (!token) {
    alert('로그인 정보가 없습니다.')
    return
  }

  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  try {
    if (!checkInTime.value) {
      // 출근 등록
      if (
    (workStatusName.value === '오전반차' && hours < 12) ||  // ✅ 오전반차는 12시 이후만
    (workStatusName.value !== '오전반차' && (hours > 11 || (hours === 11 && minutes >= 59)))
  ) {
    alert('출근 가능 시간이 아닙니다.')
    return
  }

      const res = await fetch('http://localhost:8000/attendance/check-in', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) throw new Error(await res.text())

      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      checkInTime.value = `${h} : ${m} : ${s}`
      isCheckedIn.value = true

    } else if (!checkOutTime.value) {
      // ✅ 퇴근 제한: 18시 이전이면 막기
      if (
    (workStatusName.value === '오후반차' && hours < 12) ||  // ✅ 오후반차는 12시 이후
    (workStatusName.value !== '오후반차' && hours < 18)     // ✅ 나머지는 18시 이후
  ) {
    alert('퇴근 가능 시간이 아닙니다.')
    return
  }

      const res = await fetch('http://localhost:8000/attendance/check-out', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) throw new Error(await res.text())

      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      checkOutTime.value = `${h} : ${m} : ${s}`
    }

  } catch (err) {
    alert('출퇴근 등록 실패: ' + err.message)
    console.error(err)
  }
}

    let intervalId
    onMounted(async () => {
      updateTime()
      intervalId = setInterval(updateTime, 1000)

      const userStore = useUserStore()
      const token = userStore.accessToken
      
      if (!token) return

      const res = await fetch('http://localhost:8000/attendance/status/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
    })
  const data = await res.json()

  checkInTime.value = data.checkInTime ? data.checkInTime.split('.')[0] : null
  checkOutTime.value = data.checkOutTime ? data.checkOutTime.split('.')[0] : null
  workStatusName.value = data.workStatusName

  // ✅ 출근 기록만 있고 퇴근 기록이 없을 경우
  if (checkInTime.value && !checkOutTime.value) {
    const now = new Date()
    const nineAM = new Date()
    nineAM.setHours(9, 0, 0, 0)

    // 🔧추가됨: 9시 전이라면 출근 상태만 표시 (타이머 없음)
    if (now >= nineAM) {
      isCheckedIn.value = true
      // 여기에서 타이머 관련 로직을 표시하려면 startTimer() 호출 위치
    } else {
      isCheckedIn.value = false
      // 출근했지만 9시 전이므로 아직 근무 시작 안 된 상태
    }
  }
})
    onBeforeUnmount(() => {
    clearInterval(intervalId)
    })
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
