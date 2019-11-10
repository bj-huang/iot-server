let Device = require('../models/device')
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

exports.postNode = function(req, res, next){
    if(req.body && req.body.deviceId) {
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
                    let params = {deviceId: req.body.deviceId, index: req.body.index}
                    Node.find(params).exec((err, oNode) => {
                        if(err) {
                            res.json({
                                status: statusCode.ERROR
                            })
                        } else {
                            if(Array.isArray(oNode) && oNode.length > 0) {
                                res.json({
                                    status: statusCode.ERROR_UNIQUE,
                                    result: oNode
                                })
                            } else {
                                let node = new Node({
                                    ...req.body
                                })
                                node.save((err, _node) => {
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
                                            result: _node
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

exports.deleteNode = function(req, res, next){
    if(req.body && req.body._id) {
        let _id = req.body._id
        Data.remove({nodeId: _id}).exec((err, _data) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                Node.remove({_id: _id}).exec((err, _node) => {
                    if(err) {
                        res.json({
                            status: statusCode.ERROR
                        })
                    } else {
                        res.json({
                            status: statusCode.SUCCESS,
                            result: {
                                node: _node,
                                data: _data
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

exports.putNode = function(req, res, next){
    if(req.body && req.body._id) {
        let params = {deviceId: req.body.deviceId, index: req.body.index}
        Node.find(params).exec((err, oNode) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                if(Array.isArray(oNode) && oNode.length > 0 && oNode[0]._id != req.body._id) {
                    res.json({
                        status: statusCode.ERROR_UNIQUE,
                        result: oNode
                    })
                } else {
                    Node.findById(req.body._id, (err, node) => {
                        if(err) {
                            res.json({
                                status: statusCode.ERROR
                            })
                        } else {
                            copyData(req.body, node)
                            node.save((err, _node) => {
                                if(err) {
                                    res.json({
                                        status: statusCode.ERROR
                                    })
                                } else {
                                    res.json({
                                        status: statusCode.SUCCESS,
                                        result: _node
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

exports.getNode = function(req, res, next){
    if(req.query && req.query.deviceId) {
        Node.find({deviceId: req.query.deviceId}).exec((err, _node) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                res.json({
                    status: statusCode.SUCCESS,
                    result: _node
                })
            }
        }) 
    } else {
        res.json({
            status: statusCode.ERROR_PARAMS
        })
    }
}


