const net = require('net')
const events = require('events')
const ip = require('internal-ip')

module.exports = class TCPClient extends events.EventEmitter {
  constructor (port, handCode) {
    super()
    this.port = port
    // 创建TCP客户端
    this.client = new net.Socket()
    this.client.setEncoding('utf8')
    ip.v4().then(ip => {
      this.client.connect(port, ip, () => {
        this.emit('open')
        // console.log('客户端已连接到服务器');
      })
      this.client.on('data', (data) => {
        if (data == 'HHS&HANDSHAKE&FF') {
          // 发送 设备id 进行握手
          this.client.write('HHS&' + handCode + '&FF')
        } else if (data == 'HHS&SUCCESS&FF') {
          this.emit('HANDSHAKE_SUCCESS')
        } else {
          this.emit('DATA', data)
        }
        // console.log('已接受服务器端发送的数据：' + data);
      })
      // 监听与服务端连接的错误事件
      this.client.on('error', function (err) {
        console.log('在于服务器连接或通信过程中发生了一个错误，错误代码为%s', err.code)
        this.client && this.client.destroy()
      })
      this.client.on('close', function () {
        console.log('服务器端主动断开连接')
        this.client && this.client.destroy()
      })
    })
  }
  send (msg) {
    this.client.write(msg)
  }
  destroy () {
    this.client && this.client.destroy()
  }
}
