/* global angular */
const app = angular.module('Kassandra', ['ngMaterial', 'ngCookies', 'ui.router'])

app.controller('appCtrl', function ($rootScope, $scope, $http, $cookies, $location, $state) {
  // Format used by TBA: frc3316 --> 3316
  const formatTeam = teamStr => teamStr.replace('frc', '')

  const formatMatch = element => {
    const match = element.key.split('_')
    element.name = match[match.length - 1].toUpperCase()
    element.alliances.red.teams = element.alliances.red.teams.map(formatTeam)
    element.alliances.blue.teams = element.alliances.blue.teams.map(formatTeam)
    return element
  }

  const sortByTime = (a, b) => {
    if (a.time < b.time) return -1
    if (a.time > b.time) return 1
    return 0
  }

  const matchValue = {PM: 0, QM: 1000, QF: 2000, SF: 3000, F1: 4000}
  const getMatchNumber = match => {
    if (Number.isInteger(match)) return match

    const matchType = match.slice(0, 2)
    var value = matchValue[matchType]
    if (matchType === 'F1') {
      value += parseInt(match[3])
    } else if (matchType === 'QF' || matchType === 'SF') {
      value += parseInt(match[2]) * 100 + parseInt(match[4])
    } else {
      value += parseInt(match.slice(2, 4))
    }
    return value
  }

  $scope.sortByMatch = (a, b) => getMatchNumber(a.value) - getMatchNumber(b.value)

  const isEmptyMatch = item => item.match !== ''
  const sortParseInt = (a, b) => parseInt(a, 10) - parseInt(b, 10)

  $scope.getValueColor = Value => ({ 'color': Value ? 'green' : 'red' })

  /*************************************************************************
   ** Data pulling into local variables                                   **
   *************************************************************************/

  /*
   * Creates a map of the teams per match number in the DB
   */
  $scope.teamsPerMatch = {}
  $scope.pullMatchTeam = () => {
    $http.get('/export_cycles').then(({ data }) => {
      $scope.teamsPerMatch = data.reduce((prev, { match, team }) => {
        const lastData = prev[match]
        prev[match] = !!lastData && lastData.length > 0 ? [...lastData, team] : [team]
        return prev
      }, {})
    })
  }

  /*
   * Clears cycle data
   */
  $scope.cycleData = {}
  $scope.clearAll = () => {
    $http.get('javascripts/data.json')
      .then(({ data }) => {
        $scope.cycleData = data
      })
      .catch(err => {
        $scope.cycleData = {}
        console.err(err)
      })
  }

  /*
   * Loads cycle data from db
   */
  $scope.getCycle = id => {
    $http.get('/get_cycle/' + id)
      .then(({ data }) => {
        $scope.cycleData = data
      })
      .catch(err => {
        $scope.cycleData = {}
        console.err(err)
      })
  }

  /*
   * Pulls all matches from TBA into $scope.matches
   */
  $scope.matches = []
  $scope.pullMatchesFromTBA = () => {
    // Fetch current event name from server
    $http.get('/eventname').then(({ data }) => {
      const url = 'https://www.thebluealliance.com/api/v2/event/2018' + data + '/matches'

      // Headers required by TBA API
      const config = {
        headers: {
          'Content-Type': 'application/json; charset="utf-8"',
          'X-TBA-App-Id': '3316:Kassandra:3.0'
        }
      }

      // Fetch matches of given event name from TBA
      return $http.get(url, config)
    }).then(({ data }) => {
      $scope.matches = data
        .sort(sortByTime)
        .map(formatMatch)
        .filter(isEmptyMatch)
    }).catch(err => console.err(err))
  }

  /*
   * Gets teams of the given match from $scope.matches
   */
  $scope.getTeamsInMatch = matchId => {
    const match = $scope.matches.find((m) => m.name === matchId)
    return !match ? [] : match.alliances.blue.teams.concat(match.alliances.red.teams)
  }

  /*************************************************************************
   ** Data submiting functions                                            **
   *************************************************************************/

  /*
   * Submits cycle data
   */
  $scope.submitData = cycleData => {
    $http.post('/new_cycle', { cycleData })
      .then(() => $location.url('/team_picker'))
      .catch(err => console.err(err))
  }

  $scope.decCounter = (number, step) => Math.max(0, number - step)
  $scope.incCounter = (number, step) => number + step

  $scope.concatComment = (main, comment) => !main ? comment : main.concat(', ', comment)

  /*************************************************************************
   ** Admin page                                                          **
   *************************************************************************/
  // pulls teams from DB to $scope.db_teams
  $scope.pullTeamsFromDB = () => {
    $http.get('/get_all_teams').then(({ data }) => {
      $scope.db_teams = data.sort(sortParseInt)
    })
  }

  $scope.teamSelected = team => {
    $http.get('/get_all_cycles_by_team/' + team).then(({ data }) => {
      $scope.team_cycles = data
      $scope.selectedTeam = team
    })
  }

  $scope.getCyclesByTeam = team => {
    $http.get('/get_cycles_by_team/' + team).then(({ data }) => {
      $scope.team_cycles = data
      $scope.selectedTeam = team
    })
  }

  window.getSingleMatch = ({ value }) => {
    $location.path('/report/' + value)
    $scope.$apply()
  }

  $scope.setColor = ({ isVisible }) => ({ 'background-color': isVisible ? '#008CBA' : '#333' })

  /*************************************************************************
   ** Report page                                                         **
   *************************************************************************/
  $scope.hideCycle = id => {
    $http.get('/hide_cycle/' + id).then(({ data }) => {
      if (data.nModified === 1) {
        $scope.cycleData.isVisible = false
      }
    })
  }

  $scope.unhideCycle = id => {
    $http.get('/unhide_cycle/' + id).then(({ data }) => {
      if (data.nModified === 1) {
        $scope.cycleData.isVisible = true
      }
    })
  }

  /*************************************************************************
   ** Table page                                                         **
   *************************************************************************/
  $scope.entryExists = (match, team) => (match in $scope.teamsPerMatch) && ($scope.teamsPerMatch[match].includes(parseInt(team)))
  $scope.teamFiltered = (team, filterTeam) => filterTeam && team.includes(filterTeam)

  /*************************************************************************
   ** Alliance picking page
   *************************************************************************/
  $scope.teamsAverages = []
  $scope.getTeamsAverages = () => {
    $http.get('/get_teams_averages').then(({ data }) => {
      $scope.teamsAverages = data.sort((a, b) => {
        if (a.overallAverage > b.overallAverage) return -1
        if (a.overallAverage < b.overallAverage) return 1
        return 0
      })
    })
  }
})

app.directive('capitalize', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      const capitalize = function (inputValue) {
        if (inputValue === undefined) inputValue = ''
        const capitalized = inputValue.toUpperCase()
        if (capitalized !== inputValue) {
          modelCtrl.$setViewValue(capitalized)
          modelCtrl.$render()
        }
        return capitalized
      }
      modelCtrl.$parsers.push(capitalize)
      capitalize(scope[attrs.ngModel])
    }
  }
})
