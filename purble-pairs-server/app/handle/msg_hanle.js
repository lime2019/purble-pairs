// 消息处理
const { verifyToken,generateToken } = require("../lib/util")
const { createUser,userLogIn,getUsersByPoints } = require("../servers/user")

class MsgHanle{
  async userMsgHandle(socket,serverList,receivedMessage){
    const { sort } = receivedMessage
    if(sort === "login"){
      const {account, password} = receivedMessage.data
      const userInfo = {
        userAccount : account,
        userPassword : password
      }
      const logInResult = await userLogIn(userInfo)
      let sendMsg = null
      if(logInResult.flag){
        delete serverList[socket.userInfo._id]
        delete socket.userInfo
        const token = generateToken(logInResult.userInfo)
        const { _id,userName,userAccount,userPoints,userOnlineStatus } = logInResult.userInfo
        socket.userInfo = {
          _id : _id,
          userName : userName,
          userAccount : userAccount,
          userPoints : userPoints,
          userOnlineStatus : userOnlineStatus,
        }
        serverList[_id] = socket
        sendMsg = {
          type : "user",
          sort : "login",
          token : token,
          userInfo : logInResult.userInfo
        }
      }else{
        sendMsg = {
          type : "user",
          sort : "error",
          msg : logInResult.message
        }
      }
      const sendData = JSON.stringify(sendMsg)
      socket.write(sendData)
    }else if(sort === "register"){
      const { name,account, password} = receivedMessage.data
      const id = Date.now().toString()
      const userInfo = {
        _id : id,
        userName : name,
        userAccount : account,
        userPassword : password,
        userPoints : 0,
        userOnlineStatus : 0
      }
      const createResult = await createUser(userInfo)
      let sendMsg = null
      if(createResult.flag){
        delete serverList[socket.userInfo._id]
        delete socket.userInfo
        delete userInfo.userPassword
        const token = generateToken(userInfo)
        socket.userInfo = {
          _id : id,
          userName : name,
          userAccount : account,
          userPoints : 0,
          userOnlineStatus : 0,
        }
        serverList[id] = socket
        sendMsg = {
          type : "user",
          sort : "register",
          token : token,
          userInfo : userInfo
        }
      }else{
        sendMsg = {
          type : "user",
          sort : "error",
          msg : createResult.message
        }
      }
      const sendData = JSON.stringify(sendMsg)
      socket.write(sendData)
    }
  }
  async gameMsgHandle(socket,serverList,receivedMessage){

  }
}

module.exports = new MsgHanle()