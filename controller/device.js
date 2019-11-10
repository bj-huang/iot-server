let Device = require('../models/device')
let Access = require('../models/deviceAccess')
let Node = require('../models/node')
let Data = require('../models/data')
let { statusCode } = require('./../config')

function copyData(from, to){
    for (const key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = to[key] ? from[key] : to[key]
        }
    }
}

exports.postDevice = function(req, res, next){
    if(req.body) {
        if(req.body._id != undefined) {
            delete req.body._id
        }
        let params = {deviceId: req.body.deviceId, index: req.body.index}
        Device.find(params).exec((err, oDevice) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                if(Array.isArray(oDevice) && oDevice.length > 0) {
                    res.json({
                        status: statusCode.ERROR_UNIQUE,
                        result: oDevice
                    })
                } else {
                    let device = new Device({
                        ...req.body
                    })
                    device.save((err, _device) => {
                        if(err) {
                            if(err.code == 11000) {
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
                                result: _device
                            })
                        }
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

exports.deleteDevice = function(req, res, next){
    if(req.body && req.body._id) {
        let _id = req.body._id
        Data.remove({deviceId: _id}).exec((err, _data) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                Node.remove({deviceId: _id}).exec((err, _node) => {
                    if(err) {
                        res.json({
                            status: statusCode.ERROR
                        })
                    } else {
                        Access.remove({deviceId: _id}).exec((err, _node) => {
                            if(err) {
                                res.json({
                                    status: statusCode.ERROR
                                })
                            } else {
                                Device.remove({_id: _id}).exec((err, _device) => {
                                    if(err) {
                                        res.json({
                                            status: statusCode.ERROR
                                        })
                                    } else {
                                        res.json({
                                            status: statusCode.SUCCESS,
                                            result: _device
                                        })
                                    }
                                })
                            }
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

exports.putDevice = function(req, res, next){
    if(req.body && req.body._id) {
        let params = {index: req.body.index}
        Device.find(params).exec((err, oDevice) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                if(Array.isArray(oDevice) && oDevice.length > 0 && oDevice[0]._id != req.body._id) {
                    res.json({
                        status: statusCode.ERROR_UNIQUE,
                        result: oDevice
                    })
                } else {
                    Device.findById(req.body._id, (err, device) => {
                        if(err) {
                            res.json({
                                status: statusCode.ERROR
                            })
                        } else {
                            copyData(req.body, device)
                            device.save((err, _device) => {
                                if(err) {
                                    res.json({
                                        status: statusCode.ERROR
                                    })
                                } else {
                                    res.json({
                                        status: statusCode.SUCCESS,
                                        result: _device
                                    })
                                }
                            })
                        }
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

exports.getDevice = function(req, res, next){
    Device.fetch(function(err, _device){
        if(err) {
            res.json({
                status: statusCode.ERROR
            })
        } else {
            res.json({
                status: statusCode.SUCCESS,
                result: _device
            })
        }
    })
}