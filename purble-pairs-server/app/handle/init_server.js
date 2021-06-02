const { addDocument } = require("../db/db_handle")

module.exports = async (socket,serverList) => {
  // 初始化用户信息
  const userInfo = {
    userName : "游客" + Date.now().toString(),
    serverId : serverList.length
  }
  socket.userInfo = userInfo
  // 日志信息
  const log = {
    type : "connection",
    ip : socket.remoteAddress,
    port : socket.remotePort,
    family : socket.remoteFamily
  }
  await addDocument("purble_pairs_user",userInfo)
  await addDocument("purble_pairs_log",log)
  // 序列化信息
  const message = JSON.stringify(userInfo)
  // 向客户端发送分配的用户信息
  socket.write(message)
  serverList.push(socket)
}