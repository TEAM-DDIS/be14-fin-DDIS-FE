<template>
    <h1 class="page-title">내 출근 정정 관리</h1>
    <div class="my-correction-page">
        <div class="my-leave-regist-card">
            <span class="desc">출근 정정 신청 내역</span>
            <MyCorrectionRegistCard/>
        </div>
        <div class="my-leave-used-card">
            <span class="desc">출근 정정 내역</span>
            <MyCorrectionUsedCard/>
        </div>
    </div>
</template>

<script setup>
    import MyCorrectionRegistCard from '@/components/correction/MyCorrectionRegistCard.vue';
    import MyCorrectionUsedCard from '@/components/correction/MyCorrectionUsedCard.vue';
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 30px;
        color: #00a8e8;
    }

    .desc {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
    }

    .my-correction-page {
        padding: 20px;
    }

    .my-leave-regist-card {
        margin-bottom: 50px;
    }
</style>
