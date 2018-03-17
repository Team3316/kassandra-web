app.config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('cyan')
        .accentPalette('teal');

    $stateProvider.state({
        name: 'team_picker',
        url: '/',
        templateUrl: '/views/team_picker.html',
        controller: function($scope, $stateParams) {
            $scope.clear_all();
            $scope.pull_matches_from_tba();
        }
    });

    $stateProvider.state({
        name: 'autonomous',
        url: '/autonomous/',
        templateUrl: '/views/autonomous.html'
    });

    $stateProvider.state({
        name: 'teleop',
        url: '/teleop/',
        templateUrl: '/views/teleop.html'
    });

    $stateProvider.state({
        name: 'final_page',
        url: '/final_page/',
        templateUrl: '/views/final_page.html'
    });

    $stateProvider.state({
        name: 'admin',
        url: '/admin',
        templateUrl: '/views/admin.html',
        controller: function($scope, $stateParams) {
            $scope.pull_teams_from_db();
        }
    });
    
    $stateProvider.state({
        name: 'report',
        url: '/report/:id',
        templateUrl: '/views/report.html',
        controller: function ($scope, $stateParams) {
            $scope.get_cycle($stateParams.id);
        }
    });
    
    $stateProvider.state({
        name: 'table',
        url: '/table',
        templateUrl: '/views/table.html',
        controller: function ($scope, $stateParams) {
            $scope.pull_matches_from_tba();
            $scope.pull_match_team();
        }
    });

    $urlRouterProvider.otherwise('/');
});