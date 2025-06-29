<template>
  <div :class="['message', from === 'user' ? 'from-user' : 'from-bot']">
    <img
      v-if="from === 'bot'"
      class="avatar"
      :src="avatarSrc"
      alt="avatar"
    />
    <div class="bubble" :class="{ 'user-bubble': from === 'user' }">
      <div v-if="sender" class="sender">{{ sender }}</div>
      <!-- <div class="text" >{{ text }}</div> -->
      <div class="text" v-html="formattedText"></div>
      <div class="time">{{ time }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed  } from 'vue'
import defaultAvatar from '@/assets/icons/profile_img.svg'

const props = defineProps({
  from: { type: String, default: 'bot' },
  sender: String,
  text: String,
  time: new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}),
  avatar: String
})

const formattedText = computed(() => {
  return props.text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*\*/g, '')
    .replace(/\n/g, '<br/>')
})

const avatarSrc = props.avatar || defaultAvatar
</script>


<style scoped>
.message {
  display: flex;
  margin-bottom: 12px;
}
.from-bot {
  align-items: flex-start;
}
.from-user {
  justify-content: flex-end;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

.bubble {
  background-color: var(--bg-box);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  max-width: 220px;
  position: relative;
}
.user-bubble {
  background: #00A8E8;
  color: white;
  border-bottom-right-radius: 0;
}
.sender {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}
.text {
  font-size: 14px;
    white-space: normal;
  line-height: 1.6;
  
}
.time {
  font-size: 11px;
  margin-top: 6px;
  text-align: right;
  opacity: 0.7;
}
</style>
