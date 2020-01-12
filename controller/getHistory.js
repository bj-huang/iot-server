let xlsx = require('node-xlsx').default;
let fs = require('fs')
let dayjs = require('dayjs')
let path = require('path')
let Warning = require('../models/warning')
let Report = require('../models/report')
let Data = require('../models/data')
let { statusCode } = require('../config')
const pageSize = 10

exports.getHistoryData = function(req, res, next){
    let page = 1
    let params = {}
    if(req.query) {
        if(req.query.deviceId) params.accessId = req.query.deviceId
        if(req.query.nodeId) params.nodeId = req.query.nodeId
        if(req.query.dataId) params.dataId = req.query.dataId
        if(req.query.page) page = req.query.page
    }
    Report.count(params, (err, count) => {
        if(err) {
            res.json({
                status: statusCode.ERROR
            })
        } else {
            let report = Report.find(params, 'original time value')
            report.skip((page - 1) * pageSize).limit(pageSize)
            report.sort({'_id':-1}).populate('nodeId', 'name').populate('dataId', 'name').exec((err, _report) => {
                if(err) {
                    res.json({
                        status: statusCode.ERROR
                    })
                } else {
                    res.json({
                        status: statusCode.SUCCESS,
                        result: _report,
                        count
                    })
                }
            }) 
        }
    })
}

exports.getHistoryWarning = function(req, res, next){
    let page = 1
    let params = {}
    if(req.query) {
        if(req.query.deviceId) params.accessId = req.query.deviceId
        if(req.query.nodeId) params.nodeId = req.query.nodeId
        if(req.query.dataId) params.dataId = req.query.dataId
        if(req.query.page) page = req.query.page
    }
    Warning.count(params, (err, count) => {
        if(err) {
            res.json({
                status: statusCode.ERROR
            })
        } else {
            Warning.find(params, 'description time').skip((page - 1) * pageSize).limit(pageSize).sort({'_id':-1}).populate('nodeId', 'name').populate('dataId', 'name').exec((err, _report) => {
                if(err) {
                    res.json({
                        status: statusCode.ERROR
                    })
                } else {
                    res.json({
                        status: statusCode.SUCCESS,
                        result: _report,
                        count
                    })
                }
            }) 
        }
    })
}

exports.analysis = function(req, res, next){
    let params = {}
    let dateGroup = {}
    if(req.query) {
        if(req.query.deviceId) params.accessId = req.query.deviceId
        if(req.query.nodeId) params.nodeId = req.query.nodeId
        if(req.query.dataId) params.dataId = req.query.dataId
        if(Array.isArray(req.query.date) && req.query.date.length == 2) {
            if((req.query.date[0] > req.query.date[1])) {
                dateGroup.startDate = new Date(req.query.date[1])
                dateGroup.endDate = new Date(req.query.date[0])
            } else {
                dateGroup.startDate = new Date(req.query.date[0])
                dateGroup.endDate = new Date(req.query.date[1])
            }
            dateGroup.endDate.setHours(23)
            dateGroup.endDate.setMinutes(59)
            dateGroup.endDate.setSeconds(59)
            dateGroup.startDate.setHours(00)
            dateGroup.startDate.setMinutes(00)
            dateGroup.startDate.setSeconds(00)
        }
    }

    if(params.accessId && params.nodeId && params.dataId && dateGroup.startDate && dateGroup.endDate) {
        Report.count(params, (err, count) => {
            if(err) {
                res.json({
                    status: statusCode.ERROR
                })
            } else {
                Data.find({_id: params.dataId}, 'calculate dataType name').exec((err, _data) => {
                    if(err) {
                        res.json({
                            status: statusCode.ERROR
                        })
                    } else {
                        if(Array.isArray(_data) && _data.length == 1) {
                            let report = Report.find({ ...params, "time": { $gte: dateGroup.startDate, $lte: dateGroup.endDate } }, 'value time')
                            report.sort({'_id':1}).exec((err, _report) => {
                                if(err) {
                                    res.json({
                                        status: statusCode.ERROR
                                    })
                                } else {
                                    res.json({
                                        status: statusCode.SUCCESS,
                                        result: _report,
                                        count,
                                        dataInf: _data[0]
                                    })
                                }
                            })
                        } else {
                            res.json({
                                status: statusCode.ERROR
                            })
                        }
                    }
                })
                 
            }
        })
    } else {
        res.json({
            status: statusCode.ERROR_PARAMS,
            result: {
                params,
                dateGroup
            }
        })
    }
}

exports.exportExcel = function(req, res){
    let page = 1
    let params = {}
    if(req.query) {
        if(req.query.deviceId) params.accessId = req.query.deviceId
        if(req.query.nodeId) params.nodeId = req.query.nodeId
        if(req.query.dataId) params.dataId = req.query.dataId
    }
    Report.count(params, (err, count) => {
        if(err) {
            res.json({
                status: statusCode.ERROR
            })
        } else {
            let report = Report.find(params, 'original time value')
            report.sort({'_id':-1}).populate('nodeId', 'name').populate('dataId', 'name').exec((err, _report) => {
                if(err) {
                    res.json({
                        status: statusCode.ERROR
                    })
                } else {
                    let excelData = _report.map(({dataId, nodeId, original, value, time}) => [nodeId.name, dataId.name , original, value, dayjs(time).format('YYYY-MM-DD HH:mm:ss')])
                    excelData.unshift(['节点名称', '数据名称','原始值','转换值','时间'])
                    var buffer = xlsx.build([{name: "历史数据", data:excelData}], {'!cols': [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]});
                    fs.writeFileSync(path.resolve(__dirname, './../public/file/history.xlsx'), buffer)
                    res.json({
                        status: statusCode.SUCCESS,
                        result: '/file/history.xlsx'
                    })
                }
            }) 
        }
    })
}
