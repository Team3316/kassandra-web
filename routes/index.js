var express = require('express');
var http = require('http');
var mongo = require('../db/mongo.js');
express.use(session({secret: 'SUPER_SECRET_PASSWORD'}));
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

router.post('/new_task', function(req, res, next){
  var task = req.param('task');
  mongo.newTask(task);
  res.send("Success!");
});

router.post('/check_pass', function(req, res, next){
  var sess = req.session;
  var msg = "";
  if(sess.secret === "SUPER_SECRET_PASSWORD"){
    msg = "Already logged in!";
  }else{
    console.log("tootim");
    var pass = req.param("password");
    res.setHeader('Content-Type', 'application/json');
    if(pass === "TOOTIM!"){
      msg = "succes!!";
    }
    else{
      msg = "failed!!";
    }
  }
  res.send(JSON.stringify({ message : msg }));
});

module.exports = router;
