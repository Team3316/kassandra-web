const { Cycle } = require('./model')

const newCycle = (req, res, next) => {
  const cycle = new Cycle(req.body.cycleData)
  cycle.save().then(doc => res.json(doc))
}

const getAllTeams = (req, res) => Cycle.distinct('team', {})
  .then(teams => res.json(teams))

const getCycles = (req, res) => Cycle.find({})
  .then(cycles => res.json(cycles))

const exportCycles = (req, res) => Cycle.find({ isVisible: true })
  .then(cycles => res.json(cycles))

const getCycleById = (req, res) => Cycle.findOne({ _id: req.params.id })
  .then(cycle => res.json(cycle))

const shouldHideCycle = (hideStatus) => (req, res) => Cycle.update({ _id: req.params.id }, { isVisible: hideStatus })
  .then(cycle => res.json(cycle))

const getCyclesByTeam = (getAll) => (req, res) => {
  const visible = getAll ? {} : { isVisible: true }
  const query = { team: req.params.id, ...visible }
  return Cycle.find(query).then(docs => res.json(docs))
}

module.exports = {
  newCycle,
  getAllTeams,
  getCycles,
  exportCycles,
  getCycleById,
  shouldHideCycle,
  getCyclesByTeam
}
