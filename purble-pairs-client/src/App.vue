<template>
  <el-container class="container">
    <!-- 遮罩层：登录与注册  -->
    <el-dialog class="dialog" :title="dialogTitle" :visible.sync="dialogVisible" width="50%" center @close="closeDialog" v-loading="dialogLoading"  :element-loading-text="dialogLoadingText" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-form :model="form">
        <el-form-item label="昵称" v-show="registerStatus" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号" :label-width="formLabelWidth">
          <el-input v-model="form.account" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="form.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="defineDialog">确 定</el-button>
      </div>
    </el-dialog>
    <el-header class="header">
      <el-row>
        <el-col :span="16" class="title">
          Lime翻牌游戏
        </el-col>
        <el-col :span="8">
          <el-dropdown @command="handleCommand">
            <el-button type="success">{{userName}}</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item class="dropdown-item" icon="el-icon-user-solid" v-show="!logInStatus" command = "login">登录</el-dropdown-item>
              <el-dropdown-item class="dropdown-item" divided icon="el-icon-message-solid" v-show="!logInStatus" command = "register">注册</el-dropdown-item>
              <el-dropdown-item class="dropdown-item" icon="el-icon-s-promotion" v-show="logInStatus" command = "logout">注销</el-dropdown-item>
            </el-dropdown-menu>
            </el-dropdown>
        </el-col>
      </el-row>
    </el-header>
    <el-main id="main">
      <router-view></router-view>
    </el-main>
    <el-footer class="footer" style="height: 24px;">
      <div class="copyright">
        Copyright © 2021 lime2019@foxmail.com  All Rights Reserved
      </div>
    </el-footer>
  </el-container>
</template>

<script>

const ipcRenderer = window.ipcRenderer

export default {
  data(){
    return {
      // 网络状态
      tcpLineStatus : true,
      loading : null,
      // 遮罩层加载中
      dialogLoading : false,
      dialogLoadingText : "",
      // 遮罩层
      dialogTitle : "",
      dialogVisible : false,
      dialogType : "",
      form : {},
      formLabelWidth : "60px",
      // 用户状态
      logInStatus : false,
      registerStatus : false,
      // 用户信息
      userName : "游客",
      token : "",
    }
  }, 
  watch:{
    // 监听TCP通信连接状态
    tcpLineStatus(value){
      if(!value){
        this.loading = this.$loading({
          lock: true,
          text: '与服务器连接中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$router.replace({path : "/home"})
      }else{
        if(this.loading){
          setTimeout(() => {
            ipcRenderer.on("tcp",this.tcpMsgHandle)
            ipcRenderer.on("user",this.userMsgHandle)
            this.initUser()
            this.loading.close()
            console.log("重连...")
          },500)
        }
      }
    }
  },
  mounted(){
    // IPC通信：监听用户身份信息
    ipcRenderer.on("tcp",this.tcpMsgHandle)
    ipcRenderer.on("user",this.userMsgHandle)
    if(!window.token){
      setTimeout(() => {
        this.initUser()
      },500)
    }
    this.$router.replace({ path : "/home" })
  },
  methods : {
    // IPC：TCP通信是否连通
    tcpMsgHandle(event,msg){
      const { type } = msg
      if(type === "offline"){
        this.tcpLineStatus = false
      }else if(type === "online"){
        this.tcpLineStatus = true
      }
    },
    // IPC：用户信息
    userMsgHandle(event,msg){
      const { sort } = msg
      if(sort === "init"){
        const { userName } = msg.userInfo
        this.userName = userName
        this.token = msg.token
        window.token = msg.token
        this.logInStatus = false
      }else if(sort === "login"){        
        const { userName } = msg.userInfo
        this.userName = userName
        this.token = msg.token
        window.token = msg.token
        this.logInStatus = true
        this.dialogLoading = false
        this.closeDialog()
        this.$message({
          message: `登录成功...`,
          type: 'success'
        })
      }else if(sort === "register"){
        this.logInStatus = true
        this.dialogLoading = false
        const { userName } = msg.userInfo
        this.userName = userName
        this.token = msg.token
        window.token = msg.token
        this.$message({
          message: `${msg.userInfo.userName} 账号创建成功...`,
          type: 'success'
        })
        this.closeDialog()
      }else if(sort === "error"){
        const { msg:message } = msg
        this.$message({
          message: message,
          type: 'warning'
        })
        this.dialogLoading = false
      }
    },
    // 下拉列表
    handleCommand(command) {
      if(command === 'login'){
        this.dialogTitle = "登录"
        this.dialogVisible = true
        this.dialogType = command
      }else if(command === 'register'){
        this.dialogTitle = "注册"
        this.dialogVisible = true
        this.dialogType = command
        this.registerStatus = true
      }else if(command === 'logout'){
        delete window.token
        ipcRenderer.invoke("user",{
          type : "user",
          sort : "logout"
        })
        this.logInStatus = false
        this.token = ""
        this.userInfo = {
          userName : "游客",
          userPoints : 0
        }
      }
    },
    initUser(){
      ipcRenderer.invoke("user",{
        type : "user",
        sort : "init"
      })
    },
    // 遮罩层操作
    defineDialog(){
      if(this.dialogType === "login"){
        ipcRenderer.invoke("user",{
          type : "user",
          sort : "login",
          data : this.form
        })
        this.dialogLoadingText = "登录中..."
      }else if(this.dialogType === "register"){
        ipcRenderer.invoke("user",{
          type : "user",
          sort : "register",
          data : this.form
        })
        this.dialogLoadingText = "注册中..."
      }
      this.dialogLoading = true
    },
    closeDialog(){
      this.dialogVisible = false
      this.form = {}
      this.dialogType = ""
      this.dialogTitle = ""
      this.registerStatus = false
    },
  },
  beforeDestroy(){
    ipcRenderer.removeAllListeners("tcp")
    ipcRenderer.removeAllListeners("user")
  }
}
</script>


<style>
  *{
    user-select:none;
  }
  html{
    height: 100%;
  }
  body{
    margin: 0;
    height: 100%;
  }
  .container{
    height: 100%;
    width: 100%;
  }
  /* 遮罩层 */
  .dialog{
    font-family: Arial,Verdana,Sans-serif;
  }
  /* 顶部 */
  .header{
    width: 100%;
    line-height: 60px;
    text-align: center;
    background-color:beige;
  }
  .title{
    line-height: 60px;
    font-size: 36px;
    font-family: Georgia, 'Times New Roman', Times, serif;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .dropdown-item{
    width: 80px;
  }
  /* 中间 */
  #main{
    padding: 0;
  }
  /* 底部 */
  .footer{
    text-align: center;
    color: rgba(0, 0, 0, 0.5);
  }
  .copyright{
    margin-top: 4px;
    height: 16px;
    font-size: 12px;
  }
</style>
