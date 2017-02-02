var express = require('express');
var http = require('http');
var mongo = require('../db/mongo.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(__dirname + "index.html");
});

/* GET tasks json. */
router.get('/get_tasks', function(req, res, next) {
  //res.setHeader('Content-Type', 'application/json');
  console.log("called");
  mongo.getTasks(res);
  console.log("called");
});

/* GET new task(will be a post). */
router.post('/new_task', function(req, res, next){
  var task = req.param('task');
  mongo.newTask(task);
  res.send("Success!");
});

router.post('/check_pass', function(req, res, next){
  var pass = req.param('password');
  res.setHeader('Content-Type', 'application/json');
  if(pass === "pass"){
    res.send(JSON.stringify({msg: "Success!"}));
  }
  else{
    res.send(JSON.stringify({msg: "Failed!"}));
  }
});

module.exports = router;