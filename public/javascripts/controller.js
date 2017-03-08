var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr', function ($scope, $http, $cookies, $location, $state) {

    $scope.matches = [];
    $scope.teams = [];
    //to delete
    //$cookies.remove("access_token");

    $http.get('javascripts/data.json').then(function (response) {
        $scope.allData = response.data;
    }, function (err) {
        console.log(err);
    });

    //canvas for field
    var canvas = null;
    var context = null;
    var canvas2 = null;
    var context2 = null;
    var coordinates = [];
    var coordinates2 = [];

    $scope.find_canvas = function () {
        canvas = null;
        context = null;
        //coordinates = [];

        while (canvas === null) {
            canvas = document.getElementById('myCanvas');
            if (canvas) {
                context = canvas.getContext('2d');
            }
        }
    };
    $scope.find_canvas2 = function () {
        canvas2 = null;
        context2 = null;
        //coordinates2 = [];
        while (canvas2 === null) {
            canvas2 = document.getElementById('myCanvas2');
            if (canvas2) {
                context2 = canvas2.getContext('2d');
            }
        }
    }

    //headers for api calls
    var config = {
        headers: {
            'Content-Type': 'application/json; charset="utf-8"',
            'X-TBA-App-Id': '3316:Kassandra:2.0'
        }
    };

    $scope.accessToken = "OMRI_GRANTED";

    function clear_all() {
        canvas = null;
        context = null;
        canvas2 = null;
        context2 = null;
        //coordinates = [];
        //coordinates2 = [];

        $scope.allData.match = "";
        $scope.allData.team = 0;
        $scope.allData.auto.triedAndFailed = false;
        $scope.allData.auto.crosedBaseline = false;
        $scope.allData.auto.fuelCollectedFromHopper = false;
        $scope.allData.auto.estimatedPoints = 0;
        $scope.allData.auto.succeessfullyPlantedGears = 0;
        $scope.allData.auto.missedGears = 0;
        $scope.allData.auto.releasedHopper = 0;
        $scope.allData.auto.coordinates.coords = [];
        $scope.allData.teleop.releasedHopper = 0;
        $scope.allData.teleop.gearsCollectedFromHP = false;
        $scope.allData.teleop.gearsCollectedFromFloor = false;
        $scope.allData.teleop.plantedGears = 0;
        $scope.allData.teleop.fuelCollectedFromHopper = false;
        $scope.allData.teleop.missedGears = 0;
        $scope.allData.teleop.fuelCollectedFromFloor = false;
        $scope.allData.teleop.fuelCollectedFromHP = false;
        $scope.allData.teleop.estimatedPoints = 0;
        $scope.allData.teleop.climbingTriedFailed = false;
        $scope.allData.teleop.climbingSuccess = false;
        $scope.allData.teleop.coordinates.coords = [];
        $scope.allData.defense.defenseComments = "";
        $scope.allData.defense.defenseOn = 0;
        $scope.allData.generalComments = "";
    }

    $scope.addOnClick = function (event) {
        if (canvas.getContext) {
            var x = event.offsetX;
            var y = event.offsetY;
            //console.log("x: " + x + ", y: " + y);
            coordinates.push({ x, y });
            console.log(coordinates);
            context.beginPath();
            context.strokeStyle = "#e74c3c";
            context.arc(x, y, 10, 0, 2 * Math.PI, false);
            context.stroke();
        }
        else {
            find_canvas();
        }
    }

    $scope.addOnClick2 = function (event) {
        if (canvas2.getContext) {
            var x = event.offsetX;
            var y = event.offsetY;
            //console.log("x: " + x + ", y: " + y);
            coordinates2.push({ x, y });
            console.log(coordinates2);
            context2.beginPath();
            context2.strokeStyle = "#e74c3c";
            context2.arc(x, y, 10, 0, 2 * Math.PI, false);
            context2.stroke();
        }
        else {
            find_canvas2();
        }
    }



    $scope.clear = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordinates = [];
    }

    $scope.clear2 = function () {
        context2.clearRect(0, 0, canvas2.width, canvas2.height);
        coordinates2 = [];
    }

    $scope.undo = function () {
        coordinates.pop();
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordinates.forEach(function (element) {
            console.log(element.x + "," + element.y)
            context.beginPath();
            context.strokeStyle = "#e74c3c";
            context.arc(element.x, element.y, 10, 0, 2 * Math.PI, false);
            context.stroke();
        }, this);
    }

    $scope.undo2 = function () {
        coordinates2.pop();
        context2.clearRect(0, 0, canvas2.width, canvas2.height);
        coordinates2.forEach(function (element) {
            console.log(element.x + "," + element.y)
            context2.beginPath();
            context2.strokeStyle = "#e74c3c";
            context2.arc(element.x, element.y, 10, 0, 2 * Math.PI, false);
            context2.stroke();
        }, this);
    }

    $scope.checkPass = function () {
        var pass = document.getElementById("pass").value;
        $http({
            method: 'POST',
            url: '/check_pass',
            data: { password: pass }
        }).then(function successCallback(response) {
            if (response.data.message === "OMRI_GRANTED") {
                $cookies.put('access_token', 'OMRI_GRANTED');
                $location.url('/team_picker');
            }
        });
    }

    // $scope.init = function () {
    //     console.log("init!");
    //     var accessToken = $cookies.get("access_token");
    //     if (accessToken !== 'OMRI_GRANTED') {
    //         window.location.href = '#/login';
    //     }
    // }

    $scope.admin = function () {
        console.log("make admin cookie");
    }

    //these matches are a test only
    $scope.get_matches = function () {
        var url = "https://www.thebluealliance.com/api/v2/event/2017isde1/matches";
        $http.get(url, config).then(function (data) {
            var jdata = data[Object.keys(data)[0]];
            jdata.sort(function(a, b){
                if(a.time < b.time) return -1;
                if(a.time > b.time) return 1;
                return 0;
            });
            var matches = [];
            jdata.forEach(function (element) {
                var match = element.key.split("_");
                match = match[match.length - 1].toUpperCase();
                matches.push(match);
            }, this);
            $scope.matches = matches;
        });
    }

    //gets teams of the current match
    $scope.get_teams = function (match) {
        var ending = "2017isde1_" + match.toLowerCase();
        var url = "https://www.thebluealliance.com/api/v2/match/" + ending;
        $http.get(url, config).then(function (data) {
            //console.log(JSON.stringify(data));
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

    $scope.submit_team_match = function (t, m) {
        clear_all();
        if (t != undefined && m != undefined) {
            $location.url('/autonomous/' + m + '/' + t);
            $scope.allData.team = t;
            $scope.allData.match = m;
        }
    }

    $scope.teleop = function () {
        $location.url("/teleop/");
    }

    $scope.pull_matches = function () {
        // $scope.db_teams = ["0002", "1232", "3232"];
        $http.get("/get_all_matches").then(function (data) {
            console.log(data);
            $scope.db_matches = data.data;
        });
    }

    $scope.pull_teams = function () {

        // $scope.db_teams = ["0002", "1232", "3232"];
        $http.get("/get_all_teams").then(function (data) {
            console.log(data);
            $scope.db_teams = data.data;
        });
    }

    $scope.team_selected = function (team) {
        $scope.db_team = team;
        $http.get("/get_cycles_by_team/" + team).then(function (data) {
            $scope._match = data.data;
        });
    }

    $scope.updateTeam_picker = function (t, m) {
        $scope.allData.team = t;
        $scope.allData.match = m;
    }

    $scope.initAuto = function () {

        $scope.triedAndFailed = $scope.allData.auto.triedAndFailed;
        $scope.crosedBaseline = $scope.allData.auto.crosedBaseline;
        $scope.fuelCollectedFromHopper = $scope.allData.auto.fuelCollectedFromHopper;
        $scope.estimatedPoints = $scope.allData.auto.estimatedPoints;
        $scope.succeessfullyPlantedGears = $scope.allData.auto.succeessfullyPlantedGears;
        $scope.missedGears = $scope.allData.auto.missedGears;
        $scope.releasedHopper = $scope.allData.auto.releasedHopper;

    }

    $scope.initTeleop = function () {

        $scope.releasedHopper2 = $scope.allData.teleop.releasedHopper;
        $scope.gearsCollectedFromHP2 = $scope.allData.teleop.gearsCollectedFromHP;
        $scope.gearsCollectedFromFloor2 = $scope.allData.teleop.gearsCollectedFromFloor;
        $scope.plantedGears2 = $scope.allData.teleop.plantedGears;
        $scope.missedGears2 = $scope.allData.teleop.missedGears;
        $scope.fuelCollectedFromFloor2 = $scope.allData.teleop.fuelCollectedFromFloor;
        $scope.fuelCollectedFromHP2 = $scope.allData.teleop.fuelCollectedFromHP;
        $scope.fuelCollectedFromHopper2 = $scope.allData.teleop.fuelCollectedFromHopper;
        $scope.estimatedPoints2 = $scope.allData.teleop.estimatedPoints;
        $scope.climbingTriedFailed2 = $scope.allData.teleop.climbingTriedFailed;
        $scope.climbingSuccess2 = $scope.allData.teleop.climbingSuccess;
    }

    $scope.initDefense = function () {
        $scope.defenseComments = $scope.allData.defense.defenseComments;
        $scope.defenseOn = $scope.allData.defense.defenseOn;
    }

    $scope.initFinal = function () {
        $scope.generalComments = $scope.allData.generalComments;
    }

    $scope.updateAuto = function (triedAndFailed, crosedBaseline,
        fuelCollectedFromHopper, estimatedPoints, succeessfullyPlantedGears, missedGears, releasedHopper) {
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (arguments[i] == undefined || arguments[i] == "") {
                arguments[i] = 0;
            }
        }
        $scope.allData.auto.triedAndFailed = triedAndFailed;
        $scope.allData.auto.crosedBaseline = crosedBaseline;
        $scope.allData.auto.fuelCollectedFromHopper = fuelCollectedFromHopper;
        $scope.allData.auto.estimatedPoints = estimatedPoints;
        $scope.allData.auto.succeessfullyPlantedGears = succeessfullyPlantedGears;
        $scope.allData.auto.missedGears = missedGears;
        $scope.allData.auto.releasedHopper = releasedHopper;
        $scope.allData.auto.coordinates.coords = coordinates;
    }

    $scope.updateTeleop = function (releasedHopper2, gearsCollectedFromHP2, gearsCollectedFromFloor2, fuelCollectedFromHopper2,
        estimatedPoints2, plantedGears2, missedGears2, fuelCollectedFromFloor2, fuelCollectedFromHP2, estimatedPoints2, climbingTriedFailed2, climbingSuccess2) {
        for (var i = 0, j = arguments.length; i < j; i++) {
            if (arguments[i] == undefined || arguments[i] == "") {
                arguments[i] = 0;
            }
        }
        $scope.allData.teleop.releasedHopper = releasedHopper2;
        $scope.allData.teleop.gearsCollectedFromHP = gearsCollectedFromHP2;
        $scope.allData.teleop.gearsCollectedFromFloor = gearsCollectedFromFloor2;
        $scope.allData.teleop.plantedGears = plantedGears2;
        $scope.allData.teleop.missedGears = missedGears2;
        $scope.allData.teleop.fuelCollectedFromFloor = fuelCollectedFromFloor2;
        $scope.allData.teleop.fuelCollectedFromHopper = fuelCollectedFromHopper2;
        $scope.allData.teleop.fuelCollectedFromHP = fuelCollectedFromHP2
        $scope.allData.teleop.estimatedPoints = estimatedPoints2;
        $scope.allData.teleop.climbingTriedFailed = climbingTriedFailed2;
        $scope.allData.teleop.climbingSuccess = climbingSuccess2;
        $scope.allData.teleop.coordinates.coords = coordinates2;
    }

    $scope.updateDefense = function (defenseOn) {
        var dc = document.getElementById("defensecomment").value;
        if (defenseComments = "" || !defenseOn) { defenseOn = 0 }
        $scope.allData.defense.defenseComments = dc;
        $scope.allData.defense.defenseOn = defenseOn;
    }

    window.get_single_match = function (btn) {
        var team = parseInt($scope.db_team);
        var match = btn.value;
        console.log("avad!!!");
        $location.path('/report/' + team + '/' + match);
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

    $scope.make_call = function (team, match) {
        console.log(team + ", " + match);
        $scope.team = team;
        $scope.match = match;
        $http.get("/get_cycle/" + team + "/" + match).then(function (data) {
            console.log(JSON.stringify(data.data));
            $scope.tf = data.data[0].auto.triedAndFailed;
            $scope.cb = data.data[0].auto.crosedBaseline;
            $scope.cff = data.data[0].auto.fuelCollectedFromHopper;
            $scope.rh = data.data[0].auto.releasedHopper;
            $scope.spg = data.data[0].auto.succeessfullyPlantedGears;
            $scope.mg = data.data[0].auto.missedGears;
            $scope.ep = data.data[0].auto.estimatedPoints;
            $scope.trh = data.data[0].teleop.releasedHopper;
            $scope.tgcfh = data.data[0].teleop.gearsCollectedFromHP;
            $scope.tgcff = data.data[0].teleop.gearsCollectedFromFloor;
            $scope.tspg = data.data[0].teleop.plantedGears;
            $scope.tmg = data.data[0].teleop.missedGears;
            $scope.tfcff = data.data[0].teleop.fuelCollectedFromFloor;
            $scope.tfcfh = data.data[0].teleop.fuelCollectedFromHP;
            $scope.tfcfho = data.data[0].teleop.fuelCollectedFromHopper;
            $scope.tep = data.data[0].teleop.estimatedPoints;
            $scope.tctaf = data.data[0].teleop.climbingTriedFailed;
            $scope.tcs = data.data[0].teleop.climbingSuccess;
            $scope.ddo = data.data[0].defense.defenseOn;
            $scope.ddc = data.data[0].defense.defenseComments;
            $scope.ggc = data.data[0].generalComments;
            var canv;
            var ctx;
            while (canv == null) {
                canv = document.getElementById("reportauto");
                if (canv.getContext) {
                    ctx = canv.getContext('2d');
                }
            }
            data.data[0].auto.coordinates.coords.forEach(function (element) {
                var x = element.x;
                var y = element.y;
                ctx.beginPath();
                ctx.strokeStyle = "#e74c3c";
                ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
                ctx.stroke();
            }, this);
            data.data[0].teleop.coordinates.coords.forEach(function (element) {
                var x = element.x;
                var y = element.y;
                ctx.beginPath();
                ctx.strokeStyle = "#3498db";
                ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
                ctx.stroke();
            }, this);
        });
    }

    $scope.overall_organize = function (obj) {
        $scope.o_tf = 0;
        $scope.o_cb = 0;
        $scope.o_cfh = false;
        $scope.o_rh = 0;
        $scope.o_spg = 0;
        $scope.o_mg = 0;
        $scope.o_ep = 0;
        $scope.o_trh = 0;
        $scope.o_tgcfh = false;
        $scope.o_tgcff = false;
        $scope.o_tspg = 0;
        $scope.o_tmg = 0;
        $scope.o_tfcff = false;
        $scope.o_tfcfh = false;
        $scope.o_tfcfho = false;
        $scope.o_tep = 0;
        $scope.o_tctaf = 0;
        $scope.o_tcs = 0;
        $scope.o_ddo = []
        $scope.o_ddc = [];
        $scope.o_ggc = [];
        var canv;
        var ctx;
        while (canv == null) {
            canv = document.getElementById("reportauto2");
            if (canv.getContext) {
                ctx = canv.getContext('2d');
            }
        }
        obj.forEach(function (element) {
            $scope.o_tf += element.auto.triedAndFailed / obj.length; //auto tf
            $scope.o_cb += element.auto.crosedBaseline / obj.length; //auto cb
            $scope.o_cfh = $scope.o_cfh || element.auto.fuelCollectedFromHopper; //auto fuel hopper
            $scope.o_rh += element.auto.releasedHopper / obj.length; //auto rh
            $scope.o_spg += element.auto.succeessfullyPlantedGears / obj.length; //auto planted gears
            $scope.o_mg += element.auto.missedGears / obj.length; // auto missedGears
            $scope.o_ep += element.auto.estimatedPoints / obj.length; //auto etimated points
            $scope.o_trh += element.teleop.releasedHopper / obj.length; //teleop releasedHoppers
            $scope.o_tgcfh = $scope.o_tgcfh || element.teleop.gearsCollectedFromHP; //teleop gears collected hp
            $scope.o_tgcff = $scope.o_tgcff || element.teleop.gearsCollectedFromFloor; //teleop gears collected floor
            $scope.o_tspg += element.teleop.plantedGears / obj.length; //teleop planted gears
            $scope.o_tmg += element.teleop.missedGears / obj.length; //teleop missedGears
            $scope.o_tfcff = $scope.o_tfcff || (element.teleop.fuelCollectedFromFloor == true); //teleop collect fuel floor
            $scope.o_tfcfh = $scope.o_tfcfh || (element.teleop.fuelCollectedFromHP == true); //teleop collect fuel hp
            $scope.o_tfcfho = $scope.o_tfcfho || (element.teleop.fuelCollectedFromHopper == true); //teleop collect fuel hopper
            $scope.o_tep += $scope.o_tep / obj.length; //teleop estimated points
            $scope.o_tctaf += element.teleop.climbingTriedFailed / obj.length; //climb tried and failed
            $scope.o_tcs += element.teleop.climbingSuccess / obj.length; //climb success
            $scope.o_ddo.push(element.match + ":" + element.defense.defenseOn);
            $scope.o_ddc.push(element.match + ":" + element.defense.defenseComments);
            $scope.o_ggc.push(element.match + ":" + element.generalComments);
            element.auto.coordinates.coords.forEach(function (e) {
                if (e) {
                    var x = e.x;
                    var y = e.y;
                    ctx.beginPath();
                    ctx.strokeStyle = "#e74c3c";
                    ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
                    ctx.stroke();
                }
            }, this);
            element.teleop.coordinates.coords.forEach(function (e) {
                if (e) {
                    var x = e.x;
                    var y = e.y;
                    ctx.beginPath();
                    ctx.strokeStyle = "#3498db";
                    ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
                    ctx.stroke();
                }
            }, this);
        }, this);
        $scope.o_dc = (1 - $scope.o_tctaf - $scope.o_tcs);
    }

    $scope.insertAuto = function () {
        return $scope.allData.auto.triedAndFailed;
    }

});