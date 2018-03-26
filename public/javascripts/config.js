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
        let key = $scope.sortFilter
        $scope.teamsAverages = $scope.teamsAverages.sort((a, b) => {
          if (a[key] > b[key]) return -1
          if (a[key] < b[key]) return 1
          return 0
        })
      }
    }
  })

  $stateProvider.state({
    name: 'alliance_picking',
    url: '/alliance_picking',
    templateUrl: '/views/alliance-picking.html',
    controller: function ($scope) {
      $scope.pickFilter = 'firstPick'

      const teamsDisplay = rankings => rankings.map(teamRank => {
        const { number, rank } = teamRank
        const averages = $scope.teamsAverages.filter(({ _id }) => _id === number)[0]
        const emptyAvg = {
          scale: -1,
          switch: -1,
          exchange: -1
        }

        return {
          number,
          rank,
          scale: (averages || emptyAvg).scale,
          switch: (averages || emptyAvg).switch,
          exchange: (averages || emptyAvg).exchange
        }
      })

      $scope.getTeamsAverages()
        .then(() => $scope.getTeamsRankings())
        .then(({ firstPick, secondPick, other }) => {
          console.log($scope.teamsAverages)
          $scope.pickedTeams = teamsDisplay(firstPick)
          $scope.firstPick = firstPick
          $scope.secondPick = secondPick
          $scope.other = other
        })

      $scope.changePicks = () => {
        $scope.pickedTeams = teamsDisplay($scope[$scope.pickFilter])
      }
    }
  })

  $urlRouterProvider.otherwise('/')
})
