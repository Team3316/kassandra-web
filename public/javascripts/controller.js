
var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr', function ($scope, $http, $cookies) {
    $scope.matches = [];
    $scope.teams = [];

    $http.get('javascripts/data.json').then(function (response) {
            $scope.allData = response.data;
        }, function (err) {
            console.log(err);
        });
    //canvas for field
    var canvas;
    var context;

    //intialize canvas shit
    angular.element(document).ready(function () {
        canvas = document.getElementById('myCanvas');
        context = canvas.getContext('2d');
    });

    //headers for api calls
    var config = {
        headers: {
            'Content-Type': 'application/json; charset="utf-8"',
            'X-TBA-App-Id': '3316:Kassandra:2.0'
        }
    };

    var coordinates = [];

    $scope.accessToken = "OMRI_GRANTED";

    $scope.addOnClick = function (event) {
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

    $scope.updateTeam_picker = function(){
        $scope.allData.team = $scope.team;
        $scope.allData.match = $scope.match;
        
    }


    $scope.clear = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordinates = [];
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
                console.log($cookies.get("access_token"));
                //$cookies.remove('access_token');
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
        $scope.allData.team = t;
        $scope.allData.match = m;
        if (t != undefined && m != undefined)
            location.href = "/#/autonomous/" + m + "/" + t;
    }

    $scope.updateAuto = function(triedAndFailed,crosedBaseline,fuelCollectedFromFloor,fuelCollectedFromHopper,estimatedPoints,succeessfullyPlantedGears,missedGears,releasedHopper){
        
        $scope.allData.auto.triedAndFailed = triedAndFailed;
        $scope.allData.auto.crosedBaseline = crosedBaseline;
        $scope.allData.auto.fuelCollectedFromFloor = fuelCollectedFromFloor;
        $scope.allData.auto.fuelCollectedFromHopper = fuelCollectedFromHopper;
        $scope.allData.auto.estimatedPoints = estimatedPoints;
        $scope.allData.auto.succeessfullyPlantedGears = succeessfullyPlantedGears;
        $scope.allData.auto.missedGears = missedGears;
        $scope.allData.auto.releasedHopper = releasedHopper;
        
        
    }

        $scope.updateTeleop = function(releasedHopper,gearsCollectedFromHP,gearsCollectedFromFloor,plantedGears,missedGears,fuelCollectedFromFloor,fuelCollectedFromHP,estimatedPoints,climbingTriedFailed,climbingSuccesss){
        
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
        
    }

    $scope.updateDefense = function(defenseComments){

        $scope.allData.defense.defenseComments = defenseComments; 

    }

    $scope.finalButton = function(generalComments) {
        $scope.allData.generalComments = generalComments;
    }

    $http.post('/new_team', {"team":$scope.allData} ).then(function (data) {
        console.log(data);
        console.log("DanSUBMIT");
    }, function (err) {
        console.log(err);
    });
    
    $http.get('/teams').then(function (data) {
        $scope.getdata = data.data;
    }, function (err) {
        console.log(err);
    });
});