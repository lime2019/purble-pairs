const net = require("net")

const tcpServerOptions = {
  host : "localhost",
  port : 6666
}

const TCPClient = net.createConnection(tcpServerOptions)

TCPClient.setEncoding("utf-8")

module.exports = TCPClient