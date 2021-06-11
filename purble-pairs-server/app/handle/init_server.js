const { addDocument } = require("../db/db_handle")
const { generateToken } = require("../lib/util")

module.exports = async (socket,serverList) => {
  // 初始化用户Id
  const userId = Date.now().toString()
  // 将socket存储到serverList中
  serverList[userId] = socket
  const userInfo = {
    _id : userId,
    userName : "游客" + userId,
    userPoints : 0,
    userOnlineStatus : 1,
  }
  const userToken = generateToken(userInfo)
  const message = {
    type : "user",
    sort : "init",
    userInfo : userInfo,
    token : userToken
  }
  // 序列化信息
  const sendMsg = JSON.stringify(message)
  // 向客户端发送分配的用户信息
  socket.write(sendMsg)
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
}