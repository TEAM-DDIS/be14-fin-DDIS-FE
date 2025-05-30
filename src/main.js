import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/assets/main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')

export default router

