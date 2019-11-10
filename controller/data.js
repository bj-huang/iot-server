let Device = require('../models/device')
let Node = require('../models/node')
let Data = require('../models/data')
let { statusCode } = require('./../config')

function copyData(from, to){
    for (const key in from) {
        if (from.hasOwnProperty(key)) {
            to[key] = to[key] != undefined ? from[key] : to[key]
        }
    }
}

exports.postData = function(req, res, next){
    if(req.body && req.body.deviceId && req.body.nodeId) {
        if(req.body._id != undefined) {
            delete req.body._id
        }
        Device.findById(req.body.deviceId, (err, device) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                if(device) {
                    Node.findById(req.body.nodeId, (err, node) => {
                        if(err) {
                            res.json({
                                status: statusCode.ERROR
                            })
                        } else {
                            if(node) {
                                let params = {nodeId: req.body.nodeId, index: req.body.index}
                                Data.find(params).exec((err, oData) => {
                                    if(err) {
                                        res.json({
                                            status: statusCode.ERROR
                                        })
                                    } else {
                                        if(Array.isArray(oData) && oData.length > 0) {
                                            res.json({
                                                status: statusCode.ERROR_UNIQUE,
                                                result: oData
                                            })
                                        } else {
                                            let data = new Data({
                                                ...req.body
                                            })
                                            data.save((err, _data) => {
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
                                                        result: _data
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

exports.deleteData = function(req, res, next){
    if(req.body && req.body._id) {
        Data.remove({_id: req.body._id}).exec((err, _data) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                res.json({
                    status: statusCode.SUCCESS,
                    result: _data
                })
            }
        })
    } else {
        res.json({
            status: statusCode.ERROR_PARAMS
        })
    }
}

exports.putData = function(req, res, next){
    if(req.body && req.body._id) {
        let params = {nodeId: req.body.nodeId, index: req.body.index}
        Data.find(params).exec((err, oData) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                if(Array.isArray(oData) && oData.length > 0 && oData[0]._id != req.body._id) {
                    res.json({
                        status: statusCode.ERROR_UNIQUE,
                        result: oData
                    })
                } else {
                    Data.findById(req.body._id, (err, data) => {
                        if(err) {
                            res.json({
                                status: statusCode.ERROR
                            })
                        } else {
                            copyData(req.body, data)
                            data.save((err, _data) => {
                                if(err) {
                                    res.json({
                                        status: statusCode.ERROR
                                    })
                                } else {
                                    res.json({
                                        status: statusCode.SUCCESS,
                                        result: _data
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

exports.getData = function(req, res, next){
    let params = {}
    if(req.query) {
        if(req.query.deviceId) params.deviceId = req.query.deviceId
        if(req.query.nodeId) params.nodeId = req.query.nodeId
    }
    Data.find(params).populate('nodeId').populate('deviceId').exec((err, _data) => {
        if(err) {
            res.json({
                status: statusCode.ERROR
            })
        } else {
            res.json({
                status: statusCode.SUCCESS,
                result: _data
            })
        }
    }) 
}


