let Access = require('../models/deviceAccess')
let Device = require('../models/device')
let { statusCode } = require('../config')
let { clearDataCache } = require('./../utils/dataParse')

function copyData (from, to) {
  for (const key in from) {
    if (from.hasOwnProperty(key)) {
      to[key] = to[key] ? from[key] : to[key]
    }
  }
}

exports.postDeviceAccess = function (req, res, next) {
  if (req.body) {
    if (req.body._id != undefined) {
      delete req.body._id
    }
    Device.findById(req.body.deviceId, (err, device) => {
      if (err) {
        res.json({
          status: statusCode.ERROR
        })
      } else {
        if (device) {
          let access = new Access({
            ...req.body
          })
          access.save((err, _access) => {
            if (err) {
              if (err.code == 11000) {
                res.json({
                  status: statusCode.ERROR_UNIQUE
                })
              } else {
                res.json({
                  status: statusCode.ERROR
                })
              }
            } else {
              res.json({
                status: statusCode.SUCCESS,
                result: _access
              })
            }
          })
        } else {
          res.json({
            status: statusCode.ERROR_PARAMS
          })
        }
      }
    })
  } else {
    res.json({
      status: statusCode.ERROR_PARAMS
    })
  }
}

exports.deleteDeviceAccess = function (req, res, next) {
  if (req.body && req.body._id) {
    let _id = req.body._id
    Access.remove({ _id: _id }).exec((err, _access) => {
      if (err) {
        res.json({
          status: statusCode.ERROR
        })
      } else {
        clearDataCache()
        res.json({
          status: statusCode.SUCCESS,
          result: _access
        })
      }
    })
  } else {
    res.json({
      status: statusCode.ERROR_PARAMS
    })
  }
}

exports.putDeviceAccess = function (req, res, next) {
  if (req.body && req.body._id) {
    Access.findById(req.body._id, (err, access) => {
      if (err) {
        res.json({
          status: statusCode.ERROR
        })
      } else {
        copyData(req.body, access)
        access.save((err, _access) => {
          if (err) {
            res.json({
              status: statusCode.ERROR
            })
          } else {
            res.json({
              status: statusCode.SUCCESS,
              result: _access
            })
          }
        })
      }
    })
  } else {
    res.json({
      status: statusCode.ERROR_PARAMS
    })
  }
}

exports.getDeviceAccess = function (req, res, next) {
  Access.find({}).populate({ path: 'deviceId', select: 'name' }).exec(function (err, _access) {
    if (err) {
      res.json({
        status: statusCode.ERROR
      })
    } else {
      res.json({
        status: statusCode.SUCCESS,
        result: _access
      })
    }
  })
}
