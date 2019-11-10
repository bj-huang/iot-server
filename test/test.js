let WebsocketServer = require('./../utils/websocketServer')
let TCPClient = require('./tcpClient')

function testStart () {
  // setTimeout(() => {

  // }, 2000);
  init()
}

function init () {
  let websocketServer = new WebsocketServer('3003')
  let tcpClient = null

  websocketServer.on('connection', (cb) => {
    cb('websocket connection success')
  })

  websocketServer.on('data', (data, cb) => {
    data = JSON.parse(data)
    function tcpClientInit () {
      tcpClient = new TCPClient('3001', data.data)
      tcpClient.on('open', () => {
        websocketServer.broadcast('已接入系统服务器')
      })
      tcpClient.on('HANDSHAKE_SUCCESS', () => {
        websocketServer.broadcast('握手成功')
      })
    }
    if (data.type == 'handCode') {
      if (tcpClient == null) {
        tcpClientInit()
      } else {
        tcpClient.destroy()
        setTimeout(() => {
          tcpClientInit()
        }, 100)
      }
    }
    if (data.type == 'send') {
      if (tcpClient == null) {
        websocketServer.broadcast('TCP 服务未连接')
      } else {
        websocketServer.broadcast('发送成功')
        tcpClient.send(data.data)
      }
    }
  })
}

module.exports = testStart