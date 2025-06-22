<template>
  <div class="login-container">
    <!-- ───── LEFT ───── -->
    <div class="login-left">
      <h1>비밀번호 변경</h1>
      <p class="subtitle">인증 방식을 선택하고 새 비밀번호를 등록하세요</p>

      <!-- 인증 방식 -->
      <div class="auth-switch">
        <label><input type="radio" value="email" v-model="authMethod" /> 이메일 인증</label>
        <label><input type="radio" value="otp"   v-model="authMethod" /> OTP 인증</label>
      </div>

      <!-- ───────── EMAIL ───────── -->
      <template v-if="authMethod === 'email'">
        <!-- ① 코드 요청 -->
        <form v-if="step === 1" @submit.prevent="requestCode" class="login-form">
          <div class="form-group">
            <label for="emp">사번</label>
            <input id="emp" v-model="employeeId" type="number" required />
          </div>
          <div class="form-group">
            <label for="mail">이메일</label>
            <input id="mail" v-model="email" type="email" required />
          </div>
          <button class="btn-login">인증 메일 보내기</button>
        </form>

        <!-- ② 코드 입력 -->
        <form v-else-if="step === 2" @submit.prevent="verifyCode" class="login-form">
          <div class="form-group">
            <label for="code">인증번호</label>
            <input id="code" v-model="code" maxlength="6" required />
          </div>
          <button class="btn-login">코드 확인</button>
        </form>

        <!-- ③ 새 PW -->
        <form v-else @submit.prevent="resetPassword" class="login-form">
          <PasswordFields v-model:newPwd="newPwd" v-model:confirmPwd="confirmPwd" />
          <button class="btn-login">비밀번호 변경</button>
        </form>
      </template>

      <!-- ───────── OTP ───────── -->
      <template v-else>
        <!-- step 1 : OTP 검증 (QR 포함) -->
        <form v-if="step === 1" @submit.prevent="verifyOtp" class="login-form">
          <div class="form-group">
            <label for="emp2">사번</label>
            <input id="emp2" v-model="employeeId" type="number" required />
          </div>

          <div class="form-group">
            <label for="otp">OTP 코드</label>
            <input id="otp" v-model="otp" maxlength="6" placeholder="6자리" required />
          </div>

          <button class="btn-login">OTP 확인</button>

          <!-- QR 등록 버튼 -->
          <div v-if="!qrSrc" class="register-box">
            <p class="hint">OTP 앱이 없거나 등록하지 않으셨나요?</p>
            <button type="button" class="btn-secondary" @click="registerOtp">OTP 등록</button>
          </div>

          <!-- QR 이미지 미리보기 -->
          <div v-if="qrSrc" class="qr-wrapper">
            <img :src="qrSrc" alt="OTP QR" class="qr-img" />
          </div>
        </form>

        <!-- step 3 : 새 PW -->
        <form v-else-if="step === 3" @submit.prevent="resetPassword" class="login-form">
          <PasswordFields v-model:newPwd="newPwd" v-model:confirmPwd="confirmPwd" />
          <button class="btn-login">비밀번호 변경</button>
        </form>
      </template>

      <!-- 메시지 -->
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      <p v-if="infoMessage"  class="info-text">{{ infoMessage }}</p>
    </div>

    <!-- ───── RIGHT ───── -->
    <div class="login-right">
      <div class="branding">
        <img src="@/assets/icons/pizza-icon2.svg" alt="logo" />
        <h2>ERPIZZA</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import PasswordFields from '@/components/login/PasswordFields.vue'

/* ── 상태 ── */
const authMethod   = ref<'email' | 'otp'>('email')
const step         = ref(1)
const employeeId   = ref('')
const email        = ref('')
const tokenId      = ref<string | null>(null)
const code         = ref('')
const otp          = ref('')
const qrRequested  = ref(false)
const newPwd       = ref('')
const confirmPwd   = ref('')
const errorMessage = ref('')
const infoMessage  = ref('')
const otpRegistered = ref(false)

const router = useRouter()
const BASE = '/api/password-reset'

/* 모드 바뀔 때 초기화 */
watch(authMethod, () => {
  step.value = 1
  qrRequested.value = false
  clearMsg()
  code.value = otp.value = ''
})

/* 사번 입력될 때마다 OTP 등록 여부 조회 */
watch(employeeId, async id => {
  if (!id || authMethod.value !== 'otp') return
  try {
    const r = await fetch(`https://api.isddishr.site${BASE}/mfa/exists?empId=${id}`)
    otpRegistered.value = r.ok
  } catch { /* 무시 */ }
})

/* ========== 이메일 ========== */
async function requestCode() {
  clearMsg()
  try {
    const res = await fetch(`https://api.isddishr.site${BASE}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: Number(employeeId.value), email: email.value })
    })
    if (!res.ok) throw new Error('메일 전송 실패')
    tokenId.value     = (await res.json()).tokenId
    infoMessage.value = '인증 메일이 발송되었습니다. 메일함을 확인하세요!'
    step.value = 2
  } catch (e) { handleErr(e) }
}

async function verifyCode() {
  clearMsg()
  try {
    const res = await fetch(`https://api.isddishr.site${BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId: tokenId.value, code: code.value })
    })
    if (res.status !== 204) throw new Error('인증번호가 올바르지 않습니다')
    infoMessage.value = '인증 성공! 새 비밀번호를 입력하세요.'
    step.value = 3
  } catch (e) { handleErr(e) }
}

/* ========== OTP ========== */
async function registerOtp() {
  clearMsg()
  try {
    const res = await fetch(
      `https://api.isddishr.site${BASE}/mfa/qr?empId=${employeeId.value}`
    )
    if (!res.ok) throw new Error('OTP 메일 발송 실패')
    qrRequested.value = true
    infoMessage.value = 'OTP 설정 메일을 보냈습니다. 메일함에서 QR을 스캔한 뒤 코드를 입력해 주세요.'
  } catch (e) { handleErr(e) }
}

async function verifyOtp() {
  clearMsg()
  try {
    const res = await fetch(`https://api.isddishr.site${BASE}/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: Number(employeeId.value),
        code: Number(otp.value),
      })
    })
    if (res.status !== 204) throw new Error('OTP가 올바르지 않습니다')
    infoMessage.value = 'OTP 인증 완료! 새 비밀번호를 입력하세요.'
    step.value = 3                  // ← 이메일과 동일하게 3단계
    console.log('step→', step.value)
  } catch (e) { handleErr(e) }
}

/* ========== 비밀번호 변경 ========== */
async function resetPassword() {
  clearMsg()
  if (newPwd.value !== confirmPwd.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다'
    return
  }
  try {
    const res = await fetch(`https://api.isddishr.site${BASE}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'
       },
      body: JSON.stringify({
        employeeId: Number(employeeId.value),
        newPassword: newPwd.value,
      })
    })
    if (res.status !== 204) throw new Error('변경 실패')
    alert('비밀번호가 변경되었습니다! 새 비밀번호로 로그인하세요.')
    router.push('/login')
  } catch (e) { handleErr(e) }
}

/* ── 유틸 ── */
function clearMsg() { errorMessage.value = infoMessage.value = '' }
function handleErr(err: unknown) {
  console.error(err)
  errorMessage.value = (err as Error).message || '예기치 못한 오류가 발생했습니다'
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

.info-text  { color:#2b7; margin-top:1rem; font-size:14px; }
.error-text { color:#e00; margin-top:1rem; font-size:14px; }

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
  width: 100%; height: 90%;
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
