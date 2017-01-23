var mongoose = require('mongoose');
var exports = module.exports = {};

mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var tasks = new mongoose.Schema({done: Boolean, task: String, date: Date}); 
var Task = mongoose.model('Task', tasks);

db.once('open', function() {
  console.log("connected!");
  //newTask("Feed the cat!");
  //newTask("Feed the pigeon!");
  //newTask("Feed the dog!");
  //getTasks();
});

exports.newTask = function (task){
  if(!task){
    return;
  }
  var task = new Task({done:false, task: task, date:Date.now()});
  commit(task);
};

exports.getTasks = function (res){
  console.log("lol");
  Task.find({}, function(err, doc){
    all = [];
    console.log("finished finding!");
    doc.forEach(function(element) {
      all.push({id:element._id, done:element.done, task:element.task, date:element.date});
    }, this);
    res.contentType('application/json');
    res.send(JSON.stringify(all));
  });
};

function commit(task){
    task.save(function(err, task){
        if (err) return console.error(err);
        console.log("added!");
  });
}