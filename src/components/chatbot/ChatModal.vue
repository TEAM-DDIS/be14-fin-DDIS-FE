<template>
  <transition name="fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <transition name="chat-pop">
        <div
          class="chatbot-modal"
          ref="modalRef"
          :style="{ position: 'absolute', right: '24px', bottom: '24px' }"
        >
          <div
            class="header"
            @mousedown="onMouseDown"
            :class="{ dragging: isDragging }"
          >
            <div class="title-row">
              <img src="@/assets/icons/pizza-icon2.svg" alt="DDIS Logo" class="logo" />
              <span class="title">ERPIZZA</span>

              <!-- 인사팀만 보이는 설정 버튼 -->
              <button
                v-if="isHR"
                class="settings-btn"
                @click="openSettings"
                title="설정"
              >
                ⚙️
              </button>
            </div>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <div class="chat-body" ref="chatBody">
            <MessageBubble
              v-for="(msg, index) in messages"
              :key="index"
              v-bind="msg"
            />
          </div>

          <div class="input-area">
            <input
              v-model="input"
              @keydown.enter.prevent="sendMessage()"
              type="text"
              placeholder="메시지를 입력하세요"
            />
            <button
              class="send-btn"
              :class="{ active: input.trim().length > 0 }"
              @click="sendMessage()"
            >
              전송
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
    <UploadModal v-if="showUploadModal" @close="showUploadModal = false" />

</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import MessageBubble from './MessageBubble.vue'
import { useUserStore } from '@/stores/user'
import UploadModal from './UploadModal.vue'
const showUploadModal = ref(false)
const chatBody = ref(null)
const input = ref('')
const messages = ref([])

const sessionId = 'test_session_' + Date.now()
const employeeId = 'test_employee_001'
const token = useUserStore().accessToken
const employeeStore = useUserStore()
const employeeName  = employeeStore.name  // 실제 스토어에 맞게 변경
const initPrompt = `현재 결재 대기 문서는 몇 건인가요? 오늘 모든 일정도 알려주세요. 오늘 일정이 없다면 없다고 해주세요`
const userStore = useUserStore()
// JWT 토큰 디코딩 유틸
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}
const isHR = computed(() => {
  const raw = userStore.accessToken?.startsWith('Bearer ')
    ? userStore.accessToken.slice(7)
    : userStore.accessToken
  if (!raw) return false

  const { auth } = parseJwtPayload(raw)
  if (Array.isArray(auth)) return auth.includes('ROLE_HR')
  if (typeof auth === 'string') return auth.includes('ROLE_HR')
  return false
})

function openSettings() {
    // console.log('설정 열기!') // 뜨면 정상 진입

  showUploadModal.value = true
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}

async function sendMessage(text) {
  const msg = text ?? input.value
  const trimmed = msg.trim()
  if (!trimmed) return

  const now = new Date()
  messages.value.push({
    from: 'user',
    text: trimmed,
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  })

  const payload = {
    question: trimmed,
    session_id: sessionId,
    employee_id: employeeId
  }

  input.value = ''
  scrollToBottom()

  const botMsg = {
    from: 'bot',
    sender: 'ERPIZZA 비서',
    text: '',
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }
  messages.value.push(botMsg)
  scrollToBottom()

  try {
    const response = await fetch('https://api.isddishr.site/query-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,  Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder('utf-8')

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        botMsg.text += chunk
        messages.value = [...messages.value] 
        scrollToBottom()
      }
    }
  } catch (err) {
    console.error(err)
    botMsg.text = '⚠️ 오류가 발생했습니다. 다시 시도해 주세요.'
  }
}

// 드래그 기능
const modalRef = ref(null)
const isDragging = ref(false)
let offsetX = 0
let offsetY = 0

function onMouseDown(e) {
  const modal = modalRef.value
  if (!modal) return

  const rect = modal.getBoundingClientRect()
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top
  isDragging.value = true

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  if (!isDragging.value || !modalRef.value) return

  const modal = modalRef.value
  const maxLeft = window.innerWidth - modal.offsetWidth
  const maxTop = window.innerHeight - modal.offsetHeight

  let newLeft = e.clientX - offsetX
  let newTop = e.clientY - offsetY

  newLeft = Math.max(0, Math.min(newLeft, maxLeft))
  newTop = Math.max(0, Math.min(newTop, maxTop))

  modal.style.left = `${newLeft}px`
  modal.style.top = `${newTop}px`
  modal.style.right = 'auto'
  modal.style.bottom = 'auto'
  modal.style.position = 'absolute'
  modal.style.zIndex = '9999'
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  z-index: 3000;
  padding: 24px;
  box-sizing: border-box;
}

.chatbot-modal {
  width: 450px;
  height: 70vh; /* 고정된 높이 */
  background: var(--bg-box);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: absolute;
  right: 24px;
  bottom: 24px;
}

.header {
  background: var(--primary);
  color: var(--text-on-primary);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  cursor: move;
  transition: opacity 0.2s ease;
}

/* ✅ 드래그 중일 때 */
.header.dragging {
  opacity: 0.6;
}

/* ✅ 호버 시 반투명 */
.header:hover {
  opacity: 0.8;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 40px;
  height: 40px;
}
.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
.close-btn:hover {
  color: var(--text-main);
}

.chat-body {
  flex: 1;
  padding: 20px 16px 20px 20px;
  background: var(--bg-secondary);
  overflow-y: auto;
  box-sizing: border-box;
}
.chat-body::-webkit-scrollbar {
  width: 4px;
}
.chat-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.input-area {
  border-top: 1px solid #eee;
  display: flex;
  padding: 8px;
  color: var(--text-main);
}
.input-area input {
  flex: 1;
  border: 2px solid #ccc;
  padding: 8px;
  font-size: 14px;
  border-radius: 8px;
  background: #fff;
  outline: none;
  /* color: var(--text-main); */
  margin-right: 8px;
  transition: border-color 0.2s ease;
}
.input-area input:focus {
  border-color: var(--primary);
}
.send-btn {
  background: #ccc;
  color: white;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.send-btn.active {
  background: #00A8E8;
}
.send-btn.active:hover {
  background: var(--text-on-primary);
  color: #00A8E8;
  border: 1px solid #00A8E8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.95s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: all 0.3s ease;
  transform-origin: right bottom;
}
.chat-pop-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  transform: scale(1);
  opacity: 0;
}
.chat-pop-enter-to,
.chat-pop-leave-from {
  transform: scale(1);
  opacity: 1;
}

.settings-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: 8px;
  color: white;
}
.settings-btn:hover {
  color: var(--text-main);
}
</style>
