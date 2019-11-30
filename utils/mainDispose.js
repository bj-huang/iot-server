let TcpServer = require('./tcpServer')
let WebsocketServer = require('./websocketServer')
let DBM = require('./dataBaseModel')
let { dataParse, getDataCache, updateDictionary } = require('./dataParse')

let mainDispose = () => {
  DBM.connection('mongodb://smart:123456@localhost/smart').then(() => {
    systemStart()
  }).catch(() => {

  })
}

function systemStart () {
  let tcpServer = new TcpServer('3001')
  let websocketServer = new WebsocketServer('3002')
  updateDictionary()

  /**
     * tcp 服务器 数据处理
     */
  // 设置白名单 入库的设备才能接入 否则将无法接入tcp服务
  updateDeviceAccessList(tcpServer)

  tcpServer.on('connection', (id) => {
    websocketServer.broadcast('{status: "100", msg: "设备接入", id: ' + id + '}')
  })

  tcpServer.on('data', (id, data) => {
    dataParse(id, data).then(({ dataList, warningList }) => {
      if (Array.isArray(dataList) && dataList.length > 0) {
        let message = {
          status: '200',
          type: 'data',
          id,
          data: dataList
        }
        websocketServer.broadcast(JSON.stringify(message))
      }

      if (Array.isArray(warningList) && warningList.length > 0) {
        let message = {
          status: '200',
          type: 'warning',
          id,
          data: warningList
        }
        websocketServer.broadcast(JSON.stringify(message))
      }
    }).catch((err) => {
      console.log(err)
    })
  })

  tcpServer.on('unallowed_connection', function (id) {
    console.log(id, 'unallowed_connection')
  })

  tcpServer.on('close', (id) => {
    console.log(id, 'close')
    // websocketServer.broadcast('{status: "300", msg: "设备已离线"}')
  })
  /**
     * websolket 服务器 数据处理
     */

  websocketServer.on('connection', (cb) => {
    let cache = getDataCache()
    let message = {
      status: '200',
      type: 'data',
      id: 'all',
      data: cache
    }
    cb(JSON.stringify(message))
  })

  websocketServer.on('data', (data, cb) => {
    let parseData = data.split('&')
    if (parseData[0] === 'HHC' && parseData[parseData.length - 1] === 'FF') {
      // 控制指令
      let success = tcpServer.send(data)
      if (success) {
        websocketServer.broadcast('{status: "200", msg: "更新设备状态"}')
      } else {
        cb('{status: "500", msg: "更新失败"}')
      }
    } else {
      switch (data) {
        case 'REQUEST':
          let cache = getDataCache()
          let message = {
            status: '200',
            type: 'data',
            id: 'all',
            data: cache
          }
          cb(JSON.stringify(message))
          break
        case 'REST_WRITE_LIST':
          updateDeviceAccessList(tcpServer)
          break
        default:
          cb('{status: "200", msg: "收到心跳"}')
          break
      }
    }
  })
}

// 更新tcp服务器白名单
function updateDeviceAccessList (server) {
  DBM.getDeviceList().then((device) => {
    let whiteList = {}
    device.forEach(element => {
      whiteList[element._id] = element.name
    })
    server.whiteList = whiteList
  }).catch(() => {
    console.log('err', '更新白名单失败，请检查数据库')
  })
}

module.exports = mainDispose
