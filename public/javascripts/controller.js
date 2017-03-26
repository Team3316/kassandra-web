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
        $scope.allData.teleop.climbingStatus = 0;
        $scope.allData.defense.defenseComments = "";
        $scope.allData.defense.defenseOn = 0;
        $scope.allData.generalComments = "";
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
            $scope.matches = jdata.filter($scope.emptyMatch);
        });
    }

    //gets teams of the current match
    $scope.get_teams = function (match) {
        var match = $scope.matches.find(function(m) { return m.name == match });
        if (!match) return [];
        return match.alliances.blue.teams.concat(match.alliances.red.teams);
    }

     $scope.get_opposing_teams = function (team, match) {
        var teams = $scope.get_teams(match);
        if (!teams) return [];

        switch(teams.findIndex(function(t) { return t == team })) {
            case -1: // Team not in teams
                return teams.slice();
            case 0: // Team is on Blue aliance
            case 1:
            case 2:
                return teams.slice(3, 6);
            case 3: // Team is on Red aliance
            case 4:
            case 5:
                return teams.slice(0, 3);
        }
    }

    $scope.submit_team_match = function (team, match) {
        clear_all();
        if (team != undefined && match != undefined) {
            $location.url('/autonomous/');
            $scope.allData.team = team;
            $scope.allData.match = match;
        }
    }

    $scope.pull_matches = function () {
        $http.get("/get_all_matches").then(function (data) {
            $scope.db_matches = data.data;
        });
    }

    $scope.pull_teams = function () {
        $http.get("/get_all_teams").then(function (data) {
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
        $scope.movement = "0";
        if ($scope.allData.auto.triedAndFailed) {
            $scope.movement = "1";
        } else if ($scope.allData.auto.crosedBaseline) {
            $scope.movement = "2";
        }

        $scope.estimatedPoints = $scope.allData.auto.estimatedPoints;

        $scope.gears = "0";
        if ($scope.allData.auto.missedGears) {
            $scope.gears = "1";
        } else if ($scope.allData.auto.succeessfullyPlantedGears) {
            $scope.gears = "2";
        }
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
        $scope.climb = $scope.allData.teleop.climbingStatus.toString();
    }

    $scope.initDefense = function () {
        $scope.defenseComments = $scope.allData.defense.defenseComments;
        $scope.defenseOn = $scope.allData.defense.defenseOn;
    }

    $scope.initFinal = function () {
        $scope.generalComments = $scope.allData.generalComments;
    }

    $scope.updateAuto = function (movement, estimatedPoints, gears) {
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (arguments[i] == undefined || arguments[i] == "") {
                arguments[i] = 0;
            }
        }
        $scope.allData.auto.triedAndFailed = (movement == 1);
        $scope.allData.auto.crosedBaseline = (movement == 2);
        $scope.allData.auto.estimatedPoints = estimatedPoints;
        $scope.allData.auto.missedGears = (gears == 1) ? 1 : 0;
        $scope.allData.auto.succeessfullyPlantedGears = (gears == 2) ? 1 : 0;
    }

    $scope.updateTeleop = function (gearsCollectedFromHP2, gearsCollectedFromFloor2, fuelCollectedFromHopper2,
        plantedGears2, missedGears2, fuelCollectedFromFloor2, fuelCollectedFromHP2, estimatedPoints2, climb) {
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
        $scope.allData.teleop.climbingStatus = climb;
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
            
            $scope.tcs = "Didn't try";
            if (data.data[0].teleop.climbingStatus == 1) {
                $scope.tcs = "Tried and Failed";
            } else if (data.data[0].teleop.climbingStatus == 2) {
                $scope.tcs = "Successfully";
            }
            
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
        $scope.o_ddo = [];
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
                $scope.o_tctaf += element.teleop.climbingStatus == 1; //climb tried and failed
                $scope.o_tcs += element.teleop.climbingStatus == 2; //climb success
                $scope.o_dc += element.teleop.climbingStatus == 0; //didn't try to climb
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

    $scope.get_color = function (numerator, denominator, lower, upper) {
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

    $scope.get_match_team_color = function() {
        var res = "header-"
        var teams = $scope.get_teams($scope.allData.match);
        if (teams.indexOf($scope.allData.team) <= 2)
            return res + "blue";
        else
            return res + "red";
    }
    
    $scope.get_top_climbers = function() {
        $http.get('/get_top_climbers').then(function (data) {
            $scope.top_climbers = data.data;
        })
    }

    $scope.get_top_planters = function() {
        $http.get('/get_top_planters').then(function (data) {
            $scope.top_planters = data.data;
        })
    }
  });

app.directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  });