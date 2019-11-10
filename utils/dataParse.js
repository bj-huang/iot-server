let { getModelDictionary, getDeviceList, saveWarning, saveData } = require('./dataBaseModel')
let modelDictionary = {}
let deviceDictionary = {}
let dataCache = {}
let warningCache = {}

exports.dataParse = function (id, data) {
  if (id) {
    let warningList = []
    let dataList = []
    let saveSuccess = []
    data.forEach(element => {
      // 将数据按照 : 分割为 id[0] 和 data[1]
      let result = element.split(':')
      if (Array.isArray(result) && result.length === 2) {
        // 根据id 到字典中查出必要的信息
        let item = modelDictionary[result[0]]
        if (item && deviceDictionary[id]) {
          // 深拷贝
          item = JSON.parse(JSON.stringify(item))
          item.accessId = id
          item.description = deviceDictionary[id].name + item.description
          // 取出上报的数据 并转换为数字类型
          let value = parseFloat(result[1])
          // 赋值
          item.original = value
          // 根据数据的类型不同 以不同的方式判断告警 和数据处理
          switch (item.dataType) {
            case 'analog':
              item.value = value
              if ((item.warningRules.max !== undefined && value > item.warningRules.max) || (item.warningRules.min !== undefined && value < item.warningRules.min)) {
                item.warning = true
              } else {
                item.warning = false
              }
              break
            case 'key':
              let _value = item.parseRules[result[1]]
              item.value = _value !== undefined ? _value : '--'
              if (item.warningRules[result[1]]) {
                item.warning = true
                item.description = item.description + ' ( ' + item.warningRules[result[1]] + ' )'
              } else {
                item.warning = false
              }
              break
            default:
              break
          }

          if (item.value !== '--') {
            // 数据缓存
            dataCache[item.dataId] = item
            // 数据入库
            saveSuccess.push(saveData(item))
          }
          let pushData = {
            id: item.dataId,
            original: item.original,
            value: item.value,
            description: item.description,
            warning: item.warning
          }
          dataList.push(pushData)
          // 告警缓存机制 保证多次报警只有第一次被相应 直到恢复正常后 再次告警才会被处理
          if (item.warning === false) {
            warningCache[item.dataId] = false
          } else {
            // 是告警 但并不是第一次告警 不做处理
            if (warningCache[item.dataId]) {
            } else {
              // 首次告警 入库
              saveSuccess.push(saveWarning(item))
              // 返回告警消息
              warningList.push(pushData)
            }
            warningCache[item.dataId] = true
          }
        } else {
          // 收到意外的数据
        }
      } else {
        // 数据不符合通信协议
      }
    })
    return new Promise(function (resolve, reject) {
      Promise.all(saveSuccess).then((result) => {
        resolve({ dataList, warningList })
      }).catch((err) => {
        reject(err)
      })
    })
  } else {
    // 调用时参数错误
  }
}

// 更新数据字典
exports.updateDictionary = function () {
  // 获取接入设备字典
  getDeviceList().then(deviceList => {
    deviceList.forEach(device => {
      deviceDictionary[device._id] = device
    })
    // 获取模型的字典
    getModelDictionary().then(modelList => {
      modelList.forEach(element => {
        // console.log(element)
        let key = `${element.deviceId.index}_${element.nodeId.index}_${element.index}`
        let access = {}
        // for (const device in deviceDictionary) {
        //     if (deviceDictionary.hasOwnProperty(device)) {
        //         const item = deviceDictionary[device];
        //         if(parseInt(item.deviceId) == parseInt(element.deviceId._id)) {
        //             access = item
        //         }
        //     }
        // }
        modelDictionary[key] = {
          dataId: element._id,
          nodeId: element.nodeId._id,
          deviceId: element.deviceId._id,
          // accessId: access._id,
          dataName: element.name,
          description: `${element.nodeId.name} - ${element.name} 报警`,
          dataType: element.dataType,
          warningRules: {}
        }
        switch (element.dataType) {
          case 'analog':
            if (Array.isArray(element.calculate) && element.calculate.length == 1) {
              if (element.calculate[0].warningMin != undefined) modelDictionary[key].warningRules.min = element.calculate[0].warningMin
              if (element.calculate[0].warningMax != undefined) modelDictionary[key].warningRules.max = element.calculate[0].warningMax
            }
            break
          case 'key':
            if (Array.isArray(element.calculate) && element.calculate.length > 0) {
              modelDictionary[key].parseRules = {}
              element.calculate.forEach(item => {
                modelDictionary[key].parseRules[item.key] = item.value
                if (item.warning) modelDictionary[key].warningRules[item.key] = item.value
              })
            }
            break
          default:
            break
        }
      })
    })
  })
}

// 获取数据缓存
exports.getDataCache = function () {
  let cache = []
  for (const key in dataCache) {
    if (dataCache.hasOwnProperty(key)) {
      const item = dataCache[key]
      let pushData = {
        id: item.dataId,
        original: item.original,
        value: item.value,
        description: item.description,
        warning: item.warning
      }
      cache.push(pushData)
    }
  }
  return cache
}

// 清理数据缓存
exports.clearDataCache = function () {
  dataCache = {}
}
