let express = require('express');
let router = express.Router();

let { getDevice, postDevice, putDevice, deleteDevice } = require('../controller/device')
let { getNode, postNode, putNode, deleteNode } = require('../controller/node')
let { getData, postData, putData, deleteData } = require('../controller/data')
let { getDeviceAccess, postDeviceAccess, putDeviceAccess, deleteDeviceAccess } = require('../controller/deviceAccess')
let { getHistoryData, getHistoryWarning, analysis } = require('../controller/getHistory')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/device', getDevice);
router.post('/api/device', postDevice);
router.put('/api/device', putDevice);
router.delete('/api/device', deleteDevice);

router.get('/api/node', getNode);
router.post('/api/node', postNode);
router.put('/api/node', putNode);
router.delete('/api/node', deleteNode);

router.get('/api/data', getData);
router.post('/api/data', postData);
router.put('/api/data', putData);
router.delete('/api/data', deleteData);

router.get('/api/access', getDeviceAccess);
router.post('/api/access', postDeviceAccess);
router.put('/api/access', putDeviceAccess);
router.delete('/api/access', deleteDeviceAccess);

router.get('/api/history/data', getHistoryData);
router.get('/api/history/warning', getHistoryWarning);
router.get('/api/history/analysis', analysis);


module.exports = router;
