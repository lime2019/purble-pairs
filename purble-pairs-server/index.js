const net = require("net")

// 初始化服务器
const server = net.createServer()
server.listen({
  port : 6666
})

// 服务器事件监听

// 启动服务器事件
server.on("listening",() => {
  console.log("服务器已启动")
})

// "connection"事件
server.on("connection",(socket) => {
  console.log("有客户端连接上...")
  const clientHost = socket.remoteAddress
  const clientPort = socket.remotePort
  // 收到数据
  socket.on("data",(data) => {
    const receiveTime = Date.now()
    console.log(`\n客户端发送信息为：${data.toString()}`)
    console.log("数据Buffer为:",data,`,数据大小为${data.length}字节`)
    socket.write(`服务器回送：${data.toString()}\n服务端收到消息时间：${new Date().toLocaleString()},时间戳：${receiveTime},数据包大小为：${data.length}字节`)
  })
  // 断开socket
  socket.on("close",() => {
    console.log(`IP：${clientHost}，端口：${clientPort} 客户机断开连接`)
  })
  // 
  socket.on("error",(err) =>{
    console.log("socket错误：",err)
  })
})

// "close"事件
server.on("close",() => {
  console.log("已关闭当前服务器")
})

// 错误事件
server.on("error",(err) => {
  console.log("服务端出现错误",err)
})
