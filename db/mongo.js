var mongoose = require('mongoose');
var exports = module.exports = {};

var MONGO_URL = "localhost:27017/DATA"//process.env.MONGODB_URI;
mongoose.connect(MONGO_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var cycle = new mongoose.Schema({
    match:String,
    team:Number,
    auto:{
        triedAndFailed: Boolean,
        crosedBaseline:Boolean,
        fuelCollectedFromHopper:Boolean,
        estimatedPoints:Number,
        succeessfullyPlantedGears:Number,
        missedGears:Number,
        releasedHopper:Number,
        coordinates:{
            coords:Array
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
        fuelCollectedFromHopper: Boolean,
        estimatedPoints:Number,
        climbingTriedFailed:Boolean,
        climbingSuccess:Number,
        coordinates:{
            coords:Array
        }
    },
    defense:{
        defenseOn:Number,
        defenseComments:String
    },
    generalComments:String

}); 

var Cycle = mongoose.model("Cycle", cycle);

db.once('open', function() {
  console.log("connected!");
  //newTask("Feed the cat!");
  //newTask("Feed the pigeon!");
  //newTask("Feed the dog!");
  //getTasks();
});


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

exports.getAllTeams = function (res){
  Cycle.find({}, 'team', function(err, doc){
    var result = [];
    doc.forEach(function(element) {
      result.push(element._doc.team);
    }, this);
    result = Array.from(new Set(result));
    res.send(JSON.stringify(result));
  });
};

exports.getAllMatches = function(res){
  Cycle.find({}, 'match', function(err, doc){
    var result = [];
    doc.forEach(function(element) {
      result.push(element._doc.match);
    }, this);
    result = Array.from(new Set(result));
    res.send(JSON.stringify(result));
  });
}

exports.getCycles = function (res){
  Cycle.find({}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getCycle = function (res, id, match){
  Cycle.find({team:id, match:match}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getCycleByTeam = function (res, id){
  Cycle.find({team: id}, function(err, doc){
    res.send(JSON.stringify(doc));
    console.log("sent!");
  });
};

exports.getCycleByMatch = function (res, id){
  Cycle.find({match: id}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};
