
var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr' ,function ($scope, $http, $cookies) {
    $scope.matches = ['dan', 'shirel'];
    $scope.teams = ['555', '666', '777'];
    $scope.accessToken = "OMRI_GRANTED";

    $scope.checkPass = function(){
        var pass = document.getElementById("pass").value;
        $http({
            method: 'POST',
            url: '/check_pass',
            data: {password: pass}
        }).then(function successCallback(response){
            alert(response.data.message);
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
})
    .config(function ($mdThemingProvider, $stateProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('cyan')
            .accentPalette('teal');

        $stateProvider.state({
            name: 'team_picker',
            url: '/team_picker',
            templateUrl: '/views/team_picker.html'
        });
        $stateProvider.state({
            name: 'about',
            url: '/about',
            template: '<h3>Its the UI-Router hello world app!</h3>'
        });
        $stateProvider.state({
            name: 'login',
            url: '/login',
            templateUrl: '/views/login.html' 
        });
});