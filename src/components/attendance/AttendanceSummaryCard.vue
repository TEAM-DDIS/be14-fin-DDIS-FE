<template>
  <div class="attendance-summary-card">
    <p class="greeting">
      {{ name }} 사원님 안녕하세요.<br />
      <span class="status">{{ status }}입니다.</span>
    </p>

    <div class="time-info">
      <p>출근 : {{ checkIn || '-' }}</p>
      <p>퇴근 : {{ checkOut || '-' }}</p>
    </div>

    <div class="circle-box">
      <div class="circle">
        <svg viewBox="0 0 36 36">
          <path
            class="circle-bg"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="circle-progress"
            :stroke-dasharray="`${percent}, 100`"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div class="percent-text">
          <strong>{{ Math.floor(percent) }}%</strong>
          <span class="label">근무 시간</span>
          <p class="time">{{ formattedWorkTime }}</p>
        </div>
      </div>
    </div>

    <button
      class="check-btn"
      :class="isCheckedIn ? 'btn-gray' : 'btn-blue'"
      @click="handleClick"
    >
      {{ isCheckedIn ? '퇴근' : '출근' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  name: { type: String, default: '김랑랑' }
})

const checkIn = ref('')
const checkOut = ref('')
const isCheckedIn = ref(false)
const workSeconds = ref(0)
let timer = null

const formatTime = () => {
  const now = new Date()
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const formattedWorkTime = computed(() => {
  const h = Math.floor(workSeconds.value / 3600)
  const m = Math.floor((workSeconds.value % 3600) / 60)
  const s = workSeconds.value % 60
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
})

const percent = computed(() => {
  const base = 10 //8 * 3600  // 8시간 = 28800초
  return Math.min((workSeconds.value / base) * 100, 100)
})

const status = computed(() => {
  if (!isCheckedIn.value && !checkOut.value) return '출근 전'
  if (isCheckedIn.value) return '근무 중'
  return '근무 종료'
})

const startTimer = () => {
  timer = setInterval(() => {
    workSeconds.value++
  }, 1000)
}
const stopTimer = () => {
  clearInterval(timer)
  timer = null
}

const handleClick = () => {
  const now = formatTime()
  if (!isCheckedIn.value) {
    checkIn.value = now
    isCheckedIn.value = true
    workSeconds.value = 0
    startTimer()
  } else {
    checkOut.value = now
    isCheckedIn.value = false
    stopTimer()
  }
}

onUnmounted(() => {
  if (timer) stopTimer()
})
</script>

<style scoped>
.attendance-summary-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-family: 'Pretendard', sans-serif;
  height: 480px;
}

.greeting {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.6;
  text-align: left;
}

.status {
  font-weight: 600;
}

.time-info {
  font-size: 12px;
  margin-bottom: 16px;
  color: #666;
  text-align: right;
}

.circle-box {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.circle {
  position: relative;
  width: 230px;
  height: 230px;
}

svg {
  width: 100%;
  height: 100%;
  /* 시작 지점을 12시 방향으로 고정 */
  transform: rotate(0deg);
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3;
}

.circle-progress {
  fill: none;
  stroke: #C2EEFF;
  stroke-width: 3;
  transition: stroke-dasharray 0.5s ease;
}

.percent-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.percent-text strong {
  font-size: 22px;
  font-weight: bold;
  color: #000;
}

.percent-text .label {
  font-size: 12px;
  color: #666;
  margin: 4px 0 2px;
}

.percent-text .time {
  font-size: 18px;
  margin: 0;
}

.check-btn {
  width: 210px;
  height: 40px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  color: white;
  margin: 0 auto;
  margin-top: 70px;
  display: block;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-blue {
  background-color: #00A8E8;
}

.btn-gray {
  background-color: #C8C8C8;
}
</style>
