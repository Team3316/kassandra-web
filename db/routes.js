const {
  Cycle,
  getAverages,
  dedupeCycles,
  formatCsvOutput
} = require('./model')

const newCycle = (req, res, next) => {
  const cycle = new Cycle(req.body.cycleData)
  cycle.save().then(doc => res.json(doc))
}

const getAllTeams = (req, res) => Cycle.distinct('team', {})
  .then(teams => res.json(teams))

const exportCycles = (req, res) => Cycle.find({ isVisible: true })
  .then(cycles => res.json(cycles))

const getCycleById = (req, res) => Cycle.findOne({ _id: req.params.id })
  .then(cycle => res.json(cycle))

const setCycleVisibility = (hideStatus) => (req, res) => Cycle.update({ _id: req.params.id }, { $set: { isVisible: hideStatus } })
  .then(cycle => res.json(cycle))

const getCyclesByTeam = (getAll) => (req, res) => {
  const visible = getAll ? {} : { isVisible: true }
  const query = { team: req.params.id, ...visible }
  return Cycle.find(query).then(docs => res.json(docs))
}

const hideDuplicates = (req, res, next) => dedupeCycles()
  .then(data => res.json(data))
  .catch(err => next(err))

const getCsvOutput = (req, res) => Cycle.find({ isVisible: true })
  .then(cycles => cycles.map(formatCsvOutput))
  .then(formatted => res.json(formatted))

const getCsvByTeam = (req, res) => Cycle.find({ isVisible: true, team: req.params.team })
  .then(cycles => cycles.map(formatCsvOutput))
  .then(formatted => res.json(formatted))

const getTeamsAverages = (req, res) => getAverages()
  .then(docs => res.json(docs))

module.exports = {
  newCycle,
  getAllTeams,
  exportCycles,
  getCycleById,
  setCycleVisibility,
  getCyclesByTeam,
  hideDuplicates,
  getCsvOutput,
  getCsvByTeam,
  getTeamsAverages
}
