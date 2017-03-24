var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr', function ($rootScope, $scope, $http, $cookies, $location, $state) {

    $scope.match_team_dictionary = {};
    $scope.matches = [];
    $scope.teams = [];
    $scope.opposingTeams = [];

    $http.get('javascripts/data.json').then(function (response) {
        $scope.allData = response.data;
    }, function (err) {
        console.log(err);
    });

    $http.get('/eventname').then(function (response) {
        $scope.eventname = response.data;
    })

    //headers for api calls
    var config = {
        headers: {
            'Content-Type': 'application/json; charset="utf-8"',
            'X-TBA-App-Id': '3316:Kassandra:2.0'
        }
    };

    
    function clear_all() {
        $scope.allData.match = "";
        $scope.allData.team = 0;
        $scope.allData.auto.triedAndFailed = false;
        $scope.allData.auto.crosedBaseline = false;
        $scope.allData.auto.estimatedPoints = 0;
        $scope.allData.auto.succeessfullyPlantedGears = 0;
        $scope.allData.auto.missedGears = 0;
        $scope.allData.teleop.gearsCollectedFromHP = false;
        $scope.allData.teleop.gearsCollectedFromFloor = false;
        $scope.allData.teleop.plantedGears = 0;
        $scope.allData.teleop.fuelCollectedFromHopper = false;
        $scope.allData.teleop.missedGears = 0;
        $scope.allData.teleop.fuelCollectedFromFloor = false;
        $scope.allData.teleop.fuelCollectedFromHP = false;
        $scope.allData.teleop.estimatedPoints = 0;
        $scope.allData.teleop.climbingStatus = "Did not try to climb"; // do not change!
        $scope.allData.defense.defenseComments = "";
        $scope.allData.defense.defenseOn = 0;
        $scope.allData.generalComments = "";
    }

    $scope.admin = function () {
        console.log("make admin cookie");
    }

    $scope.format_team = function (team_str) {
       return team_str.replace('frc', '');
    }

    //these matches are a test only
    $scope.get_matches = function () { 
        var url = "https://www.thebluealliance.com/api/v2/event/2017" + $scope.eventname + "/matches";
        $http.get(url, config).then(function (data) {
            var jdata = data[Object.keys(data)[0]];
            jdata.sort(function (a, b) {
                if (a.time < b.time) return -1;
                if (a.time > b.time) return 1;
                return 0;
            });
            jdata.forEach(function (element, index, arr) {
                var match = element.key.split("_");
                element.name = match[match.length - 1].toUpperCase();
                element.alliances.red.teams = element.alliances.red.teams.map($scope.format_team);
                element.alliances.blue.teams = element.alliances.blue.teams.map($scope.format_team);
            }, this);
            $scope.matches = jdata;
        });
    }

    //gets teams of the current match
    $scope.get_teams = function (match) {
        var ending = "2017" + $scope.eventname + "_" + match.toLowerCase();
        var url = "https://www.thebluealliance.com/api/v2/match/" + ending;
        $http.get(url, config).then(function (data) {
            // console.log(JSON.stringify(data));
            //Why I did the shit down there
            var jdata = data[Object.keys(data)[0]];
            var red = jdata.alliances.red.teams;
            var blue = jdata.alliances.blue.teams;
            console.log(JSON.stringify(red));
            console.log(JSON.stringify(blue));
            var teams = blue.concat(red);
            var final = [];
            teams.forEach(function (element) {
                final.push(element.replace('frc', ''));
            }, this);
            $scope.teams = final;
        });
    }

    $scope.get_opposing_teams = function (match, team) {
        var ending = "2017" + $scope.eventname + "_" + match.toLowerCase();
        var url = "https://www.thebluealliance.com/api/v2/match/" + ending;
        $http.get(url, config).then(function (data) {
            //console.log(JSON.stringify(data));
            //Why I did the shit down there
            var jdata = data[Object.keys(data)[0]];
            var red = jdata.alliances.red.teams;
            var blue = jdata.alliances.blue.teams;
            console.log(JSON.stringify(red));
            console.log(JSON.stringify(blue));
            var opposingTeams = [];
            var teamstr = "frc".concat(team);
            if (red.includes(teamstr)) {
                blue.forEach(function (element) {
                    opposingTeams.push(element.replace('frc', ''));
                }, this);
            }
            else {
                red.forEach(function (element) {
                    opposingTeams.push(element.replace('frc', ''));
                }, this);
            }
            $scope.opposingTeams = opposingTeams;
        });
    }

    $scope.submit_team_match = function (t, m) {
        clear_all();
        if (t != undefined && m != undefined) {
            $location.url('/autonomous/' + m + '/' + t);
            $scope.allData.team = t;
            $scope.allData.match = m;
        }
    }

    $scope.pull_matches = function () {
        $http.get("/get_all_matches").then(function (data) {
            console.log(data);
            $scope.db_matches = data.data;
        });
    }

    $scope.pull_teams = function () {
        $http.get("/get_all_teams").then(function (data) {
            console.log(data);
            $scope.db_teams = data.data;
            $scope.db_teams.sort();
        });
    }

    $scope.team_selected = function (team) {
        $scope.db_team = team;
        $http.get("/get_all_cycles_by_team/" +team).then(function(data){
                $scope._match = data.data;
        });
    }

    $scope.set_color = function (match) {
        if (match.is_visible) {
            return { "background-color": "#008CBA" };
        } else {
            return { "background-color": "#333" };
        }
    }

    $scope.hideCycle = function (id) {
        $http.get("/hide_cycle/" + id).then(function(data){
            if(data.data.nModified == 1) {
                $scope.is_visible = false;
            }
        });
    }

    $scope.unhideCycle = function (id) {
        $http.get("/unhide_cycle/" + id).then(function(data){
            if(data.data.nModified == 1) {
                $scope.is_visible = true;
            }
        });
    }

    $scope.updateTeam_picker = function (t, m) {
        $scope.allData.team = t;
        $scope.allData.match = m;
    }

    $scope.initAuto = function () {

        $scope.triedAndFailed = $scope.allData.auto.triedAndFailed;
        $scope.crosedBaseline = $scope.allData.auto.crosedBaseline;
        $scope.estimatedPoints = $scope.allData.auto.estimatedPoints;
        $scope.succeessfullyPlantedGears = $scope.allData.auto.succeessfullyPlantedGears;
        $scope.missedGears = $scope.allData.auto.missedGears;
    }

    $scope.initTeleop = function () {

        $scope.gearsCollectedFromHP2 = $scope.allData.teleop.gearsCollectedFromHP;
        $scope.gearsCollectedFromFloor2 = $scope.allData.teleop.gearsCollectedFromFloor;
        $scope.plantedGears2 = $scope.allData.teleop.plantedGears;
        $scope.missedGears2 = $scope.allData.teleop.missedGears;
        $scope.fuelCollectedFromFloor2 = $scope.allData.teleop.fuelCollectedFromFloor;
        $scope.fuelCollectedFromHP2 = $scope.allData.teleop.fuelCollectedFromHP;
        $scope.fuelCollectedFromHopper2 = $scope.allData.teleop.fuelCollectedFromHopper;
        $scope.estimatedPoints2 = $scope.allData.teleop.estimatedPoints;
        $scope.climbingStatus2 = $scope.allData.teleop.climbingStatus;
    }

    $scope.initDefense = function () {
        $scope.defenseComments = $scope.allData.defense.defenseComments;
        $scope.defenseOn = $scope.allData.defense.defenseOn;
    }

    $scope.initFinal = function () {
        $scope.generalComments = $scope.allData.generalComments;
    }

    $scope.updateAuto = function (triedAndFailed, crosedBaseline, estimatedPoints, succeessfullyPlantedGears, missedGears) {
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (arguments[i] == undefined || arguments[i] == "") {
                arguments[i] = 0;
            }
        }
        $scope.allData.auto.triedAndFailed = triedAndFailed;
        $scope.allData.auto.crosedBaseline = crosedBaseline;
        $scope.allData.auto.estimatedPoints = estimatedPoints;
        $scope.allData.auto.succeessfullyPlantedGears = succeessfullyPlantedGears;
        $scope.allData.auto.missedGears = missedGears;
    }

    $scope.updateTeleop = function (gearsCollectedFromHP2, gearsCollectedFromFloor2, fuelCollectedFromHopper2,
        plantedGears2, missedGears2, fuelCollectedFromFloor2, fuelCollectedFromHP2, estimatedPoints2, climbingStatus2) {
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (arguments[i] == undefined || arguments[i] == "") {
                arguments[i] = 0;
            }
        }
        $scope.allData.teleop.gearsCollectedFromHP = gearsCollectedFromHP2;
        $scope.allData.teleop.gearsCollectedFromFloor = gearsCollectedFromFloor2;
        $scope.allData.teleop.plantedGears = plantedGears2;
        $scope.allData.teleop.missedGears = missedGears2;
        $scope.allData.teleop.fuelCollectedFromFloor = fuelCollectedFromFloor2;
        $scope.allData.teleop.fuelCollectedFromHopper = fuelCollectedFromHopper2;
        $scope.allData.teleop.fuelCollectedFromHP = fuelCollectedFromHP2
        $scope.allData.teleop.estimatedPoints = estimatedPoints2;
        $scope.allData.teleop.climbingStatus = climbingStatus2;
    }

    $scope.updateDefense = function (defenseOn, updateDefense) {
        $scope.allData.defense.defenseComments = updateDefense;
        $scope.allData.defense.defenseOn = defenseOn;
    }

    window.get_single_match = function (btn) {
        $location.path('/report/' + btn.value);
        $scope.$apply();
    }

    window.get_overall = function () {
        var team = parseInt($scope.db_team);
        $http.get('/get_cycles_by_team/' + team).then(function (data) {
            $state.go('overall_report', { obj: data.data });
        });
    }

    $scope.update_final = function (generalComments) {
        if (generalComments == "" || generalComments == null || generalComments == undefined) { generalComments = ""; }
        $scope.allData.generalComments = generalComments;
    }

    $scope.initFinal = function () {
        $scope.generalComments = $scope.allData.generalComments;
    }

    $scope.finalButton = function () {
        $http.post('/new_cycle', { 'allData': $scope.allData }).then(function (data) {
            $http.get('javascripts/data.json').then(function (response) {
                $scope.allData = response.data;
                $location.url('/team_picker');
                clear_all();
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });
    }

    $scope.make_call = function (id) {
        $http.get("/get_cycle/" + id).then(function (data) {
            $scope.id = data.data[0]._id;
            $scope.match = data.data[0].match;
            $scope.team = data.data[0].team;
            $scope.tf = data.data[0].auto.triedAndFailed;
            $scope.cb = data.data[0].auto.crosedBaseline;
            $scope.spg = data.data[0].auto.succeessfullyPlantedGears;
            $scope.mg = data.data[0].auto.missedGears;
            $scope.ep = data.data[0].auto.estimatedPoints;
            $scope.tgcfh = data.data[0].teleop.gearsCollectedFromHP;
            $scope.tgcff = data.data[0].teleop.gearsCollectedFromFloor;
            $scope.tspg = data.data[0].teleop.plantedGears;
            $scope.tmg = data.data[0].teleop.missedGears;
            $scope.tfcff = data.data[0].teleop.fuelCollectedFromFloor;
            $scope.tfcfh = data.data[0].teleop.fuelCollectedFromHP;
            $scope.tfcfho = data.data[0].teleop.fuelCollectedFromHopper;
            $scope.tep = data.data[0].teleop.estimatedPoints;
            $scope.tcs = data.data[0].teleop.climbingStatus;
            $scope.ddo = data.data[0].defense.defenseOn;
            $scope.ddc = data.data[0].defense.defenseComments;
            $scope.ggc = data.data[0].generalComments;
            $scope.is_visible = data.data[0].is_visible;
        });
    }

    $scope.overall_organize = function (obj) {
        $scope.team = obj[0].team;
        $scope.matches = obj;
        $scope.o_nom = 0;
        $scope.o_tf = 0;
        $scope.o_cb = 0;
        $scope.o_spg = 0;
        $scope.o_mg = 0;
        $scope.o_ep = 0;
        $scope.o_tgcfh = 0;
        $scope.o_tgcff = 0;
        $scope.o_tspg = 0;
        $scope.o_tmg = 0;
        $scope.o_tfcff = 0;
        $scope.o_tfcfh = 0; 
        $scope.o_tfcfho = 0; 
        $scope.o_tep = 0;
        $scope.o_tctaf = 0;
        $scope.o_tcs = 0;
        $scope.o_dc = 0;
        $scope.o_ddo = []
        $scope.o_ddc = [];
        $scope.o_ggc = [];
        $scope.o_nom = 0;
        obj.forEach(function (element) {
            if (element.is_visible) {
                $scope.o_nom++;
                $scope.o_tf += element.auto.triedAndFailed; //auto tf
                $scope.o_cb += element.auto.crosedBaseline; //auto cb
                $scope.o_spg += element.auto.succeessfullyPlantedGears; //auto planted gears
                $scope.o_mg += element.auto.missedGears; // auto missedGears
                $scope.o_ep += element.auto.estimatedPoints; //auto etimated points
                $scope.o_tgcfh += element.teleop.gearsCollectedFromHP; //teleop gears collected hp
                $scope.o_tgcff += element.teleop.gearsCollectedFromFloor; //teleop gears collected floor
                $scope.o_tspg += element.teleop.plantedGears; //teleop planted gears
                $scope.o_tmg += element.teleop.missedGears; //teleop missedGears
                $scope.o_tfcff += element.teleop.fuelCollectedFromFloor; //teleop collect fuel floor
                $scope.o_tfcfh += element.teleop.fuelCollectedFromHP; //teleop collect fuel hp
                $scope.o_tfcfho += element.teleop.fuelCollectedFromHopper; //teleop collect fuel hopper
                $scope.o_tep += element.teleop.estimatedPoints; //teleop estimated points
                $scope.o_tctaf += element.teleop.climbingStatus == "Climbing failed"; //climb tried and failed
                $scope.o_tcs += element.teleop.climbingStatus == "Climbing succeeded"; //climb success
                $scope.o_dc += (element.teleop.climbingStatus != "Climbing succeeded") &&
                                (element.teleop.climbingStatus != "Climbing failed");
                if (element.defense.defenseOn != 0) {
                    $scope.o_ddo.push(element.match + ": " + element.defense.defenseOn);
                }
                if (element.defense.defenseComments != "") {
                    $scope.o_ddc.push(element.match + ": " + element.defense.defenseComments);
                }
                if (element.generalComments != "") {
                    $scope.o_ggc.push(element.match + ": " + element.generalComments);
                }
            }
        }, this);
        $scope.tf_cb = $scope.o_tf + $scope.o_cb;
    }

    $scope.insertAuto = function () {
        return $scope.allData.auto.triedAndFailed;
    }

    $scope.pull_match_team = function () {
        $http.get('/get_cycles').then(function (data) {
                data.data.forEach(function (element) {
                    $scope.match_team_dictionary[element.match]=[];
                });
                data.data.forEach(function (element) {
                    $scope.match_team_dictionary[element.match].push(element.team);
                });
            });
    }

    $scope.entry_exists = function (match, team) {
        return (match in $scope.match_team_dictionary) && ($scope.match_team_dictionary[match].includes(parseInt(team)));
    }

    $scope.team_filtered = function (team, filter_team) {
        return filter_team && team.includes(filter_team);
    }

    $scope.get_color=function(numerator,denominator,lower,upper) {
        var num = numerator/denominator;
        if (num > upper) {
            return "#b3ffb3"; //green
        }
        if (num < lower) {
            return "#ffb3b3"; //red
        }
        return "#ffffb3"; //yellow
    }

    $scope.emptyDefense = function(item){
        return !(item.defense.defenseComments === "")
    }

    
    $scope.emptyGeneralComments = function(item){
        return !(item.generalComments === "" || item.generalComments.length <= 0);
    }    

    $scope.emptyMatch = function(item){
        return !(item.match === "");
    }

    $scope.dec_counter = function(number, step) { 
        return Math.max(0, number - step);
    }

    $scope.inc_counter = function(number, step) {
        return number + step;
    }

    $scope.concat_comment = function(main, comment) {
        if (!main) return comment;
        else return main.concat(', ', comment);
    }

    $scope.get_match_string = function() {
        return $scope.allData.match + " / " + $scope.allData.team;
    }

  });