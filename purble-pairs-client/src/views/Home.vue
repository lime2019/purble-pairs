<template>
  <el-row class="home">
    <el-col class="col home-main" :span="16">
      <el-button class="looking-btn" type="primary" :icon="btnIcon" @click="lookBtn">{{btnText}}</el-button>
      <h2>积分：{{userPoints}}</h2>
    </el-col>
    <el-col class="scoreboard" :span="8">
      <header class="scoreboard-header">
        <span>积分排行榜</span>
        <el-button class="refresh" :icon="refreshBtnTcon" circle @click="refreshScoreboard" ></el-button>
      </header>
      <el-table :data="userList">
        <el-table-column label="用户名" prop="userName"></el-table-column>
        <el-table-column label="积分" prop="userPoints"></el-table-column>
        <el-table-column label="当前状态" prop="userOnlineStatus" :formatter="userOnlineStatusFormatter"></el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>

export default {
  data(){
    return{
      // 寻找对局按钮
      btnType : 0,
      btnIcon : "el-icon-search",
      btnText : "寻找对局",
      refreshBtnTcon : "el-icon-refresh",
      userPoints : 0,
      // 排行榜
      userList : []
    }
  },
  mounted(){
    const ipcRenderer = window.ipcRenderer
    this.getUserPoints()
    setTimeout(() => {
      this.refreshScoreboard()
    },300)
    // IPC通信：监听用户身份信息
    ipcRenderer.on("user",this.userMsgHandle)
    ipcRenderer.on("game",this.gameMsgHandle)
  },
  methods : {
    // 表格列格式化
    userOnlineStatusFormatter(row){
      let userOnlineStatus = "离线"
      if(row.userOnlineStatus === 1){
        userOnlineStatus = "在线"
      }else if(row.userOnlineStatus === 2){
        userOnlineStatus = "寻找对局中"
      }else if(row.userOnlineStatus === 3){
        userOnlineStatus = "游戏中"
      }
      return userOnlineStatus
    },
    // 收到主进程信息
    userMsgHandle(event,msg){
      const { sort } = msg
      console.log(msg)
      if(sort === "userlist"){
        this.userList = msg.msg
        this.refreshBtnTcon = "el-icon-refresh"
      }else if(sort === "points"){
        const { userPoints } = msg
        this.userPoints = userPoints
      }
    },
    gameMsgHandle(event,msg){
      const { sort } = msg
      if( sort === "created"){
        const { gameId } = msg
        this.$message({
          message: "已找到游戏对局...",
          type: 'success'
        })
        window.gameId = gameId
        if (this.$route.path !== "/game") {
          this.$router.replace({ path : "/game" })
        }
      }
    },
    // 按键
    lookBtn(){
      if(this.btnType){
        // 取消对局寻找
        this.btnText = "寻找对局"
        this.btnIcon = "el-icon-search"
        this.btnType = 0
        ipcRenderer.invoke("game",{
          type : "game",
          sort : "unlooking",
          token : window.token
        })
      }else{
        // 开始对局寻找
        this.btnText = "对局寻找中..."
        this.btnIcon = "el-icon-loading"
        this.btnType = 1
        ipcRenderer.invoke("game",{
          type : "game",
          sort : "looking",
          token : window.token
        })
      }
    },
    // 积分榜刷新
    refreshScoreboard(){
      ipcRenderer.invoke("user",{
        type : "user",
        sort : "scoreboard"
      })
      this.refreshBtnTcon = "el-icon-loading"
    },
    getUserPoints(){
      ipcRenderer.invoke("user",{
        type : "user",
        sort : "points"
      })
    }
  },
  beforeDestroy(){
    ipcRenderer.removeAllListeners("user")
    ipcRenderer.removeAllListeners("game")
  }
}
</script>

<style scoped>
.home{
  height: 100%;
  width: 100%;
  background-color : cornsilk;
}
.col{
  position: relative;
  height: 100%;
}
.home-main{
  text-align: center;
}
.looking-btn{
  margin-top: 30%;
}
.scoreboard{
  text-align: center;
}
.scoreboard-header{
  height: 60px;
  line-height: 60px;
  font-size: 24px;
}
.refresh{
  float: right;
  margin-top: 10px;
  margin-right: 20px;
}
</style>
