const { addDocument } =  require("../db/db_handle")
const db = require("../db/index")
const _ = db.command

class GameCtl{
  async createGame(gameInfo){
    const createResult = await addDocument("purble_pairs_game",gameInfo)
    return createResult
  }
}

module.exports = new GameCtl()