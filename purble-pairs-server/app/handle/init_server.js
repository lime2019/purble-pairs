const { addDocument } = require("../db/db_handle")
const { generateToken } = require("../lib/util")

module.exports = async (socket,serverList) => {
  // 设置当前socket超时时间：2h
  socket.setTimeout(1000*60*60*2)
  // 设置socket编码格式
  socket.setEncoding("utf-8")
  // 初始化用户Id
  const userId = Date.now().toString()
  // 将socket存储到serverList中
  serverList[userId] = socket
  const userInfo = {
    _id : userId,
    userName : "游客" + userId,
    userPoints : 0
  }
  const userToken = generateToken(userInfo)
  userInfo.userToken = userToken
  const sendMsg = {
    type : "user",
    sort : "init",
    data : userInfo
  }
  // 序列化信息
  const message = JSON.stringify(sendMsg)
  // 向客户端发送分配的用户信息
  socket.write(message)
  delete userInfo.userToken
  socket.userInfo = userInfo
  userInfo.userOnlineStatus = true
  userInfo.userPoints = 0
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