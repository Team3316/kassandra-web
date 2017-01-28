
var app = angular.module("Kassandra", ['ngMaterial', 'ui.router']);
app.controller('ctr', function ($scope, $http) {
    $scope.matches = ['dan', 'shirel'];
    $scope.teams = ['555', '666', '777'];

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