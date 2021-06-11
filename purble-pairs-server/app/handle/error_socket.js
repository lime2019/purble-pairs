const { addDocument } = require("../db/db_handle")
/**
 * Socket “error”事件处理
 * @param {*} socket 
 * @param {object} err 
 */
 module.exports = async (socket,err) => {
  const errorMessage = JSON.stringify(err)
  // 日志信息
  const log = {
    type : "socket error",
    ip : socket.remoteAddress,
    port : socket.remotePort,
    family : socket.remoteFamily,
    errorMessage : errorMessage
  }
  await addDocument("purble_pairs_log",log)
}