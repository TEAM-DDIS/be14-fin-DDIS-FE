<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <!-- 좌측: 로그인 폼 -->
    <div class="login-left">
      <h1>LOGIN</h1>
      <p class="subtitle">ID와 비밀번호를 입력해주세요</p>

      <form @submit.prevent="onLogin" class="login-form">
        <div class="form-group">
          <label for="userId">ID</label>
          <input
            id="userId"
            v-model="userId"
            type="text"
            placeholder="ID를 입력해주세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </div>

        <button type="submit" class="btn-login">LOGIN</button>
      </form>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="forgot">
        비밀번호를 잊으셨나요?
        <RouterLink to="/org/findpassword">비밀번호 찾기</RouterLink>
      </div>
    </div>

    <!-- 우측: 브랜딩 & 배경 -->
    <div class="login-right">
      <div class="branding">
        <img src="@/assets/icons/pizza-icon2.svg" alt="DDIS Logo" />
        <h2>ERPIZZA</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'   // Pinia

const router = useRouter()
const userStore = useUserStore()

const userId = ref('')
const password = ref('')
const errorMessage = ref('')

async function onLogin() {
  errorMessage.value = ''
  try {
    // 1) 로그인 요청
    const res = await fetch('https://api.isddishr.site/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: userId.value, employeePwd: password.value })
    })

    // 2) 토큰 추출
    const authHeader = res.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null

    if (!res.ok || !token) {
      throw new Error('아이디 또는 비밀번호를 확인하세요.')
    }


    // 3) 토큰 저장
    userStore.setAccessToken(token)

    // 4) 내 정보 요청
    const userRes = await fetch('https://api.isddishr.site/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!userRes.ok) {
      throw new Error('유저 정보 요청에 실패했습니다.')
    }
    const userData = await userRes.json()
    userStore.setUser(userData)

    // 5) 전 사원 목록 요청
    await userStore.fetchAllEmployees() 

    // 6) 성공 시 대시보드로 이동
    router.push('/')
  } catch (err) {
    console.error(err)
    errorMessage.value = err.message
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  overflow: hidden;
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  margin: 0; padding: 0;
  background-color: #f7f7f7;
}

/* ── 좌측 ── */
.login-left {
  flex: 1;
  background-color: #f7f7f7;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 내부 블록 너비 제한 */
.login-left > * {
  width: 100%;
  max-width: 360px;
}

/* 텍스트 & 폼 왼쪽 정렬 */
.login-left h1,
.login-left .subtitle,
.login-form,
.forgot {
  text-align: left;
  font-size: 18px;

}
.forgot a:hover{
  color: #9c9c9c;
  text-decoration: underline;
}
.login-left h1 {
  /* margin-top: -10px; */
  font-size: 40px;
  color: #00aeef;
}

.subtitle {
  margin-top: -15px;

  /* margin-top: 0.5rem; */
  color: #868e96;
}

.login-form {
  margin-top: 2rem;
}

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
  box-shadow: 0 0px 4px rgba(0, 0, 0, 0.05);}

.btn-login {
  width: 100%;
  height: 48px;
  padding: 0.75rem;
  margin-top: 2rem;
  border: none;
  border-radius: 10px;
  background-color: #00aeef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #fff;
  font-size: 18px;
  border: 1px solid transparent;

  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-login:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.2);
}

.error-text {
  color: #e00;
  font-size: 14px;
  margin-top: 1rem;
}

.forgot {
  margin-top: 1rem;
  color: #868e96;
}
.forgot a {
  color: #00aeef;
  font-weight: bold;
  text-decoration: none;
}

/* ── 우측 ── */
.login-right {
  flex: 1;
  position: relative;
  background-color: #00aeef;
  overflow: hidden;
  border-bottom-left-radius: 80px;
  margin-bottom: 50px;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.8);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.2);

}

.login-right::before {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: url("@/assets/icons/loginbackground.svg") no-repeat center/cover;
  opacity: 1;
}

/* 로고 + 텍스트 가로 중앙 배치 */
.branding {
  position: absolute;
  top: 55%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 25px;
  z-index: 1;
  color: #fff;
}

.branding img {
  width: 100px;
  height: 100px;
  margin: 0;
}

.branding h2 {
  margin: 0;
  font-size: 4rem;
  font-weight: bold;
  margin-bottom:10px;
}
</style>
