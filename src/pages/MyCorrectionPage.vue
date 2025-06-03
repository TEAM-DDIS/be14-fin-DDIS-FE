<template>
    <h1 class="page-title">내 출근정정 관리</h1>
    <div class="my-leave-page">
        <div class="my-leave-used-card">
            <span class="desc">출근정정 내역</span>
            <MyCorrectionUsedCard/>
        </div>
        <div class="my-leave-regist-card">
            <span class="desc">출근정정 신청 내역</span>
            <MyCorrectionRegistCard/>
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
        margin-bottom: 50px;
        color: #00a8e8;
    }

    .desc {
        display: block;
        margin-left: 20px;
        margin-bottom: 10px;
    }

    .my-leave-page {
        padding: 20px;
    }

    .leave-count-card {
        margin-bottom: 50px;
    }

    .my-leave-used-card {
        margin-bottom: 50px;
    }
</style>
