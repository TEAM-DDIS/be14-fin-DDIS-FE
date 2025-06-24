<template>
  <button
    class="floating-button"
    ref="button"
    @mousedown="startDrag"
    @click="handleClick"
    :style="{
      left: pos.x + 'px',
      top: pos.y + 'px',
      opacity: isHover || isDragging ? 0.6 : 0.9
    }"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <img src="@/assets/icons/chat_logo.svg" alt="챗봇" class="chatbot-icon" />
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['toggle'])

const button = ref(null)
const pos = ref({ x: window.innerWidth - 100, y: window.innerHeight - 120 })
const isDragging = ref(false)
const isHover = ref(false)

let offset = { x: 0, y: 0 }
let dragStarted = false
let clickPrevented = false 

function startDrag(e) {
  e.preventDefault()
  e.stopPropagation()

  const rect = button.value.getBoundingClientRect()
  offset.x = e.clientX - rect.left
  offset.y = e.clientY - rect.top
  dragStarted = false
  clickPrevented = false

  window.addEventListener('mousemove', onDrag, true)
  window.addEventListener('mouseup', stopDrag, true)
}

function onDrag(e) {
  const dx = Math.abs(e.clientX - (pos.value.x + offset.x))
  const dy = Math.abs(e.clientY - (pos.value.y + offset.y))

  if (!dragStarted && (dx > 3 || dy > 3)) {
    isDragging.value = true
    dragStarted = true
    clickPrevented = true 
  }

  if (!isDragging.value) return

  const width = button.value.offsetWidth
  const height = button.value.offsetHeight
  let x = e.clientX - offset.x
  let y = e.clientY - offset.y

  const maxX = window.innerWidth - width
  const maxY = window.innerHeight - height

  pos.value.x = Math.max(0, Math.min(x, maxX))
  pos.value.y = Math.max(0, Math.min(y, maxY))
}

function stopDrag() {
  isDragging.value = false
  dragStarted = false

  window.removeEventListener('mousemove', onDrag, true)
  window.removeEventListener('mouseup', stopDrag, true)
}

function handleClick() {
  if (clickPrevented) {
    clickPrevented = false
    return
  }

  emit('toggle')
}

function handleResize() {
  const width = button.value.offsetWidth
  const height = button.value.offsetHeight
  pos.value.x = window.innerWidth - width - 20; // 20은 오른쪽 여백 조정 가능
  pos.value.y = Math.min(pos.value.y, window.innerHeight - height - 20);
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>


<style scoped>
.floating-button {
  position: fixed;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: grab;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;
}
.floating-button:active {
  cursor: grabbing;
}
.chatbot-icon {
  padding: 0px;
  width: 65px;
}
</style>
