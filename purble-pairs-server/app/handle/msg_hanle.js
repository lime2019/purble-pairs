// 消息处理
const { verifyToken,generateToken } = require("../lib/util")
const { createUser,userLogIn,getUsersByPoints,findUser,updateUser,getUserPointsById } = require("../servers/user")
const { createGame,readGameUserInfo,updateGame,readGame } = require("../servers/game")
const db = require("../db/index")
const _ = db.command

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
      const id = socket.userId
      const {account, password} = receivedMessage.data
      const userInfo = {
        userAccount : account,
        userPassword : password
      }
      const logInResult = await userLogIn(userInfo)
      if(logInResult.flag){
        await updateUser(id,{userOnlineStatus : 0})
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
      const _id = socket.userId
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
        await updateUser(_id,{userOnlineStatus : 0})
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
    }else if(sort === "points"){
      const id = socket.userId
      const readResult = await getUserPointsById(id)
      sendMsg = {
        type : "user",
        sort : "points",
        userPoints : readResult,
      }
    }
    const sendData = JSON.stringify(sendMsg)
    socket.write(sendData)
  }
  async gameMsgHandle(socket,serverList,receivedMessage){
    const { sort } = receivedMessage
    const { token } = receivedMessage
    const verifyResult = verifyToken(token)
    const { userInfo } = verifyResult
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
    if(sort === "flop"){
      const { gameId,row,col } = receivedMessage
      const gameInfo = await readGame(gameId)
      const { userOneId,userTwoId,initCheckerboard } = gameInfo
      const brand = initCheckerboard[row][col]
      const sendMsg = {
        type : "game",
        sort : "flop",
        brand : brand,
        row : row,
        col : col
      }
      const sendData = JSON.stringify(sendMsg)
      serverList[userOneId].write(sendData)
      serverList[userTwoId].write(sendData)
    }else if(sort === "nextflop"){
      const { gameId,row,col,flopRow,flopCol } = receivedMessage
      const {_id,userName} = userInfo
      const gameInfo = await readGame(gameId)
      let { userOneId,userTwoId,initCheckerboard,recordCheckerboard,brandNumber,gameSteps,userOneGamePoints,userTwoGamePoints } = gameInfo
      const flopBrand = initCheckerboard[flopRow][flopCol]
      const brand = initCheckerboard[row][col]
      if(!gameSteps){
        gameSteps = []
      }
      gameSteps.push({
        gameStepName : `${userName}-${Date.now().toString}`,
        gameStep : `[${row}][${col}]：${brand}`
      })
      gameSteps.push({
        gameStepName : `${userName}-${Date.now().toString}`,
        gameStep : `[${flopRow}][${flopCol}]：${flopBrand}`
      })
      await updateGame(gameId,{gameSteps : gameSteps})
      const sendMsg = {
        type : "game",
        sort : "nextflop",
        brand : brand,
        flopBrand: flopBrand,
        row : row,
        col : col,
        flopRow : flopRow,
        flopCol : flopCol
      }
      if( flopBrand === brand ){
        sendMsg.score = 2
        if(_id === userOneId){
          await updateGame(gameId,{ userOneGamePoints : _.inc(2) })
          userOneGamePoints += 2
        }else{
          await updateGame(gameId,{ userTwoGamePoints : _.inc(2)  })
          userTwoGamePoints += 2
        }
        if(userOneGamePoints + userTwoGamePoints === brandNumber ){
          let victoryId = ""
          let failId = ""
          if(userOneGamePoints > userTwoGamePoints){
            victoryId = userOneId
            failId = userTwoId
          }else if(userOneGamePoints < userTwoGamePoints){
            victoryId = userTwoId
            failId = userOneId
          }else{
            victoryId = _id
            if(userOneId === _id){
              failId = userTwoId
            }else{
              failId = userOneId
            }
          }
          await updateGame(gameId , { gameWinnerId : victoryId , gameProgressStatus : false})
          const victoryMessage = {
            type : "game",
            sort : "over",
            gameStatus : 1
          }
          const failMessage = {
            type : "game",
            sort : "over",
            gameStatus : 0
          }
          await updateUser(victoryId,{ userPoints : _.inc(1), userOnlineStatus : 1 })
          await updateUser(failId,{ userOnlineStatus : 1 })
          const victoryData = JSON.stringify(victoryMessage)
          const failData = JSON.stringify(failMessage)
          serverList[victoryId].write(victoryData)
          serverList[failId].write(failData)
          serverList[userOneId].setTimeout(1000*60*60*2)
          serverList[userTwoId].setTimeout(1000*60*60*2)
        }
        recordCheckerboard[row][col] = _id
        recordCheckerboard[flopRow][flopCol] = _id
        await updateGame(gameId,{recordCheckerboard : recordCheckerboard})
      }
      let sendData = null
      if(_id === userOneId){
        sendMsg.scorer = "me"
        sendData = JSON.stringify(sendMsg)
        serverList[userOneId].write(sendData)
        sendMsg.scorer = "opponent"
        sendData = JSON.stringify(sendMsg)
        serverList[userTwoId].write(sendData)
      }else{
        sendMsg.scorer = "me"
        sendData = JSON.stringify(sendMsg)
        serverList[userTwoId].write(sendData)
        sendMsg.scorer = "opponent"
        sendData = JSON.stringify(sendMsg)
        serverList[userOneId].write(sendData)
      }
    }else if(sort === "looking"){
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
          userOneGamePoints : 0,
          userTwoGamePoints : 0,
          userOneInfo : {
            userOneName : userOneName,
            userOnePoints : userOnePoints,
          },
          userTwoInfo : {
            userTwoName : userTwoName,
            userTwoPoints : userTwoPoints,
          },
          gameProgressStatus : true,
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
          socket.status = "looking"
          const userTwoSocket = serverList[userTwoId]
          userTwoSocket.write(sendData)
        }
      }
    }else if(sort === "unlooking"){
      socket.status = "unlooking"
      await updateUser(userInfo._id,{ userOnlineStatus : 1 })
    }else if(sort === "info"){
      const { gameId } = receivedMessage
      const opponentInfo = await readGameUserInfo(gameId,userInfo._id)
      const sendMsg = {
        type : "game",
        sort : "info",
        msg : "对局对方信息...",
        opponentInfo : opponentInfo
      }
      const sendData = JSON.stringify(sendMsg)
      // 将通信超时改为1min
      socket.setTimeout(1000*60)
      socket.gameStatus = "guessing"
      socket.write(sendData)
    }else if(sort === "giveup"){
      const { gameId } = receivedMessage
      const opponentInfo = await readGameUserInfo(gameId,userInfo._id)
      const { userId } = opponentInfo
      const sendOpponentMsg = {
        type : "game",
        sort : "over",
        gameStatus : 1,
      }
      await updateUser(userId,{ userPoints : _.inc(1),userOnlineStatus : 1 })
      const sendOpponentData = JSON.stringify(sendOpponentMsg)
      serverList[userId].write(sendOpponentData)
      const sendMsg = {
        type : "game",
        sort : "over",
        gameStatus : 0,
      }
      await updateUser(userInfo._id,{ userOnlineStatus : 1 })
      await updateGame(gameId,{ gameWinnerId : userId , gameProgressStatus : false })
      const sendData = JSON.stringify(sendMsg)
      delete socket.gameStatus
      socket.write(sendData)
    }else if(sort === "guessing"){
      socket.setTimeout(1000*60*60*2)
      socket.gameStatus = "init"
      delete socket.gameStatus
      const { gameId,guessing } = receivedMessage
      const gameInfo = await readGame(gameId)
      const { userOneId, userTwoId,fingerGuessing } = gameInfo
      if(!fingerGuessing){
        let guessingInfo = {}
        if(userInfo._id === userOneId){ 
          guessingInfo.userOneGuessing = guessing 
        }else if(userInfo._id === userTwoId){ 
          guessingInfo.userTwoGuessing = guessing 
        }
        await updateGame(gameId,{ "fingerGuessing" : guessingInfo})
      }else{
        let opponentGuessing = ""
        let opponentId = ""
        if(userInfo._id === userOneId){ 
          fingerGuessing.userOneGuessing = guessing
          opponentGuessing = fingerGuessing.userTwoGuessing
          opponentId = userTwoId
        }else if(userInfo._id === userTwoId){ 
          fingerGuessing.userTwoGuessing = guessing 
          opponentGuessing = fingerGuessing.userOneGuessing
          opponentId = userOneId
        }
        if(
          (guessing === "rock" && opponentGuessing === "scissors") ||
          (guessing === "scissors" && opponentGuessing === "paper") ||
          (guessing === "paper" && opponentGuessing === "rock")
        ){
          fingerGuessing.guessingUserId = userInfo._id
          const sendMsg = {
            type : "game",
            sort : "guessing",
            message : "victory",
            opponentGuessing : opponentGuessing
          }
          const sendData = JSON.stringify(sendMsg)
          socket.write(sendData)
          // 当前用户配置牌数时间为1min
          socket.setTimeout(1000*60)
          const sendOperationMsg = {
            type : "game",
            sort : "guessing",
            message : "fail",
            opponentGuessing : guessing
          }
          const opponentSocket = serverList[opponentId]
          const sendOperationData = JSON.stringify(sendOperationMsg)
          opponentSocket.write(sendOperationData)
        }else{
          fingerGuessing.guessingUserId = opponentId
          const sendMsg = {
            type : "game",
            sort : "guessing",
            message : "fail",
            opponentGuessing : opponentGuessing
          }
          const sendData = JSON.stringify(sendMsg)
          socket.setTimeout(1000*60*60*2)
          socket.write(sendData)
          const sendOperationMsg = {
            type : "game",
            sort : "guessing",
            message : "victory",
            opponentGuessing : guessing
          }
          const opponentSocket = serverList[opponentId]
          const sendOperationData = JSON.stringify(sendOperationMsg)
          opponentSocket.setTimeout(1000*60)
          opponentSocket.write(sendOperationData)
        }
      }
    }else if(sort === "init"){
      const {row,col} = receivedMessage
      const number = row*col/2
      let brandList = [
        "el-icon-light-rain","el-icon-lightning","el-icon-heavy-rain","el-icon-sunrise",
        "el-icon-sunny","el-icon-cloudy","el-icon-cloudy-and-sunny","el-icon-moon",
        "el-icon-food","el-icon-chicken","el-icon-fork-spoon","el-icon-knife-fork",
        "el-icon-sugar","el-icon-ice-cream","el-icon-hot-water","el-icon-water-cup",
        "el-icon-goblet-full","el-icon-grape","el-icon-cherry","el-icon-apple",
        "el-icon-pear","el-icon-orange","el-icon-coffee","el-icon-ice-drink",
        "el-icon-milk-tea","el-icon-potato-strips","el-icon-lollipop","el-icon-ice-cream-round",
        "el-icon-first-aid-kit","el-icon-message","el-icon-watch","el-icon-lock",
      ]
      let initList = brandList.slice(0,number).concat(brandList.slice(0,number))
      let initListNumber = number*2
      while(initListNumber){
        let j = Math.floor( Math.random()*initListNumber--);
        [initList[j], initList[initListNumber]] = [initList[initListNumber], initList[j]];
      }
      let initCheckerboard = []
      let recordCheckerboard = []
      for(let i = 0; i < row; i++){
        let list = initList.slice(i*col,i*col+col)
        let colList = []
        for(let j = 0; j < col; j++){
          colList.push("el-icon-mobile")
        }
        initCheckerboard.push(list)
        recordCheckerboard.push(colList)
      }
      const { gameId } = receivedMessage
      await updateGame(gameId,{ initCheckerboard : initCheckerboard,recordCheckerboard : recordCheckerboard,brandNumber : number*2 })
      const sendMsg = {
        type : "game",
        sort : "init",
        checkerboard : recordCheckerboard
      }
      const opponentInfo = await readGameUserInfo(gameId,userInfo._id)
      const { userId } = opponentInfo
      const sendData = JSON.stringify(sendMsg)
      socket.write(sendData)
      serverList[userId].write(sendData)
      socket.gameStatus = "flop"
      socket.setTimeout(1000*60*60*2)
      serverList[userId].gameStatus = "flop"
      serverList[userId].setTimeout(1000*60)
    }
  }
}

module.exports = new MsgHanle()