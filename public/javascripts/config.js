/* global app */
app.config(function ($mdThemingProvider, $stateProvider, $urlRouterProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('orange')
    .accentPalette('grey')

  $stateProvider.state({
    name: 'team_picker',
    url: '/',
    templateUrl: '/views/team_picker.html',
    controller: function ($scope, $stateParams) {
      $scope.clearAll()
      $scope.pullMatchesFromTBA()
    }
  })

  $stateProvider.state({
    name: 'autonomous',
    url: '/autonomous/',
    templateUrl: '/views/autonomous.html'
  })

  $stateProvider.state({
    name: 'teleop',
    url: '/teleop/',
    templateUrl: '/views/teleop.html'
  })

  $stateProvider.state({
    name: 'final_page',
    url: '/final_page/',
    templateUrl: '/views/final_page.html'
  })

  $stateProvider.state({
    name: 'admin',
    url: '/admin',
    templateUrl: '/views/admin.html',
    controller: function ($scope, $stateParams) {
      $scope.pullTeamsFromDB()
    }
  })

  $stateProvider.state({
    name: 'report',
    url: '/report/:id',
    templateUrl: '/views/report.html',
    controller: function ($scope, $stateParams) {
      $scope.getCycle($stateParams.id)
    }
  })

  $stateProvider.state({
    name: 'team_report',
    url: '/team_report/:team',
    templateUrl: '/views/team_report.html',
    controller: function ($scope, $stateParams) {
      $scope.getCyclesByTeam($stateParams.team)
    }
  })

  $stateProvider.state({
    name: 'table',
    url: '/table',
    templateUrl: '/views/table.html',
    controller: function ($scope, $stateParams) {
      $scope.pullMatchesFromTBA()
      $scope.pullMatchTeam()
    }
  })

  $stateProvider.state({
    name: 'rankings',
    url: '/rankings',
    templateUrl: '/views/rankings.html',
    controller: function ($scope, $stateParams) {
      $scope.sortFilter = 'overall'
      $scope.getTeamsAverages()

      $scope.sortTeamsAverages = () => {
        let key = `${$scope.sortFilter}Average`
        $scope.teamsAverages = $scope.teamsAverages.sort((a, b) => {
          if (a[key] > b[key]) return -1
          if (a[key] < b[key]) return 1
          return 0
        })
      }
    }
  })

  $urlRouterProvider.otherwise('/')
})
