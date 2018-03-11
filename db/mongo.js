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
        auto_run:Boolean,
        switch:Number,
        switch_fail:Number,
        scale:Number,
        scale_fail:Number,
    },
    teleop:{
        collect_floor:Boolean,
        collect_portal:Boolean,
        collect_pyramid:Boolean,
        exchange:Number,
        exchange_fail:Number,
        switch:Number,
        switch_fail:Number,
        scale:Number,
        scale_fail:Number,
        climb:Number,
        partner_climb:Number,
    },
    tech_foul:Boolean,
    comments:String,
    is_visible:{type:Boolean, default:true}

},{collection:DB_TABLE}); 

var Cycle = mongoose.model("Cycle", cycle);

db.once('open', function() {
  console.log("connected!");
});

exports.newCycle = function (cycle){
  if(!cycle){
    return;
  }
  var cycle = new Cycle(cycle);
   cycle.save(function(err, task){
        if (err) return console.error(err);
        console.log("Added cycle!");
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

exports.getTopExchange = function (res){
  Cycle.aggregate([
		{ $match: { is_visible: true } },
		{
			$group: {
				_id: "$team",
				attempts: {$sum: { $add : ["$teleop.exchange", "$teleop.exchange_fail"] } },
				successes: {$sum: { $add : ["$teleop.exchange"] } },
                per_game: {$avg: { $add : ["$teleop.exchange"] } }
            }
		},
    { $match: { attempts: { $gt: 0 } } },
    { $project: { _id: 1, pct: { $divide: ["$successes", "$attempts"] }, successes: 1, attempts: 1, per_game: 1 } },
		{ $sort: { per_game: -1, pct: -1, attempts: -1} },
		{ $limit: 32 }
	], function (err, doc) {
    res.send(JSON.stringify(doc));
  });
};

exports.getTopSwitch = function (res){
  Cycle.aggregate([
		{ $match: { is_visible: true } },
		{
			$group: {
				_id: "$team",
				attempts: {$sum: { $add : ["$auto.switch", "$auto.switch_fail", "$teleop.switch", "$teleop.switch_fail"] } },
				successes: {$sum: { $add : ["$auto.switch", "$teleop.switch"] } },
                per_game: {$avg: { $add : ["$auto.switch", "$teleop.switch"] } }
            }
		},
    { $match: { attempts: { $gt: 0 } } },
    { $project: { _id: 1, pct: { $divide: ["$successes", "$attempts"] }, successes: 1, attempts: 1, per_game: 1 } },
		{ $sort: { per_game: -1, pct: -1, attempts: -1} },
		{ $limit: 32 }
	], function (err, doc) {
    res.send(JSON.stringify(doc));
  });
};

exports.getTopScale = function (res){
  Cycle.aggregate([
		{ $match: { is_visible: true } },
		{
			$group: {
				_id: "$team",
				attempts: {$sum: { $add : ["$auto.scale", "$auto.scale_fail", "$teleop.scale", "$teleop.scale_fail"] } },
				successes: {$sum: { $add : ["$auto.scale", "$teleop.scale"] } },
                per_game: {$avg: { $add : ["$auto.scale", "$teleop.scale"] } }
            }
		},
    { $match: { attempts: { $gt: 0 } } },
    { $project: { _id: 1, pct: { $divide: ["$successes", "$attempts"] }, successes: 1, attempts: 1, per_game: 1 } },
		{ $sort: { per_game: -1, pct: -1, attempts: -1} },
		{ $limit: 32 }
	], function (err, doc) {
    res.send(JSON.stringify(doc));
  });
};