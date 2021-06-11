const net = require("net")

const { PORT,HOST } = require("./config")
const closeSocket = require("./app/handle/close_socket")
const errorSocket = require("./app/handle/error_socket")
const dataSocket = require("./app/handle/data_socket")

// 记录全部TCP连接
const serverList = {}

// 初始化TCP服务器，监听本机6666端口
const server = net.createServer()
console.log("服务器启动成功...")
server.listen(PORT,HOST)

// 服务器事件监听

// “listening”事件
server.on("listening",() => {
  console.log(`开始监听 ${HOST}:${PORT}`)
})

// "connection"事件
server.on("connection",async (socket) => {
  // 设置当前socket超时时间：2h
  socket.setTimeout(1000*60*60*2)
  // 设置socket编码格式
  socket.setEncoding("utf-8")
  // socket close事件处理
  socket.on("close",async (err) => {
    if(err){
      console.log("数据传输错误...")
    }
    const socketName = socket.userName || ""
    console.log(`${socketName} 客户端 连接已关闭...`)
    await closeSocket(socket,serverList)
  })
  // socket data事件处理
  socket.on("data",async (receivedData) => {
    const receivedMessage = JSON.parse(receivedData)
    await dataSocket(socket,serverList,receivedMessage)
  })
  // sock end事件处理
  socket.on("end",() => {
    const socketName = socket.userName || ""
    console.log(`${socketName} 客户端 请求关闭当前连接...`)
  })
  // socket error事件
  socket.on("error",async (err) => {
    const socketName = socket.userName || ""
    console.log(`${socketName} 出现错误，错误内容：`,err)
    await errorSocket(socket,err)
    // 关闭当前socket
    socket.end()
  })
  // socket timeout事件
  socket.on("timeout",() => {
    const socketName = socket.userName || ""
    console.log(`${socketName} 客户端 连接超时...`)
    socket.end()
  })
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
