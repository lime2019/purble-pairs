import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 完整引入Element UI模块
import { Container,Header,Main,Aside,Footer,Button,Row,Col,Dropdown,DropdownMenu,DropdownItem,Dialog,Form,FormItem,Input,Table,TableColumn,Badge,Popconfirm,Select,Option ,Message,Loading  } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 使用Element UI
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Footer)
Vue.use(Row)
Vue.use(Col)
Vue.use(Button)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Badge)
Vue.use(Popconfirm)
Vue.use(Select)
Vue.use(Option)
Vue.use(Loading.directive)

Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
