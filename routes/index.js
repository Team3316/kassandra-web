const { Router } = require('express')
const { join } = require('path')
const mongo = require('../db/mongo.js')
const router = Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.header('Keep-Alive', 'timeout=15, max=100')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With')
  res.header('Cache-Control', 'no-cache')
  res.render(join(__dirname, 'index.html'))
})

router.get('/get_cycles', (req, res, next) => mongo.getCycles(res))

router.get('/export_cycles', (req, res, next) => mongo.exportCycles(res))

router.get('/get_cycle/:id', (req, res, next) => mongo.getCycle(res, req.params.id))

router.get('/hide_cycle/:id', (req, res, next) => mongo.hideCycle(res, req.params.id))

router.get('/unhide_cycle/:id', (req, res, next) => mongo.unhideCycle(res, req.params.id))

router.get('/get_cycles_by_team/:id', (req, res, next) => mongo.getCyclesByTeam(res, req.params.id, false))

router.get('/get_all_cycles_by_team/:id', (req, res, next) => mongo.getCyclesByTeam(res, req.params.id, true))

router.get('/get_all_teams', (req, res, next) => mongo.getAllTeams(res))

router.post('/new_cycle', (req, res, next) => mongo.newCycle(res, req.param('cycle_data')))

router.get('/eventname', (req, res, next) => res.send(process.env.EVENTNAME))

module.exports = router
