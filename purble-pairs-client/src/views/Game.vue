<template>
  <el-container class="game-main"  v-loading="loading"  :element-loading-text="loadingText" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <!-- 遮罩层：配置牌数 -->
    <el-dialog title="设置牌数" :visible.sync="dialogVisible" @open="openDialog">
      <el-form :model="form">
        <el-row>
          <el-col :span="12">
            <span>行数：</span>
            <el-select v-model="form.row" placeholder="请选择行数" @change="rowSelectChange">
              <el-option v-for="row in rowOptions" :key="row.value" :label="row.label" :value="row.value" ></el-option>
            </el-select>
          </el-col>
          <el-col :span="12">
            <span>列数：</span>
            <el-select v-model="form.col" placeholder="请选择列数" @change="colSelectChange">
              <el-option v-for="col in colOptions" :key="col.value" :label="col.label" :value="col.value" ></el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 猜拳界面 -->
    <el-main v-if="gameStatus === 'guessing'" class="guessing">
      <el-row style="height:45%;">
        <el-button class="guessing-item" v-if="opponentGuessing === 'rock'"><img src="../assets/rock.png"/></el-button>
        <el-button class="guessing-item" v-if="opponentGuessing === 'scissors'"><img src="../assets/scissors.png"/></el-button>
        <el-button class="guessing-item" v-if="opponentGuessing === 'paper'"><img src="../assets/paper.png"/></el-button>
      </el-row>
      <el-row style="height:10%;">
        <h3>{{guessingText}}<el-button size="mini" v-if="guessingStatus" @click="dialogVisible = true" :disabled="initDisabled">设置牌数</el-button></h3>
      </el-row>
      <el-row v-if="!userGuessingStatus" style="height:45%;">
        <el-col :span="8" >
          <el-button class="guessing-item" @click="toGuessing('rock')" :disabled="guessingDisabled"><img src="../assets/rock.png"/></el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="guessing-item" @click="toGuessing('scissors')" :disabled="guessingDisabled"><img src="../assets/scissors.png"/></el-button>
        </el-col>
        <el-col :span="8">
          <el-button class="guessing-item" @click="toGuessing('paper')" :disabled="guessingDisabled"><img src="../assets/paper.png"/></el-button>
        </el-col>
      </el-row>
      <el-row v-if="userGuessingStatus" style="height:45%;">
        <el-button class="guessing-item" v-if="userGuessing === 'rock'"><img src="../assets/rock.png"/></el-button>
        <el-button class="guessing-item" v-if="userGuessing === 'scissors'"><img src="../assets/scissors.png"/></el-button>
        <el-button class="guessing-item" v-if="userGuessing === 'paper'"><img src="../assets/paper.png"/></el-button>
      </el-row>
    </el-main>
    <!-- 翻牌界面 -->
    <el-main class="checkerboard" v-if="gameStatus === 'operation'">
      <el-row class="checkerboard-row" v-for="(row,rowIndex) in checkerboard" :key="rowIndex">
        <el-col class="checkerboard-col" v-for="(col,colIndex) in row" :key="colIndex">
          <el-button class="brand" :ref="`${rowIndex}-${colIndex}`" :icon="col" @click="flop(rowIndex,colIndex)" :disabled="flopDisabled"></el-button>
        </el-col>
      </el-row>
    </el-main>
    <!-- 侧边信息 -->
    <el-aside width="200px" class="aside">
      <el-row style="height:50%;">
        <el-button type="primary" class="aside-item">{{opponentName}}</el-button>
        <el-button type="info" class="aside-item">游戏积分：{{opponentPoints}}</el-button>
        <h1 class="aside-item">游戏用时：{{opponentGameTime}}</h1>
        <h1 class="aside-item">游戏得分：{{opponentGamePonits}}</h1>
      </el-row>
      <el-row style="height:50%;">
        <h1 class="aside-item">游戏用时：{{userGameTime}}</h1>
        <h1 class="aside-item">游戏得分：{{userGamePonits}}</h1>
        <el-popconfirm class="aside-item" title="确定认输吗？" @confirm="giveUp" >
          <el-button type="danger" slot="reference">认输</el-button>
        </el-popconfirm>
      </el-row>
    </el-aside>
  </el-container>
</template>

<script>

export default {
  data(){
    return{
      token : "",
      gameId : "",
      // 加载
      loading : true,
      loadingText : "等待对方进入游戏...",
      // 操作
      operationStatus : false,
      // 对手信息
      opponentName : "",
      opponentPoints : 0,
      opponentId : "",
      // 对战消息
      userGamePonits : 0,
      userGameTime : "00:00",
      opponentGamePonits : 0,
      opponentGameTime : "00:00",
      // 对局状态
      gameStatus : "",
      // 猜拳
      opponentGuessingStatus : false,
      userGuessingStatus : false,
      opponentGuessing : "",
      userGuessing : "",
      guessingText : "请猜拳...(若相同，先出拳者胜)",
      guessingDisabled : false,
      guessingStatus : false,
      // 遮罩层
      dialogVisible : false,
      form : {},
      rowOptions : [],
      colOptions : [],
      allNumbers : [{
        label : "1",
        value : 1
      },{
        label : "2",
        value : 2
      },{
        label : "3",
        value : 3
      },{
        label : "4",
        value : 4
      },{
        label : "5",
        value : 5
      },{
        label : "6",
        value : 6
      },{
        label : "7",
        value : 7
      },{
        label : "8",
        value : 8
      }], 
      evenNumbers : [{
        label : "2",
        value : 2
      },{
        label : "4",
        value : 4
      },{
        label : "6",
        value : 6
      },{
        label : "8",
        value : 8
      }],
      // 
      initDisabled : false,
      operationStatus : false,
      checkerboard : [],
      // 
      flopNumber : 0,
      flopDisabled : false,
      //  
      flopRow : 0,
      flopCol : 0,
    }
  },
  watch:{
    // 监听翻牌次数
    flopNumber(value){
      if(value > 1){
        this.flopDisabled = true
      }
    }
  },
  mounted(){
    const ipcRenderer = window.ipcRenderer
    this.token = window.token
    this.gameId = window.gameId
    // IPC通信
    this.getGameInfo()
    ipcRenderer.on("game",this.gameMsgHandle)
  },
  methods : {
    gameMsgHandle(event,msg){
      const { sort } = msg
      console.log("收到消息：",msg)
      if(sort === "info"){
        console.log(this.gameId,msg)
        const { opponentInfo } = msg
        this.opponentName = opponentInfo.userName
        this.opponentPoints = opponentInfo.userPoints
        this.opponentId = opponentInfo.userId
        this.loading = false
        this.gameStatus = "guessing"
      }else if(sort === "over"){
        const { gameStatus } = msg
        if(gameStatus){
          this.$message({
            message: "游戏胜利...",
            type: 'success'
          })
        }else{
          this.$message({
            message: "游戏失败...",
            type: 'info'
          })
        }
        if(this.$route.path !== "/home") {
          this.$router.replace({ path : "/home" })
        }
      }else if(sort === "guessing"){
        const { message,opponentGuessing } = msg
        this.opponentGuessing = opponentGuessing
        this.opponentGuessingStatus = true
        if(message === "victory"){
          this.guessingText = "猜拳胜利，请设置牌数..."
          this.dialogVisible = true
          this.guessingStatus = true
          this.operationStatus = false
          this.flopDisabled = true
        }else{
          this.guessingText = "猜拳失败，请等待对方设置牌数..."
          this.operationStatus = true
          this.flopDisabled = false
        }
      }else if(sort === "init"){
        this.gameStatus = "operation"
        const message = this.operationStatus ? "游戏开始，请翻牌..." : "游戏开始，请等待对手翻牌..."
        this.$message({
          message: message,
          type: 'success'
        })
        const { checkerboard,col,row } = msg
        this.checkerboard = checkerboard
      }else if(sort === "flop"){
        const { brand,row,col } = msg
        this.$set(this.checkerboard[row],col,brand)
        this.flopRow = row
        this.flopCol = col
      }else if(sort === "nextflop"){
        const {score,scorer,row,col,flopRow,flopCol,brand,flopBrand} = msg
        this.$set(this.checkerboard[row],col,brand)
        if(score){
          if(scorer === "me"){
            this.userGamePonits += score
          }else{
            this.opponentGamePonits += score
          }
        }else{
          setTimeout(() => {
            this.$set(this.checkerboard[row],col,"el-icon-mobile")
            this.$set(this.checkerboard[flopRow],flopCol,"el-icon-mobile")
          },2000)
        }
        if(!this.flopNumber){
          this.flopDisabled = !this.flopDisabled
        }
        this.flopNumber  = 0
        this.flopRow = 0
        this.flopCol = 0
      }
    },
    // 获取对方消息
    getGameInfo(){
      ipcRenderer.invoke("game",{
        type : "game",
        sort : "info",
        gameId : this.gameId,
        token : this.token,
      })
    },
    // 认输
    giveUp(){
      ipcRenderer.invoke("game",{
        type : "game",
        sort : "giveup",
        gameId : this.gameId,
        token : this.token,
        opponentId : this.opponentId
      })
    },
    // 猜拳
    toGuessing(value){
      ipcRenderer.invoke("game",{
        type : "game",
        sort : "guessing",
        gameId : this.gameId,
        token : this.token,
        guessing : value
      })
      this.userGuessing = value
      this.userGuessingStatus = true
      this.guessingDisabled = true
    },
    // 设置牌数
    submitForm(){
      ipcRenderer.invoke("game",{
        type : "game",
        sort : "init",
        gameId : this.gameId,
        token : this.token,
        row : this.form.row,
        col : this.form.col
      })
      this.dialogVisible = false
      this.initDisabled = true
    },
    // 遮罩层操作
    openDialog(){
      this.rowOptions = this.allNumbers
      this.colOptions = this.allNumbers
    },
    rowSelectChange(value){
      if(value%2 !== 0){
        this.colOptions = this.evenNumbers
      }else{
        this.colOptions = this.allNumbers
      }
    },
    colSelectChange(value){
      if(value%2 !== 0){
        this.rowOptions = this.evenNumbers
      }else{
        this.rowOptions = this.allNumbers
      }
    },
    // 翻牌
    flop(rowIndex,colIndex){
      if(this.checkerboard[rowIndex][colIndex] !== "el-icon-mobile"){
        this.$message({
          message: "此牌已翻开，请翻其他牌...",
          type: 'warning'
        })
      }else{
        let sendMsg = {
          type : "game",
          sort : "flop",
          gameId : this.gameId,
          token : this.token,
          row : rowIndex,
          col : colIndex
        }
        if(this.flopNumber === 1){
          sendMsg.sort = "nextflop"
          sendMsg.flopRow = this.flopRow
          sendMsg.flopCol = this.flopCol
        }
        ipcRenderer.invoke("game",sendMsg)
        this.flopNumber += 1
      }
    }
  },
  beforeDestroy(){
    ipcRenderer.removeAllListeners("game")
  }
}
</script>

<style scoped>
.game-main{
  height: 100%;
  width: 100%;
  background-color : cornsilk;
}
.guessing{
  text-align: center;
}
.guessing-item:hover{
  background-color: aqua;
}
/* 游戏界面 */
.checkerboard{
  display: flex;
  flex-direction:column;
  height: 100%;
  width: 100%;
}
.checkerboard-row{
  flex: 1;
  display: flex;
  flex-direction: row;
  width: 100%;
}
.checkerboard-col{
  flex: 1;
  text-align: center;
}
.brand{
  height: 80%;
  width: 80%;
  font-size:50px;
}
/* 侧边栏 */
.aside{
  text-align: left;
}
.aside-item{
  margin-top: 10%;
  margin-left: 0;
}
</style>
