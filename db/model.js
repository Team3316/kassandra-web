const mongoose = require('mongoose')
mongoose.Promise = Promise // Use the included Promise implementation instead of mpromise

const MONGO_URL = process.env.DEBUG === 'localhost'
  ? 'localhost:27017/kassandra'
  : process.env.MONGODB_URI

const collection = `cycles_${process.env.EVENTNAME}`
const cycleSchema = new mongoose.Schema({
  match: String,
  team: Number,
  auto: {
    autoRun: Boolean,
    switch: Number,
    switchFail: Number,
    scale: Number,
    scaleFail: Number
  },
  teleop: {
    collectFloor: Boolean,
    collectPortal: Boolean,
    collectPyramid: Boolean,
    exchange: Number,
    exchangeFail: Number,
    switch: Number,
    switchFail: Number,
    scale: Number,
    scaleFail: Number,
    platform: Boolean,
    climb: Number,
    partnerClimb: Number
  },
  techFoul: Boolean,
  comments: String,
  isVisible: { type: Boolean, default: true }
}, { collection })

const Cycle = mongoose.model('Cycle', cycleSchema)

const connect = () => mongoose.connect(MONGO_URL)

module.exports = {
  MONGO_URL,
  connect,
  Cycle
}
