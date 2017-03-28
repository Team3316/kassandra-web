var mongoose = require('mongoose');
var exports = module.exports = {};

var MONGO_URL;

if(process.env.DEBUG == "localhost"){
  MONGO_URL = "localhost:27017/DATA" 
}
else{
  MONGO_URL = process.env.MONGODB_URI;
}


var DB_TABLE  = "cycles_" + process.env.EVENTNAME;
mongoose.connect(MONGO_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var cycle = new mongoose.Schema({
    match:String,
    team:Number,
    auto:{
        triedAndFailed: Boolean,
        crosedBaseline:Boolean,
        estimatedPoints:Number,
        succeessfullyPlantedGears:Number,
        missedGears:Number,
        coordinates:{
            coords:Array
        }
    },
    teleop:{
        gearsCollectedFromHP:Boolean,
        gearsCollectedFromFloor:Boolean,
        plantedGears:Number,
        missedGears:Number,
        fuelCollectedFromFloor:Boolean,
        fuelCollectedFromHP:Boolean,
        fuelCollectedFromHopper: Boolean,
        estimatedPoints:Number,
        climbingStatus:Number,
        coordinates:{
            coords:Array
        }
    },
    defense:{
        defenseOn:Number,
        defenseComments:String
    },
    generalComments:String,
    is_visible:{type:Boolean,default:true}

},{collection:DB_TABLE}); 

var Cycle = mongoose.model("Cycle", cycle);

db.once('open', function() {
  console.log("connected!");
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

exports.getCycle = function (res, id){
  Cycle.find({_id:id}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.hideCycle = function (res, id){
  Cycle.update({_id:id}, {is_visible:false}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.unhideCycle = function (res, id){
  Cycle.update({_id:id}, {is_visible:true}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getCycleByTeam = function (res, id, get_all){
  if (get_all) {
    query = {team: id};
  } else {
    query = {team: id, is_visible: true};
  }
  Cycle.find(query, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getCycleByMatch = function (res, id){
  Cycle.find({match: id}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getTopClimbers = function (res) {
  Cycle.aggregate([
		{
			$match: {
				$and: [
					{is_visible: true},
					{"teleop.climbingStatus": {$gte: 1}}
				]
			}
		},
		{
			$group: {
				_id: "$team",
				attempts: {$sum: 1},
				successes: {$sum: { $cond: [ { $eq: [ "$teleop.climbingStatus", 2 ] }, 1, 0 ] }},
        climbs_per_game: {$avg: { $cond: [ { $eq: [ "$teleop.climbingStatus", 2 ] }, 1, 0 ] } }
			}
		},
		{ $project: { _id: 1, climb_pct: { $divide: ["$successes", "$attempts"] }, successes: 1, attempts: 1, climbs_per_game: 1 } },
		{ $sort: { climbs_per_game: -1 } },
		{ $limit: 24 }
	], function (err, doc) {
    res.send(JSON.stringify(doc));
  });
};

exports.getTopPlanters = function (res){
  Cycle.aggregate([
		{ $match: { is_visible: true } },
		{
			$group: {
				_id: "$team",
				attempts: {$sum: { $add : ["$teleop.plantedGears", "$teleop.missedGears", "$auto.succeessfullyPlantedGears", "$auto.missedGears"] } },
				successes: {$sum: { $add : ["$teleop.plantedGears", "$auto.succeessfullyPlantedGears"] } },
        plants_per_game: {$avg: { $add : ["$teleop.plantedGears", "$auto.succeessfullyPlantedGears"] } }
      }
		},
    { $match: { attempts: { $gt: 0 } } },
    { $project: { _id: 1, plant_pct: { $divide: ["$successes", "$attempts"] }, successes: 1, attempts: 1, plants_per_game: 1 } },
		{ $sort: { plants_per_game: -1 } },
		{ $limit: 24 }
	], function (err, doc) {
    res.send(JSON.stringify(doc));
  });
};
