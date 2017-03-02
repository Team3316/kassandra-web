var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr', function ($scope, $http, $cookies, $location) {
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

    $scope.find_canvas = function () {
        while (canvas === null) {
            canvas = document.getElementById('myCanvas');
            if (canvas) {
                context = canvas.getContext('2d');
            }
        }
    };
    $scope.find_canvas2 = function () {
        console.log("poop");
        while (canvas2 === null) {
            canvas2 = document.getElementById('myCanvas2');
            if (canvas2) {
                context2 = canvas2.getContext('2d');
            }
        }
    }

    var coordinates = [];
    var coordinates2 = [];

    //headers for api calls
    var config = {
        headers: {
            'Content-Type': 'application/json; charset="utf-8"',
            'X-TBA-App-Id': '3316:Kassandra:2.0'
        }
    };

    $scope.accessToken = "OMRI_GRANTED";

    function clear_all(){
        canvas = null;
        context = null;
        canvas2 = null;
        context2 = null;
        coordinates = [];
        coordinates2 = [];
        $scope.matches = [];
        $scope.teams = [];
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
                window.location.href = "#/team_picker";
            }
        });
    }

    $scope.init = function () {
        console.log("init!");
        var accessToken = $cookies.get("access_token");
        if (accessToken !== 'OMRI_GRANTED') {
            window.location.href = '#/login';
        }
    }

    $scope.admin = function () {
        console.log("make admin cookie");
    }

    //these matches are a test only
    $scope.get_matches = function () {
        var url = "https://www.thebluealliance.com/api/v2/event/2016txlu/matches";
        $http.get(url, config).then(function (data) {
            var jdata = data[Object.keys(data)[0]];
            var matches = [];
            jdata.forEach(function (element) {
                var match = (element.comp_level).toUpperCase() + element.match_number + 'm' + element.set_number;
                matches.push(match);
                //console.log(match);
            }, this);
            $scope.matches = matches;
        });
    }

    //gets teams of the current match
    $scope.get_teams = function (match) {
        var ending = "2016txlu_" + match.toLowerCase();
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
        if (t != undefined && m != undefined){
            location.href = "/#/autonomous/" + m + "/" + t;
            $scope.allData.team = t;
            $scope.allData.match = m;
        }
    }

    $scope.teleop = function () {
        location.href = "/#/teleop/" + $scope.match + "/" + $scope.team;
    }

    $scope.pull_matches = function () {
        //pull matches from data base
        $scope.db_matches = ["QM3", "QM2", "QM1"];
    }

    $scope.pull_teams = function () {
        
        // $scope.db_teams = ["0002", "1232", "3232"];
        $http.get("/get_all_teams").then(function(data){
            console.log(data);
            $scope.db_teams = data.data;
        });
    }

    $scope.team_selected = function (team) {
        $scope.db_team = team;
        $scope._match = [];
        $http.get("/get_cycles_by_team/" +team).then(function(data){
            console.log(data);
            data.data.forEach(function(element) {
                $scope._match.push(element.match);
                // Object.keys(element).forEach(function(k){
                //     area.innerHTML += '<p class="team-data">' + k + ' - ' + JSON.stringify(element[k]) + '</p>';
                // });
            }, this);
        });
        console.log($scope._match);
    }

    $scope.match_selected = function (match) {
        document.getElementById("link_area").innerHTML += "<a href=" + match + ">" + match + "</a>"
    }

    $scope.updateTeam_picker = function (t, m) {
        $scope.allData.team = t;
        $scope.allData.match = m;
    }

    $scope.updateAuto = function (triedAndFailed, crosedBaseline, fuelCollectedFromFloor,
        fuelCollectedFromHopper, estimatedPoints, succeessfullyPlantedGears, missedGears, releasedHopper) {
        $scope.allData.auto.triedAndFailed = triedAndFailed;
        $scope.allData.auto.crosedBaseline = crosedBaseline;
        $scope.allData.auto.fuelCollectedFromFloor = fuelCollectedFromFloor;
        $scope.allData.auto.fuelCollectedFromHopper = fuelCollectedFromHopper;
        $scope.allData.auto.estimatedPoints = estimatedPoints;
        $scope.allData.auto.succeessfullyPlantedGears = succeessfullyPlantedGears;
        $scope.allData.auto.missedGears = missedGears;
        $scope.allData.auto.releasedHopper = releasedHopper;
        $scope.allData.auto.coordinates.coords = coordinates;
    }

    $scope.updateTeleop = function (releasedHopper, gearsCollectedFromHP, gearsCollectedFromFloor, plantedGears,
        missedGears, fuelCollectedFromFloor, fuelCollectedFromHP, estimatedPoints, climbingTriedFailed, climbingSuccesss) {
        $scope.allData.teleop.releasedHopper = releasedHopper;
        $scope.allData.teleop.gearsCollectedFromHP = gearsCollectedFromHP;
        $scope.allData.teleop.gearsCollectedFromFloor = gearsCollectedFromFloor;
        $scope.allData.teleop.plantedGears = plantedGears;
        $scope.allData.teleop.missedGears = missedGears;
        $scope.allData.teleop.fuelCollectedFromFloor = fuelCollectedFromFloor;
        $scope.allData.teleop.fuelCollectedFromHopper = fuelCollectedFromHP;
        $scope.allData.teleop.estimatedPoints = estimatedPoints;
        $scope.allData.teleop.climbingTriedFailed = climbingTriedFailed;
        $scope.allData.teleop.climbingSuccesss = climbingSuccesss;
        $scope.allData.teleop.coordinates.coords = coordinates2;
    }

    $scope.updateDefense = function (defenseComments) {
        $scope.allData.defense.defenseComments = defenseComments;
    }
    
    window.get_single_match =  function(btn){
        var team = parseInt($scope.db_team);
        var match = btn.value;
        console.log("avad!!!");
        location.href = '#/report/'+team+'/'+match;
    }

    $scope.finalButton = function (generalComments) {
        $scope.allData.generalComments = generalComments;
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

    $scope.make_call = function(team, match){
        console.log(team + ", " + match);
        $scope.team = team;
        $scope.match = match;
        $http.get("/get_cycle/" + team + "/"+ match).then(function (data){
            console.log(data.data);
            $scope.tf = data.data[0].auto.triedAndFailed;
            $scope.cb = data.data[0].auto.crosedBaseline;
            $scope.cff = data.data[0].auto.fuelCollectedFromFloor;
            $scope.rh = data.data[0].auto.releasedHopper;
            $scope.spg = data.data[0].auto.succeessfullyPlantedGears;
            $scope.mg = data.data[0].auto.missedGears;
            
        });
    }

    // $http.get('/teams').then(function (data) {
    //     $scope.getdata = data.data;
    // }, function (err) {
    //     console.log(err);
    // });
});