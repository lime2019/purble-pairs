const net = require("net")

const { PORT,HOST } = require("./config")
const initServer = require("./app/handle/init_server")
const db = require("./app/db")

// 记录全部TCP连接
const serverList = []

// 初始化TCP服务器，监听本机6666端口
const server = net.createServer()
console.log("服务器启动成功...")
server.listen(PORT,HOST)

// 服务器事件监听

// “listening”事件
server.on("listening",() => {
  console.log("监听链接建立成功...")
})

// "connection"事件
server.on("connection",async (socket) => {
  await initServer(socket,serverList)
  console.log(serverList[0].userInfo)
})

// "close"事件
server.on("close",() => {
  console.log("正在关闭当前服务器...")
})

// 错误事件
server.on("error",(err) => {
  console.log("服务端出现错误...")
  if(err.code === "EADDRINUSE"){
    console.log("地址正在被使用，1s后开始重试...")
    setTimeout(() => {
      server.close()
      server.listen(PORT,HOST)
    },1000)
  }
})
