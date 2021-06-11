// const { mainWindow } = require("../background")

class EventHandle{
  async closeEventHanle(err){
    if(err){
      console.log("出现错误...")
    }
    console.log("TCP连接已断开...")
  }
  async connectEventHanle(){
    console.log("已连接上服务器...")
  }
  async dataEventHandle(msg){
    console.log(msg)

  }
  async errorEventHandle(error){
    console.log("出现错误：",error)
  }
  async timeoutEventHandle(){
    console.log("连接超时...")
  }
}

module.exports = new EventHandle