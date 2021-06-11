// 消息处理
const { verifyToken,generateToken } = require("../lib/util")
const { createUser,userLogIn,getUsersByPoints,findUser,updateUser } = require("../servers/user")
const { createGame } = require("../servers/game")

class MsgHanle{
  async userMsgHandle(socket,serverList,receivedMessage){
    const { sort } = receivedMessage
    let sendMsg = null
    if(sort == "init"){
      const userId = Date.now().toString()
      const userName = "游客" + userId
      socket.userId = userId
      socket.userName = userName
      serverList[userId] = socket
      const userInfo = {
        _id : userId,
        userName : userName,
        userPoints : 0,
      }
      await createUser(userInfo)
      const token = generateToken(userInfo)
      sendMsg = {
        type : "user",
        sort : "init",
        userInfo : userInfo,
        token : token
      }
    }else if(sort === "login"){
      const {account, password} = receivedMessage.data
      const userInfo = {
        userAccount : account,
        userPassword : password
      }
      const logInResult = await userLogIn(userInfo)
      if(logInResult.flag){
        delete serverList[socket.userId]
        delete socket.userId
        delete socket.userName
        const { _id,userName,userPoints } = logInResult.userInfo
        const userInfo = {
          _id : _id,
          userName : userName,
          userPoints : userPoints,
        }
        const token = generateToken(userInfo)
        socket.userId = _id
        socket.userName = userName
        serverList[_id] = socket
        sendMsg = {
          type : "user",
          sort : "login",
          token : token,
          userInfo : userInfo
        }
      }else{
        sendMsg = {
          type : "user",
          sort : "error",
          msg : logInResult.message
        }
      }
    }else if(sort === "register"){
      const { name,account, password} = receivedMessage.data
      const id = Date.now().toString()
      const userInfo = {
        _id : id,
        userName : name,
        userAccount : account,
        userPassword : password,
        userPoints : 0
      }
      const createResult = await createUser(userInfo)
      if(createResult.flag){
        delete serverList[socket.userId]
        delete socket.userId
        delete socket.userName
        delete userInfo.userAccount
        delete userInfo.userPassword
        const token = generateToken(userInfo)
        socket.userId = id
        socket.userName = name
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
    }else if(sort === "scoreboard"){
      const userList = await getUsersByPoints()
      sendMsg ={
        type : "user",
        sort : "userlist",
        msg : userList
      }
    }
    const sendData = JSON.stringify(sendMsg)
    socket.write(sendData)
  }
  async gameMsgHandle(socket,serverList,receivedMessage){
    const { sort } = receivedMessage
    const { token } = receivedMessage
    const verifyResult = verifyToken(token)
    if(!verifyResult.validity){
      console.log("JWT校验失败...")
      const sendMsg = {
        type : "game",
        sort : "error",
        msg : "JWT校验失败..."
      }
      const sendData = JSON.stringify(sendMsg)
      socket.write(sendData)
      socket.end()
      return
    }
    if(sort === "looking"){
      const { userInfo } = verifyResult
      const findResult = await findUser({ userOnlineStatus : 2 })
      if(findResult.length === 0){
        // 当前没有寻找对局的用户，改变当前用户状态
        await updateUser(userInfo._id,{ userOnlineStatus : 2 })
      }else{
        const { _id:userOneId,userName:userOneName,userPoints:userOnePoints } = userInfo
        const { _id:userTwoId,userName:userTwoName,userPoints:userTwoPoints } = findResult[0]
        // 将用户状态改为游戏中
        await updateUser(userOneId,{ userOnlineStatus : 3 })
        await updateUser(userTwoId,{ userOnlineStatus : 3 })
        // 创建游戏
        const gameInfo = {
          _id : Date.now().toString(),
          userOneId : userOneId,
          userTwoId : userTwoId,
          userOneInfo : {
            userOneName : userOneName,
            userOnePoints : userOnePoints,
          },
          userTwoInfo : {
            userTwoName : userTwoName,
            userTwoPoints : userTwoPoints,
          },
        }
        const createGameResult = await createGame(gameInfo)
        if(createGameResult.id){
          const sendMsg = {
            type : "game",
            sort : "created",
            msg : "已寻找到对局...",
            gameId : createGameResult.id
          }
          const sendData = JSON.stringify(sendMsg)
          socket.write(sendData)
          const userTwoSocket = serverList[userTwoId]
          userTwoSocket.write(sendData)
        }
      }
    }else if(sort === "unlooking"){
      const { userInfo } = verifyResult
      await updateUser(userInfo._id,{ userOnlineStatus : 1 })
    }
  }
}

module.exports = new MsgHanle()