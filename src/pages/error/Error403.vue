<template>
  <div class="error-page">
    <div class="background" />
    <div class="content">
      <h1>403 ERROR</h1>
      <img src="@/assets/icons/profile_img.svg" alt="Mascot" class="mascot" />
      <h2>권한이 없습니다!</h2>
      <p>
        해당 페이지에 대한 접근 권한이 없습니다.<br />
        필요한 경우 관리자에게 권한 요청을 해주세요.
      </p>
      <button class="btn-save" @click="goLogin">ERPIZZA</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Error403Page",
  methods: {
    goLogin() {
      this.$router.push('/org/login');
    },
  },
};
</script>

<style scoped>
.error-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/images/erpizza_background.png') repeat;
  background-size: contain;
  opacity: 0.2;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  background-color: white;
  max-width: 600px;
  height: 480px;
  margin: 0 auto;
  padding: 2rem;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

.mascot {
  width: 120px;
  margin: 1rem auto;
}

h1 {
  font-size: 2.5rem;
  color: #00a8e8;
  margin-bottom: 0.5rem;
}

h2 {
  color: #00a8e8;
  font-size: 1.5rem;
}

p {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}

.btn-save {
  margin-top: 25px;
  font-size: 18px;
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

.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
