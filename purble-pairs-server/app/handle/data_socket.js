const { userMsgHandle,gameMsgHandle } = require("./msg_hanle")

/**
 * Socket “data”事件处理
 * @param {*} socket 
 * @param {object} serverList 
 */
module.exports = async (socket,serverList,receivedMessage) => {
  console.log(receivedMessage)
  const { type } = receivedMessage
  if(type === "user"){
    await userMsgHandle(socket,serverList,receivedMessage)
  }else if(type === "game"){
    await gameMsgHandle(socket,serverList,receivedMessage)
  }
}