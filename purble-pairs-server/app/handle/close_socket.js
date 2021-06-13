const { addDocument,updateDocumentById,readDocument } = require("../db/db_handle")
const db = require("../db/index")
const _ = db.command
/**
 * Socket “close”事件处理
 * @param {*} socket 
 * @param {object} serverList 
 */
module.exports = async (socket,serverList) => {
  const id = socket.userId
  // 查询是否存在进行中对局
  const findGameByOne = await readDocument("purble_pairs_game",{userOneId : id,gameProgressStatus : true})
  const findGameByTwo = await readDocument("purble_pairs_game",{userTwoId : id,gameProgressStatus : true})
  let gameInfo = null
  if(findGameByOne){
    gameInfo = findGameByOne.data[0]
  }
  if(findGameByTwo){
    gameInfo = findGameByTwo.data[0]
  }
  if(gameInfo){
    const {_id,userOneId,userTwoId,} = gameInfo
    let victoryId = ""
    if(id === userOneId){
      victoryId = userTwoId
    }else{
      victoryId = userOneId
    }
    await updateDocumentById("purble_pairs_game",_id,{gameWinnerId : victoryId,gameProgressStatus : false})
    await updateDocumentById("purble_pairs_user",victoryId,{ userOnlineStatus : 1,userPoints : _.inc(1)})
    const sendMsg = {
      type : "game",
      sort : "over",
      gameStatus : 1,
    }
    const sendData = JSON.stringify(sendMsg)
    serverList[victoryId].write(sendData)
  }
  // 日志信息
  const log = {
    type : "socket close",
    ip : socket.remoteAddress,
    port : socket.remotePort,
    family : socket.remoteFamily
  }
  await updateDocumentById("purble_pairs_user",id,{ userOnlineStatus : 0 })
  await addDocument("purble_pairs_log",log)
  delete serverList[id]
}