/* global angular, Blob, URL */
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

  // TODO - CHANGE FROM BARAK'S CODE TO AN ACTUAL CSV ENCODER.
  const processRow = row => {
    let finalVal = ''
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null ? '' : row[j].toString()
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString()
      }
      let result = innerValue.replace(/"/g, '""')
      if (result.search(/("|,|\n)/g) >= 0) {
        result = '"' + result + '"'
      }
      if (j > 0) {
        finalVal += ','
      }
      finalVal += result
    }
    return finalVal + '\n'
  }

  // TODO - Move this to the backend. This shouldn't envolve JavaScript code but rather should be generated automatically.
  const exportToCsv = (filename, rows) => {
    const csvFile = rows.reduce((prev, curr) => {
      return prev + processRow(curr)
    }, '')

    const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename)
    } else {
      const link = document.createElement('a')
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }

  $scope.exportCSV = () => {
    $http.get('/export_cycles/').then(({ data }) => {
      const climbMap = ['Didn\'t Try', 'Failed', 'Successful']
      const formattedData = data.map(element => ([
        '', // Full Name
        element.team,
        element.match,
        element.auto.autoRun ? 'TRUE' : 'FALSE',
        'FALSE', // Auto Exchange
        element.auto.switch,
        0, // Auto Switch Fails
        element.auto.scale,
        0, // Auto Scale Fails
        '', // Collection
        element.teleop.switch,
        0, // Teleop Switch Fails
        element.teleop.scale,
        0, // Teleop Scale Fails
        element.teleop.exchange,
        0, // Teleop Exchange Fails
        element.teleop.platform ? 'TRUE' : 'FALSE',
        climbMap[element.teleop.climb],
        climbMap[element.teleop.partnerClimb],
        element.techFoul ? 'TRUE' : 'FALSE',
        '', // Defense Comments
        element.comments
      ]))
      exportToCsv('export.csv', [['Header']].concat(formattedData))
    })
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
