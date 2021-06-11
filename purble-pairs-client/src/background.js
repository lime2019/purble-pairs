import { app, protocol,Menu, BrowserWindow,ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const path = require("path")
const net = require("net")
const tcpServerOptions = {
  // host : "81.69.59.56",
  host:"localhost",
  port : 6666
}
let mainWindow = null
let tcpClient = null
let lineStatus = true

Menu.setApplicationMenu(null)

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createMainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title : "Lime翻牌游戏",
    icon : "src/assets/logo.ico",
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
  return win
}

function createTCP(){
  const client = net.createConnection(tcpServerOptions)
  client.setEncoding("utf-8")
  return client
}

app.on('ready', async () => {
  mainWindow = await createMainWindow()
  tcpClient = await createTCP()
  tcpClient.on("error",(err) => {
    console.log("出现错误...")
  })
  tcpClient.on("connect",() => {
    console.log("连接上...")
    mainWindow.webContents.send("tcp",{
      type : "online",
      message : "TCP连接上..."
    })
  })
  tcpClient.on("close",() => {
    lineStatus = false 
    mainWindow.webContents.send("tcp",{
      type : "offline",
      message : "TCP连接断开..."
    })
    setTimeout(() => {
      console.log(`TCP连接重连中...`)
      tcpClient.connect(tcpServerOptions)
    },10000)
  })
  tcpClient.on("data",(receivedData) => {
    const receivedMsg = JSON.parse(receivedData)
    const { type } = receivedMsg
    if(type === "user"){
      mainWindow.webContents.send("user",{
        message : receivedMsg
      })
    }else if(type === "game"){
      mainWindow.webContents.send("game",{
        message : receivedMsg
      })
    }
  })
  // IPC监听
  ipcMain.handle("user",(event,msg) => {
    const { sort } = msg
    console.log(msg)
    if(sort === "logout"){
      tcpClient.end()
    }else{
      const sendMsg = JSON.stringify(msg)
      tcpClient.write(sendMsg)
    }
  })
})
