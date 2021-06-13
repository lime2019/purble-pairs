const { addDocument,readDocument, updateDocumentById,readDocumentById } =  require("../db/db_handle")
const db = require("../db/index")
const _ = db.command

class GameCtl{
  async createGame(gameInfo){
    const createResult = await addDocument("purble_pairs_game",gameInfo)
    return createResult
  }
  async readGameUserInfo(gameId,userId){
    let readResult = {}
    let userInfo = {}
    readResult = await readDocument("purble_pairs_game",{ _id : gameId, userOneId : userId })
    if(readResult.data.length === 0){
      readResult = await readDocument("purble_pairs_game",{ _id : gameId, userTwoId : userId })
      if(readResult !== 0){
        userInfo.userName = readResult.data[0].userOneInfo.userOneName
        userInfo.userPoints = readResult.data[0].userOneInfo.userOnePoints
        userInfo.userId = readResult.data[0].userOneId
      }
    }else{
      userInfo.userName = readResult.data[0].userTwoInfo.userTwoName
      userInfo.userPoints = readResult.data[0].userTwoInfo.userTwoPoints
      userInfo.userId = readResult.data[0].userTwoId
    }
    return userInfo
  }
  async readGame(gameId,userId){
    const readResult = await readDocumentById("purble_pairs_game",gameId)
    const gameInfo = readResult.data[0]
    return gameInfo
  }
  async updateGame(gameId,updateObj){
    const updateResult = await updateDocumentById("purble_pairs_game",gameId,updateObj)
    return updateResult
  }
}

module.exports = new GameCtl()