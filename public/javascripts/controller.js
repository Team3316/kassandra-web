var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr' ,function ($scope, $http, $cookies) {
    $scope.matches = [];
    $scope.teams = [];
    //to delete
    //$cookies.remove("access_token");

    //canvas for field
    var canvas = undefined;
    var context= undefined;

    var canvas2= undefined;
    var context2= undefined;

    $scope.find_canvas = function(){
        while(canvas === undefined && context === undefined){
            canvas = document.getElementById('myCanvas');
            context = canvas.getContext('2d');
        }
    };

    $scope.find_canvas2 = function(){
        while(canvas2 === undefined && context2 === undefined){
            canvas2 = document.getElementById('myCanvas');
            context2 = canvas.getContext('2d');
        }
    }

    //headers for api calls
    var config = {
        headers: {
            'Content-Type' : 'application/json; charset="utf-8"',
            'X-TBA-App-Id' : '3316:Kassandra:2.0'
        }
    };

    var coordinates = [];
    var coordinates2 = [];
        
    $scope.accessToken = "OMRI_GRANTED";

    $scope.addOnClick = function(event){
        if(canvas.getContext){
            var x = event.offsetX;
            var y = event.offsetY;
            //console.log("x: " + x + ", y: " + y);
            coordinates.push({x, y});
            console.log(coordinates);       
            context.beginPath();
            context.strokeStyle = "#e74c3c";
            context.arc(x, y, 10, 0, 2 * Math.PI, false);
            context.stroke();
        }
        else{
            find_canvas();
        }
    }

    $scope.addOnClick2 = function(event){
        if(canvas2.getContext){
            var x = event.offsetX;
            var y = event.offsetY;
            //console.log("x: " + x + ", y: " + y);
            coordinates2.push({x, y});
            console.log("2:" + coordinates2);       
            context2.beginPath();
            context2.strokeStyle = "#e74c3c";
            context2.arc(x, y, 10, 0, 2 * Math.PI, false);
            context2.stroke();
        }
        else{
            find_canvas2();
        }
    }

    $scope.clear = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordinates = [];
    }

    $scope.undo = function(){
        coordinates.pop();
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordinates.forEach(function(element) {
            console.log(element.x + "," + element.y)
            context.beginPath();
            context.strokeStyle = "#e74c3c";
            context.arc(element.x, element.y, 10, 0, 2 * Math.PI, false);
            context.stroke();
        }, this);
    }

    $scope.checkPass = function(){
        var pass = document.getElementById("pass").value;
        $http({
            method: 'POST',
            url: '/check_pass',
            data: {password: pass}
        }).then(function successCallback(response){
            if(response.data.message === "OMRI_GRANTED"){
                $cookies.put('access_token', 'OMRI_GRANTED');
                window.location.href = "#/team_picker";
            }
        });
    }

    $scope.init = function(){
        console.log("init!");
        var accessToken = $cookies.get("access_token");
        if(accessToken !== 'OMRI_GRANTED'){
            window.location.href = '#/login';
        }
    }

    $scope.admin = function(){
        console.log("make admin cookie");
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

    $scope.teleop = function(){
        location.href = "/#/teleop/" + $scope.match + "/" + $scope.team;
    }

    $scope.pull_matches = function(){
        //pull matches from data base
        $scope.db_matches = ["QM3", "QM2", "QM1"];
    }

    $scope.pull_teams = function(){
        $scope.db_teams = ["0002", "1232", "3232"];
    }

    $scope.team_selected = function(team){
        document.getElementById("link_area").innerHTML += "<a href="+team+">" +team+ "</a>"
    }
    
    $scope.match_selected = function(match){
        document.getElementById("link_area").innerHTML += "<a href="+match+">" +match+ "</a>"
    }
})
.config(function ($mdThemingProvider, $stateProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('cyan')
            .accentPalette('teal');

        $stateProvider.state({
            name: 'login',
            url: '/login',
            templateUrl: '/views/login.html'
        });    

        $stateProvider.state({
            name: 'team_picker',
            url: '/team_picker',
            templateUrl: '/views/team_picker.html',
            controller: function($scope){
                $scope.init();
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
                $scope.init();
            }
        });

        $stateProvider.state({
            name: 'teleop',
            url: '/teleop/:match/:team',
            templateUrl: '/views/teleop.html',
            controller: function($scope, $stateParams){
                $scope.match = $stateParams.match;
                $scope.team = $stateParams.team;
                console.log("match: " + $stateParams.match);
                console.log("team: " + $stateParams.team);
                $scope.init();
            }
        });

        $stateProvider.state({
            name: 'final_page',
            url: '/final_page/:match/:team',
            templateUrl: '/views/final_page.html',
            controller: function($scope){
                $scope.init();
            }
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
                $scope.init();
            }
        });

        $stateProvider.state({
            name: 'admin',
            url: '/admin',
            templateUrl: '/views/admin.html',
            controller: function($scope, $stateParams){
                $scope.admin();
            }
        });
});