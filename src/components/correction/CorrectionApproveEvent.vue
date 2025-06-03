<template>
    <div class="confirm-approve-modal">
        <p class="message">정말로 승인하시겠습니까?</p>
        <div class="btn-wrap">
            <button class="confirm-btn" @click="confirm">확인</button>
        </div>
    </div>
</template>

<script setup>
    const emit = defineEmits(['confirm', 'cancel'])

    function confirm() {
        emit('confirm')
    }
</script>

<style scoped>
    .confirm-approve-modal {
        padding: 10px;
    }

    .message {
        font-size: 16px;
        margin-bottom: 24px;
        color: #444;
        text-align: center;
    }

    .btn-wrap {
        display: flex;
        justify-content: flex-end;
    }

    .confirm-btn {
        background-color: #00a8e8;
        color: white;
        font-weight: bold;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }

    .confirm-btn:hover {
        background-color: white;
        color: #00a8e8;
        border-color: #00a8e8;
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }
</style>
