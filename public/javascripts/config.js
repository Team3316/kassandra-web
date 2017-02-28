app.config(function ($mdThemingProvider, $stateProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('cyan')
        .accentPalette('teal');

    $stateProvider.state({
        name: 'team_picker',
        url: '/team_picker',
        templateUrl: '/views/team_picker.html',
        controller: function ($scope) {
            $scope.init();
        }
    });

    $stateProvider.state({
        name: 'autonomous',
        url: '/autonomous/:match/:team',
        templateUrl: '/views/autonomous.html',
        controller: function ($scope, $stateParams) {
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
        controller: function ($scope) {
            $scope.init();
        }
    });

    $stateProvider.state({
        name: 'final_page',
        url: '/final_page/:match/:team',
        templateUrl: '/views/final_page.html',
        controller: function ($scope) {
            $scope.init();
        }
    });

    $stateProvider.state({
        name: 'defense',
        url: '/defense/:match/:team',
        templateUrl: '/views/defense.html',
        controller: function ($scope, $stateParams) {
            $scope.match = $stateParams.match;
            $scope.team = $stateParams.team;
            console.log("match: " + $stateParams.match);
            console.log("team: " + $stateParams.team);
            $scope.init();
        }
    });

    $stateProvider.state({
        name: 'login',
        url: '/login',
        templateUrl: '/views/login.html'
    });

    $stateProvider.state({
        name: 'data',
        url: '/data',
        templateUrl: '/views/data.html'
    });
});