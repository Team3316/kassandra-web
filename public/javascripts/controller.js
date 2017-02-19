
var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr' ,function ($scope, $http, $cookies) {
    $scope.matches = [];
    $scope.teams = [];
    
    var config = {
        headers: {
            'Content-Type' : 'application/json; charset="utf-8"',
            'X-TBA-App-Id' : '3316:Kassandra:2.0'
        }
    };
        
    $scope.accessToken = "OMRI_GRANTED";

    $scope.checkboxCrossLine = {
       crossLine : false
     };

    $scope.checkPass = function(){
        var pass = document.getElementById("pass").value;
        $http({
            method: 'POST',
            url: '/check_pass',
            data: {password: pass}
        }).then(function successCallback(response){
            alert(response.data.message);
        })
        .error(function(){
            checkPass();
        });
    }

    $scope.init = function(){
        console.log("init!");
        var accessToken = $cookies.get("access_token");
        if(accessToken === 'OMRI_GRANTED'){
            $location.path('/team_picker');
        }
        else{
            console.log("not logged in!");
        }
    }

    $scope.login = function(){
        var pass = document.getElementById("pass").value;
        $http.post({
            method:'POST',
            url: '/check_pass',
            data: {password: pass}
        }).then(function successCallback(response){
            alert(response.data.message);
        });
    }

    //these matches are a test only
    $scope.get_matches = function(){
        var url = "https://www.thebluealliance.com/api/v2/event/2016txlu/matches";
        $http.get(url, config).then(function(data){
            var jdata = data[Object.keys(data)[0]];
            var matches = [];
            jdata.forEach(function(element) {
                var match = (element.comp_level).toUpperCase() + element.match_number + 'm' + element.set_number;
                matches.push(match);
                //console.log(match);
            }, this);
            $scope.matches = matches;
        });
    }

    //gets teams of the current match
    $scope.get_teams = function(match){
        var ending = "2016txlu_" + match.toLowerCase();
        var url = "https://www.thebluealliance.com/api/v2/match/" + ending;
        $http.get(url, config).then(function(data){
            //console.log(JSON.stringify(data));
            //Why I did the shit down there
            var jdata = data[Object.keys(data)[0]];
            var red = jdata.alliances.red.teams;
            var blue = jdata.alliances.blue.teams;
            console.log(JSON.stringify(red));
            console.log(JSON.stringify(blue));
            var teams = blue.concat(red);
            var final = [];
            teams.forEach(function(element) {
                final.push(element.replace('frc', ''));
            }, this);
            $scope.teams = final;
        });
    }

    $scope.submit_team_match = function(t, m){
        if(t != undefined && m != undefined)
            location.href = "/#/autonomous/" + m + "/" + t;
    }
})
    .config(function ($mdThemingProvider, $stateProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('cyan')
            .accentPalette('teal');

        $stateProvider.state({
            name: 'team_picker',
            url: '/team_picker',
            templateUrl: '/views/team_picker.html',
            headers:{
                "Access-Control-Allow-Origin": "*"
            }
        });

        $stateProvider.state({
            name: 'autonomous',
            url: '/autonomous/:match/:team',
            templateUrl: '/views/autonomous.html',
            controller: function($scope, $stateParams){
                $scope.match = $stateParams.match;
                $scope.team = $stateParams.team;
                console.log("match: " + $stateParams.match);
                console.log("team: " + $stateParams.team);
            }
        });

        $stateProvider.state({
            name: 'teleop',
            url: '/teleop/:match/:team',
            templateUrl: '/views/teleop.html'
        });

        $stateProvider.state({
            name: 'final_page',
            url: '/final_page/:match/:team',
            templateUrl: '/views/final_page.html'
        });


        
        $stateProvider.state({
            name: 'defense',
            url: '/defense/:match/:team',
            templateUrl: '/views/defense.html',
            controller: function($scope, $stateParams){
                $scope.match = $stateParams.match;
                $scope.team = $stateParams.team;
                console.log("match: " + $stateParams.match);
                console.log("team: " + $stateParams.team);
                $scope.get_teams($scope.match);
            }
        });

        $stateProvider.state({
            name: 'login',
            url: '/login',
            templateUrl: '/views/login.html' 
        });
});