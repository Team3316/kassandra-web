app.config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('cyan')
        .accentPalette('teal');

    $stateProvider.state({
        name: 'team_picker',
        url: '/',
        templateUrl: '/views/team_picker.html',
        controller: function ($scope) {
            //$scope.init();
        }
    });

    $stateProvider.state({
        name: 'autonomous',
        url: '/autonomous/:match/:team',
        templateUrl: '/views/autonomous.html',
        controller: function ($scope, $stateParams) {
            $scope.r_match = $stateParams.match;
            $scope.r_team = $stateParams.team;
            console.log("match: " + $stateParams.match);
            console.log("team: " + $stateParams.team);
            //$scope.init();
        }
    });

    $stateProvider.state({
        name: 'teleop',
        url: '/teleop/',
        templateUrl: '/views/teleop.html',
        controller: function ($scope) {
            //$scope.init();
        }
    });

    $stateProvider.state({
        name: 'final_page',
        url: '/final_page/:match/:team',
        templateUrl: '/views/final_page.html',
        controller: function ($scope) {
            //$scope.init();
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
            //$scope.init();
        }
    });

    $stateProvider.state({
        name: 'admin',
        url: '/admin',
        templateUrl: '/views/admin.html'
    });

    $stateProvider.state({
        name: 'report',
        url: '/report/:id',
        templateUrl: '/views/report.html',
        controller: function ($scope, $stateParams) {
            var id = $stateParams.id;
            $scope.make_call(id);
        }
    });

    $stateProvider.state({
        name: 'overall_report',
        url: '/overall_report',
        params: {obj:null},
        templateUrl: '/views/overall_report.html',
        controller: function ($scope, $stateParams) {
            var obj = $stateParams.obj;
            $scope.overall_organize(obj);
        }
    });

    $stateProvider.state({
        name: 'table',
        url: '/table',
        templateUrl: '/views/table.html'
    });

    $stateProvider.state({
        name: 'top',
        url: '/top',
        templateUrl: '/views/top.html',
    });

    $urlRouterProvider.otherwise('/');
});