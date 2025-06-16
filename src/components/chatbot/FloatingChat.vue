<template>
  <button class="floating-button" @click="$emit('toggle')">
    <img src="@/assets/icons/chat_logo.svg" alt="챗봇" class="chatbot-icon" />
  </button>
</template>

<script>
export default {
  name: "FloatingButton"
}
</script>

<style scoped>
.floating-button {
  padding: 10px;
  position: fixed;
  bottom: 30px;
  right: 25px;
  width: 75px;
  height: 75px;
  /* align-content: center; */
  border-radius: 50%;
  background-color: #fff;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 1px 1px 10px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 1000;
}
.floating-button:hover{
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.25);
}
.chatbot-icon{
  width: 60px;
}
</style>
