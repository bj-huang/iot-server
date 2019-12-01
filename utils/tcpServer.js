const net = require('net')
const events = require('events')
const ip = require('internal-ip')

module.exports = class TCPServer extends events.EventEmitter {
  constructor (port) {
    super()
    this.port = port
    this.handshake = 'HHS&HANDSHAKE&FF'
    this.timeout = 10000
    this.whiteList = {}

    this.connectionCount = 0
    this.socket = {}
    this.socketConnectBuffer = {}
    this.server = net.createServer()
    this.server.maxConnections = 100

    this.server.on('listening', async () => {
      var host = await ip.v4()
      console.log(`TCP 服务监听 ${host}:${this.port}`)
    })
    this.server.on('connection', socket => {
      socket.on('error', e => {
        console.log('tcpServerError', e)
        // this.emit('error', `connect error: ${e.stack}`)
      })
      socket.on('data', data => {
        let parseData = data.toString().split('&')
        if (parseData.length > 2) {
          let header = parseData.shift()
          let footer = parseData.pop()
          // 判断包头包尾
          if (header.indexOf('HH') == 0 && footer == 'FF') {
            switch (header) {
              case 'HHS':
                if (socket.check) {
                  let id = parseData[0]
                  if (this.socket[id]) {
                    // 该id已被占用
                    socket.write('HHE&HAVEEXISTED&FF')
                    socket.destroy()
                  } else {
                    if (this.whiteList[id]) {
                      // 握手成功 维护socket
                      this.socket[id] = socket
                      this.connectionCount++
                      socket.id = id
                      socket.write('HHS&SUCCESS&FF')
                      this.emit('connection', id)
                    } else {
                      socket.destroy()
                      this.emit('unallowed_connection', id)
                    }
                  }
                  clearTimeout(socket.timer)
                  delete socket.check
                }
                break
              case 'HHD':
                this.emit('data', socket.id, parseData)
                break
              default:
                break
            }
          }
        }
      })
      socket.on('end', () => {
        this.emit('close', socket.id)
        delete this.socket[socket.id]
        this.connectionCount--
      })
      // 校验标记 未回复握手将断开连接
      socket.check = true
      // 发送握手指令
      socket.write(this.handshake)
      // 超时将断开连接
      socket.timer = setTimeout(() => {
        socket.destroy()
      }, this.timeout)
    })
    this.server.on('close', () => {
      console.log('TCP server closed')
    })
    this.server.listen(this.port)
  }
  send (id, msg) {
    if (this.connectionCount > 0) {
      let sendSocket = this.socket[id]
      if (sendSocket) {
        sendSocket.write(msg)
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
}
