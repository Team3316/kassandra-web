var mongoose = require('mongoose');
var exports = module.exports = {};

mongoose.connect('mongodb://localhost:27017/DATA');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var tasks = new mongoose.Schema({done: Boolean, task: String, date: Date}); 
var Task = mongoose.model('Task', tasks);

var cycle = new mongoose.Schema({
    match:Number,
    team:Number,
    auto:{
        triedAndFailed: Boolean,
        crosedBaseline:Boolean,
        fuelCollectedFromFloor:Boolean,
        fuelCollectedFromHopper:Boolean,
        estimatedPoints:Number,
        succeessfullyPlantedGears:Number,
        missedGears:Number,
        releasedHopper:Number,
        coordinates:{
            x:Number,
            y:Number  
        }
    },
    teleop:{
        releasedHopper:Number,
        gearsCollectedFromHP:Boolean,
        gearsCollectedFromFloor:Boolean,
        plantedGears:Number,
        missedGears:Number,
        fuelCollectedFromFloor:Boolean,
        fuelCollectedFromHP:Boolean,
        estimatedPoints:Number,
        climbingTriedFailed:Boolean,
        climbingSuccess:Number
    },
    defense:{
        defenseOn:Number,
        defenseBy:Number,
        defenseComments:String
    },
    generalComments:String

}); 

var Cycle = mongoose.model("myCycle", cycle);

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

exports.newTeam = function (team){
  if(!team){
    return;
  }
  var team = new Team({teamNo: team});
   team.save(function(err, task){
        if (err) return console.error(err);
        console.log("added!");
  });
};


exports.newCycle = function (cycle){
  if(!cycle){
    return;
  }
  var cycle = new Cycle(cycle);
   cycle.save(function(err, task){
        if (err) return console.error(err);
        console.log("Added cycle !");
  });
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

exports.getTeams = function (res){
  Team.find({}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

function commit(task){
    task.save(function(err, task){
        if (err) return console.error(err);
        console.log("added!");
  });
}