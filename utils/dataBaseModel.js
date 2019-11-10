let mongoose = require('mongoose')
let Device = require('./../models/deviceAccess')
let Data = require('./../models/data')
let Warning = require('./../models/warning')
let Report = require('./../models/report')


let connection = (url) => {
  return new Promise(function(resolve, reject){
    mongoose.connect(url)

    mongoose.connection.on("connected", function () {
      console.log("MongoDB connected success.")
      resolve()
    });
    
    mongoose.connection.on("error", function () {
      console.log("MongoDB connected fail.")
      reject()
    });
    
    mongoose.connection.on("disconnected", function () {
      console.log("MongoDB connected disconnected.")
    });
  });
}

// 获取接入的设备列表
let getDeviceList = () => {
  return new Promise(function(resolve, reject){
    Device.find({}, {deviceId:1, name:1}, (err, device) => {
      if(err)
        reject(err)
      else 
        resolve(device)
    })
  })
}

// 获取模型字典
let getModelDictionary = () => {
  return new Promise(function(resolve, reject){
    Data.find({}).populate({path: 'nodeId', select: '_id index name'}).populate({path: 'deviceId', select: '_id index name'}).exec((err, _data) => {
        if(err) {
          reject(err)
        } else {
          resolve(_data)
        }
    }) 
  })
}

// 保存告警
let saveWarning = ({ dataId, nodeId, deviceId, accessId, description }) => {
  return new Promise(function(resolve, reject){
    let warning = new Warning({ dataId, nodeId, deviceId, accessId, description })
    warning.save((err, _warning) => {
      if(err) {
        reject('error')
      } else {
        resolve('success')
      }
    })
  })
}

// 保存上报数据
let saveData = ({ dataId, nodeId, deviceId, accessId, original, value }) => {
  return new Promise(function(resolve, reject){
    let report = new Report({ dataId, nodeId, deviceId, accessId, original, value })
    report.save((err, _report) => {
      if(err) {
        reject('error')
      } else {
        resolve('success')
      }
    })
  })
}

exports.connection = connection
exports.getDeviceList = getDeviceList
exports.getModelDictionary = getModelDictionary
exports.saveWarning = saveWarning
exports.saveData = saveData