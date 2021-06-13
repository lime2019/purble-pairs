import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Game from '../views/Game.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta : {
      title : "Lime翻牌游戏"
    }
  },{
    path: '/game',
    name: 'Game',
    component: Game,
    meta : {
      title : "Lime翻牌游戏：对战中..."
    }
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // 路由发生变化修改页面title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
