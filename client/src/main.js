import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 完整引入Element UI模块
import { Button, } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 使用Element UI
Vue.use(Button)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
