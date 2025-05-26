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

    const formattedDate = ref('')
    const formattedTime = ref('')

    const checkInTime = ref(null)
    const checkOutTime = ref(null)
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

    function handleCheck() {
    if (!checkInTime.value) {
        checkInTime.value = formattedTime.value
        isCheckedIn.value = true
    } else if (!checkOutTime.value) {
        checkOutTime.value = formattedTime.value
    }
    }

    let intervalId
    onMounted(() => {
    updateTime()
    intervalId = setInterval(updateTime, 1000)
    })

    onBeforeUnmount(() => {
    clearInterval(intervalId)
    })
</script>

<style scoped>
    .attendance-card {
        width: 120px;
        padding: 16px;
        background-color: #3fb1f0;
        border-radius: 16px;
        color: white;
        text-align: center;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-top: 30px;
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
