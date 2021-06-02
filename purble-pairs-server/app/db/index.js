const tcb = require("@cloudbase/node-sdk")

const { tcbInfo } = require("../../config/index")

const tcbApp = tcb.init(tcbInfo)

const db = tcbApp.database()

module.exports = db