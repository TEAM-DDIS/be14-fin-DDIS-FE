<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="chatbot-modal">
      <div class="header">
        <div class="title-row">
          <img src="@/assets/icons/pizza-icon2.svg" alt="DDIS Logo" class="logo"/>
          <span class="title">ERPIZZA</span>
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
            @keydown.enter="sendMessage"
            type="text"
            placeholder="메시지를 입력하세요"
          />
          <button
            class="send-btn"
            :class="{ active: input.trim().length > 0 }"
            @click="sendMessage"
          >
            전송
          </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted  } from 'vue'
import MessageBubble from './MessageBubble.vue'

const chatBody = ref(null) 
const input = ref('')
const messages = ref([
  {
    from: 'bot',
    sender: 'ERPIZZA 비서',
    text: '안녕하세요! 무엇을 도와드릴까요?',
    time: '12:36 PM'
  }
])

function scrollToBottom() {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}

function sendMessage() {
  if (!input.value.trim()) return
  const now = new Date()
  messages.value.push({
    from: 'user',
    text: input.value,
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit',  hour12: true })
  })
  input.value = ''
  scrollToBottom() 
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.logo {
  width: 40px;
  height: 40px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-overlay {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  z-index: 1500;
  padding: 24px;
  box-sizing: border-box;
}

.chatbot-modal {
  width:420px;
  max-height: 70vh;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.header {
  background: #00A8E8;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.close-btn:hover {
  background: transparent;
  border: none;
  color: black;
  font-weight: bold;
  cursor: pointer;
}
.chat-body {
  flex: 1;
  padding: 20px 16px 20px 20px;
  background: #f7f7f7;
  overflow-y: auto;
  box-sizing: border-box;
  scrollbar-gutter: stable;
}

.input-area {
  border-top: 1px solid #eee;
  display: flex;
  padding: 8px;
  background: #fff;
}

.input-area input {
  flex: 1;
  border: 1px solid #ccc;
  padding: 8px;
  font-size: 14px;
  border-radius: 8px;
  background: #fff;
  outline: none;
  margin-right: 8px;
  transition: border-color 0.2s ease;

}
.input-area input:focus {
  border-color: #000;
  background-color: #fff;
}

.send-btn {
  background: #ccc;           /* 기본 회색 */
  color: white;               /* 기본 흰 글자 */
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.send-btn.active {
  background: #00a3e0;
}
.send-btn.active:hover {
  background: white;
  color: #00a3e0;
  border: 1px solid #00a3e0;
}
/* 스크롤바 커스터마이징 */
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

</style>
