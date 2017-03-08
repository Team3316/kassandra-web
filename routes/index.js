var express = require('express');
var http = require('http');
var mongo = require('../db/mongo.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //Might be needed to delete!
  res.header('Keep-Alive', 'timeout=15, max=100');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  res.header('Cache-Control', 'no-cache');
  res.render(__dirname + "index.html");
});

router.get('/get_cycles', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  console.log("called");
  mongo.getCycles();
  console.log("called");
});

router.get('/get_cycle/:id/:match', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  var match = req.params.match;
  console.log("called");
  mongo.getCycle(res, id, match);
  console.log("called");
});

router.get('/hide_cycle/:id/:match', function(req, res, next) {
  var id = req.params.id;
  var match = req.params.match;
  mongo.hideCycle(res, id, match);
});

router.get('/unhide_cycle/:id/:match', function(req, res, next) {
  var id = req.params.id;
  var match = req.params.match;
  mongo.unhideCycle(res, id, match);
});

router.get('/get_cycles_by_team/:id', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  var id = req.params.id; 
  mongo.getCycleByTeam(res, id);
});

router.get('/get_all_teams', function(req, res, next) {
  mongo.getAllTeams(res);
});

router.get('/get_all_matches', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json'); 
  console.log("called");
  mongo.getAllMatches(res);
  console.log("called");
});

router.get('/get_cycles_by_match/:id', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;   
  console.log("called");
  mongo.getCycleByMatch(res, id);
  console.log("called");
});

router.post('/new_cycle',function(req,res,next){
  var cycle = req.param('allData');  
  mongo.newCycle(cycle);
  res.send("Success!");
});

router.post('/check_pass', function(req, res, next){
  console.log("try!");
  var pass = req.param('password');
  console.log("pass = " + pass)
  var msg = "";
  res.setHeader('Content-Type', 'application/json');
  if(pass === "pass"){
    msg="OMRI_GRANTED";
  }
  else{
      msg = "failed!!";
  }
  res.send(JSON.stringify({ message : msg }));
});

module.exports = router;
