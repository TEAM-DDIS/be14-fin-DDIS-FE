<!-- PasswordFields.vue -->
<template>
  <div>
    <div class="form-group">
      <label for="pwd">새 비밀번호</label>
      <input
        id="pwd"
        :value="newPwd"
        @input="$emit('update:newPwd', $event.target.value)"
        type="password"
        minlength="8"
        required
      />
    </div>

    <div class="form-group">
      <label for="pwd2">새 비밀번호 확인</label>
      <input
        id="pwd2"
        :value="confirmPwd"
        @input="$emit('update:confirmPwd', $event.target.value)"
        type="password"
        minlength="8"
        required
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  newPwd: string
  confirmPwd: string
}>()

defineEmits<{
  'update:newPwd': [string]
  'update:confirmPwd': [string]
}>()
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group input:focus{
  border: 2px solid black;
}

.form-group + .form-group {
  margin-top: 1.5rem;
}

.form-group label {
  margin-left: 5px;
  margin-bottom: 0.3rem;
  font-weight: 500;
  color: #515151;
}

.form-group input {
  height: 20px;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid transparent;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.05);
}
</style>