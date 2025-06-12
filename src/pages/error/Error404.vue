<template>
  <div class="error-page">
    <div class="background" />
    <div class="content">
      <h1>404 ERROR</h1>
      <img src="@/assets/icons/profile_img.svg" alt="Mascot" class="mascot" />
      <h2>페이지를 찾을 수 없습니다!</h2>
      <p>
        페이지가 존재하지 않거나, 사용할 수 없는 페이지입니다. <br />
        입력하신 주소가 가능한 정확한지 다시 한 번 확인해주세요.
      </p>
      <button class="btn-save" @click="goLogin">ERPPIZZA</button>
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
  background: url('/images/erppizza_background.png') repeat;
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
