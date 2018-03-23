const mongoose = require('mongoose')
mongoose.Promise = Promise // Use the included Promise implementation instead of mpromise

const MONGO_URL = process.env.DEBUG === 'localhost'
  ? 'mongodb://localhost:27017/kassandra'
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

const dedupeCycles = () => Cycle.aggregate([{
  $match: {
    isVisible: true
  }
}, {
  $group: {
    _id: {
      match: '$match',
      team: '$team',
      teleop: '$teleop',
      auto: '$auto',
      techFoul: '$techFoul',
      comments: '$comments'
    },
    cycleCount: { $sum: 1 },
    dups: { $push: '$_id' }
  }
}, {
  $match: {
    cycleCount: { $gt: 1 }
  }
}]).then(docs => {
  return docs.map(doc => {
    doc.dups.shift()
    return doc.dups
  }).reduce((p, c) => p.concat(c), [])
}).then(dupsIds => Cycle.update({ _id: { $in: dupsIds } }, { $set: { isVisible: false } }, { multi: true }))

const climbMap = ['Didn\'t Try', 'Failed', 'Successful']
const formatCsvOutput = cycle => ([
  '', // Full Name
  cycle.team,
  cycle.match,
  cycle.auto.autoRun ? 'TRUE' : 'FALSE',
  'FALSE', // Auto Exchange
  cycle.auto.switch,
  0, // Auto Switch Fails
  cycle.auto.scale,
  0, // Auto Scale Fails
  '', // Collection
  cycle.teleop.switch,
  0, // Teleop Switch Fails
  cycle.teleop.scale,
  0, // Teleop Scale Fails
  cycle.teleop.exchange,
  0, // Teleop Exchange Fails
  cycle.teleop.platform ? 'TRUE' : 'FALSE',
  climbMap[cycle.teleop.climb],
  climbMap[cycle.teleop.partnerClimb],
  cycle.techFoul ? 'TRUE' : 'FALSE',
  '', // Defense Comments
  cycle.comments
])

const connect = () => mongoose.connect(MONGO_URL)

module.exports = {
  formatCsvOutput,
  dedupeCycles,
  MONGO_URL,
  connect,
  Cycle
}
