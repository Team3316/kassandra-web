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

module.exports = router;
