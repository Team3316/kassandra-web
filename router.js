const { Router } = require('express')
const { join } = require('path')
const router = Router()

const {
  newCycle,
  getAllTeams,
  exportCycles,
  getCycleById,
  setCycleVisibility,
  getCyclesByTeam,
  hideDuplicates,
  getCsvOutput,
  getCsvByTeam,
  getTeamsAverages,
  getRankings,
  setRankings
} = require('./db/routes')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.header('Keep-Alive', 'timeout=15, max=100')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With')
  res.header('Cache-Control', 'no-cache')
  res.render(join(__dirname, 'index.html'))
})

router.get('/hide_duplicates', hideDuplicates)

router.get('/export_cycles', exportCycles)

router.get('/get_cycle/:id', getCycleById)

router.get('/hide_cycle/:id', setCycleVisibility(false))

router.get('/unhide_cycle/:id', setCycleVisibility(true))

router.get('/get_cycles_by_team/:id', getCyclesByTeam(false))

router.get('/get_all_cycles_by_team/:id', getCyclesByTeam(true))

router.get('/get_all_teams', getAllTeams)

router.get('/get_csv', getCsvOutput)

router.get('/get_csv/:team', getCsvByTeam)

router.post('/new_cycle', newCycle)

router.get('/get_teams_averages', getTeamsAverages)

router.get('/rankings', getRankings)

router.post('/rankings', setRankings)

router.get('/eventname', (req, res, next) => res.send(process.env.EVENTNAME))

module.exports = router
