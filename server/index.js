// 引入net模块，创建基于流的TCP服务器
const net = require("net")

const { serverInfo } = require("./config")

// 初始化TCP服务器
const TCP_Server = net.createServer()

// 监听本机6666端口
TCP_Server.listen(serverInfo || {
  host:"localhost",
  port: 6666
})

// TCP服务器事件监听

// 'listening' 事件
TCP_Server.on("listening",() => {
  const serverAddress = TCP_Server.address()
  console.log(`服务器监听已启动成功，通信协议为：${serverAddress.family}，监听端口为：${serverAddress.port}`)
})

// 'connection' 事件
TCP_Server.on("connection",(socket) => {
  let clientInfo = {}
  clientInfo.ip = socket.remoteAddress
  clientInfo.family = socket.remoteFamily
  clientInfo.port = socket.remotePort
  console.log("连接成功",clientInfo)
  socket.on("connect",() => {
    console.log(`IP：${clientInfo.ip}，端口：${clientInfo.port}，通信协议：${clientInfo.family}，成功建立TCP连接...`)
  })
  socket.on("close",() => {
    console.log("连接关闭...")
  })
  socket.on("data",() => {
    console.log("收到数据...")
    socket.end()
  })
  socket.on("error",() => {
    console.log("socket错误...")
  })
  socket.on("timeout",() => {
    console.log("socket连接超时...")
    socket.end()
  })
})

// 'error' 事件
TCP_Server.on("error",(err) => {
  console.log("服务端出现错误：",err)
})

// 'close' 事件
TCP_Server.on("close",() => {
  console.log("关闭当前服务器监听...")
})