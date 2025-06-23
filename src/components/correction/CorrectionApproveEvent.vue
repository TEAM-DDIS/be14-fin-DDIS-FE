<template>
    <div class="confirm-approve-modal">
        <p class="message">정말로 승인하시겠습니까?</p>
        <div class="btn-wrap">
            <button class="cancle-btn" @click="closeModal">취소</button>
            <button class="confirm-btn" @click="confirm">확인</button>
        </div>
    </div>
</template>

<script setup>
    const emit = defineEmits(['confirm', 'cancel'])

    function confirm() {
        emit('confirm')
    }

    function closeModal() {
        emit('cancel')
    }
</script>

<style scoped>
    .message {
        font-size: 16px;
        margin-top: 60px;
        margin-bottom: 60px;
        color: #444;
        text-align: center;
    }

    .btn-wrap {
        display: flex;
        justify-content: center;
        gap: 12px;
    }

    .confirm-btn {
        width: 96px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
        background-color: #00a8e8;
        color: white;
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
        box-shadow:
        inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }

    .cancle-btn {
        width: 96px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
        background-color: #D3D3D3;
        color: #000;
        border: none;
        border-radius: 10px;
        padding: 10px 30px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }
    .cancle-btn:hover {
        background-color: #000;
        color: #fff;
    }
</style>
