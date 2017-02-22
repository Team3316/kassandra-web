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

/* GET tasks json. */
router.get('/get_tasks', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  console.log("called");
  mongo.getTasks(res);
  console.log("called");
});

router.post('/new_task', function(req, res, next){
  var task = req.param('task');
  mongo.newTask(task);
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

router.post('/submit', function(req, res, next){
  
});

module.exports = router;
