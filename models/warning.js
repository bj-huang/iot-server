let mongoose = require('mongoose')
let Schema = mongoose.Schema;
let ObjectId = mongoose.Schema.Types.ObjectId

let WarningSchema = new Schema({
  description: {
    type: String,
    required: true
  },
  deviceId: {
    type: ObjectId,
    ref: 'Devices',
    required: true
  },
  nodeId: {
    type: ObjectId,
    ref: 'Nodes',
    required: true
  },
  dataId: {
    type: ObjectId,
    ref: 'Datas',
    required: true
  },
  accessId: {
    type: ObjectId,
    ref: 'Access',
    required: true
  },
  time: {
    type: Date,
    default: Date.now()
  },
  dispose: {
    type: Boolean,
    default: false
  }
})

WarningSchema.pre('save', function (next) {
  if (this.isNew) {
    this.time = Date.now()
  } else {
    this.time = Date.now()
  }
  next()
})

//静态方法，在model层可使用这个方法，不需要new 实例化
WarningSchema.statics = {
  fetch: function (cb) {
    return this
      .find({})
      .exec(cb)//执行callback
  },
  findById: function (id, cb) {
    return this
      .findOne({ _id: id })
      .exec(cb)//执行callback
  }
}

module.exports = mongoose.model('Warnings', WarningSchema);
