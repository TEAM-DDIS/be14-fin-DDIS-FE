import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'ag-grid-community/styles/ag-grid.css'
import ko from 'element-plus/es/locale/lang/ko'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import '@/assets/main.css'

createApp(App)
  .use(createPinia())
  .use(router)
  .use(ElementPlus, { locale: ko })
  .mount('#app')

export default router

