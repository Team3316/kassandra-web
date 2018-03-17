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

exports.newCycle = function (res, cycle){
  var cycle = new Cycle(cycle);
   cycle.save(function(err, doc) {
        res.send(JSON.stringify(doc));
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

exports.getCycles = function (res){
  Cycle.find({}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.exportCycles = function (res){
  Cycle.find({is_visible:true}, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};

exports.getCycle = function (res, id){
  Cycle.findOne({_id:id}, function(err, doc){
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

exports.getCyclesByTeam = function (res, id, get_all){
  if (get_all) {
    query = {team: id};
  } else {
    query = {team: id, is_visible: true};
  }
  Cycle.find(query, function(err, doc){
    res.send(JSON.stringify(doc));
  });
};