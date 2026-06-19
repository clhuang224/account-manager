import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Notify, Quasar } from 'quasar'
import quasarLang from 'quasar/lang/zh-TW'
import quasarIconSet from 'quasar/icon-set/svg-material-icons'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Notify },
  lang: quasarLang,
  iconSet: quasarIconSet,
})

app.mount('#app')
