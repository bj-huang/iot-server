let mongoose = require('mongoose')
let Schema = mongoose.Schema;
let ObjectId = mongoose.Schema.Types.ObjectId

let NodeSchema = new Schema({
  name: {
    type: String,
    // unique: true,
    required: true
  },
  index: {
    type: Number
  },
  description: {
    type: String
  },
  deviceId: {
    type: ObjectId,
    ref: 'Devices',
    required: true
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

NodeSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }
  next()
})

//静态方法，在model层可使用这个方法，不需要new 实例化
NodeSchema.statics = {
  fetch: function (cb) {
    return this
      .find({}, 'name description')
      .sort('meta.updateAt')
      .exec(cb)//执行callback
  },
  findById: function (id, cb) {
    return this
      .findOne({ _id: id })
      .exec(cb)//执行callback
  }
}

module.exports = mongoose.model('Nodes', NodeSchema);
