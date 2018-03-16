var express = require('express');
var http = require('http');
var mongo = require('../db/mongo.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.header('Keep-Alive', 'timeout=15, max=100');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  res.header('Cache-Control', 'no-cache');
  res.render(__dirname + "index.html");
});

router.get('/get_cycles', function(req, res, next) {
  mongo.getCycles(res);
  });

router.get('/get_cycle/:id', function(req, res, next) {
  mongo.getCycle(res, req.params.id);
});

router.get('/hide_cycle/:id', function(req, res, next) {
  mongo.hideCycle(res, req.params.id);
});

router.get('/unhide_cycle/:id', function(req, res, next) {
  mongo.unhideCycle(res, req.params.id);
});

router.get('/get_cycles_by_team/:id', function(req, res, next) {
  mongo.getCyclesByTeam(res, req.params.id, false);
});

router.get('/get_all_cycles_by_team/:id', function(req, res, next) {
  mongo.getCyclesByTeam(res, req.params.id, true);
});

router.get('/get_all_teams', function(req, res, next) {
  mongo.getAllTeams(res);
});

router.get('/get_all_matches', function(req, res, next) {
  mongo.getAllMatches(res);
});

router.get('/get_cycles_by_match/:id', function(req, res, next) {
  mongo.getCycleByMatch(res, req.params.id);
});

router.post('/new_cycle',function(req,res,next){
  var cycle = req.param('cycle_data');  
  mongo.newCycle(cycle);
});

router.get('/eventname', function(req, res, next) {
  res.send(process.env.EVENTNAME);
});

router.get('/top_exchange', function(req, res, next) {
  mongo.getTopExchange(res);
})

router.get('/top_switch', function(req, res, next) {
  mongo.getTopSwitch(res);
})

router.get('/top_scale', function(req, res, next) {
  mongo.getTopScale(res);
})

module.exports = router;
