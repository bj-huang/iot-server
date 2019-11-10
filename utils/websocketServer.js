
var ws = require('nodejs-websocket')
var events = require('events')

module.exports = class WebsockerServer extends events.EventEmitter {
  constructor (port) {
    super()

    this.port = port

    this.server = ws.createServer()
    this.server.on('connection', (conn) => {
      this.emit('connection', function (msg) {
        conn.sendText(msg)
      })
      conn.on('text', (data) => {
        this.emit('data', data, function (msg) {
          conn.sendText(msg)
        })
      })

      conn.on('close', (code, reason) => {
        this.emit('close', code)
      })
      conn.on('error', (code) => {
        // console.log('websocketServerError', code)
      })
    })
    this.server.listen(port, function () {
      console.log('WEBSOKET 服务监听 ' + port)
    })
  }

  broadcast (msg) {
    if (typeof msg !== 'string') msg = msg.toString()
    this.server.connections.forEach(function (conn) {
      conn.sendText(msg)
    })
  }
}
