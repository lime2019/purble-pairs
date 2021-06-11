const { addDocument,updateDocumentById } = require("../db/db_handle")

/**
 * Socket “close”事件处理
 * @param {*} socket 
 * @param {object} serverList 
 */
module.exports = async (socket,serverList) => {
  const { _id } = socket.userInfo
  // 日志信息
  const log = {
    type : "socket close",
    ip : socket.remoteAddress,
    port : socket.remotePort,
    family : socket.remoteFamily
  }
  await updateDocumentById("purble_pairs_user",_id,{ userOnlineStatus : false })
  await addDocument("purble_pairs_log",log)
  delete serverList[_id]
}