var app = angular.module("Kassandra", ['ngMaterial', 'ngCookies', 'ui.router']);
app.controller('ctr', function ($rootScope, $scope, $http, $cookies, $location, $state) {
    
    /*************************************************************************
     ** Util functions                                                      **
     *************************************************************************/
     
    function format_team(team_str) {
        // Format used by TBA: frc3316 --> 3316
        return team_str.replace('frc', '');
    }
    
    function format_match(element, index, arr) {
        var match = element.key.split("_");
        element.name = match[match.length - 1].toUpperCase();
        element.alliances.red.teams = element.alliances.red.teams.map(format_team);
        element.alliances.blue.teams = element.alliances.blue.teams.map(format_team);
    }
    
    function sort_by_time(a, b) {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        return 0;
    }
    
    function is_empty_match (item) {
        return !(item.match === "");
    }
    
    function sort_parse_int(a, b) {
        a_int = parseInt(a, 10);
        b_int = parseInt(b, 10);

        return a_int - b_int;
    }
    
    /*************************************************************************
     ** Data pulling into local variables                                   **
     *************************************************************************/
    
    // Map from match number to teams in DB
    $scope.match_team_dictionary = {};
    $scope.pull_match_team = function () {
        $http.get('/get_cycles').then(function (data) {
                data.data.forEach(function (element) {
                    $scope.match_team_dictionary[element.match]=[];
                });
                data.data.forEach(function (element) {
                    $scope.match_team_dictionary[element.match].push(element.team);
                });
            });
    }
    
    // clear cycle data.
    $scope.cycle_data = {};
    $scope.clear_all = function () {
        $http.get('javascripts/data.json').then(function (response) {
            $scope.cycle_data = response.data;
        }, function (err) {
            $scope.cycle_data = {};
            console.log(err);
        });
    }
    
    // load cycle data from db.
    $scope.get_cycle = function(id) {
        $http.get('/get_cycle/' + id).then(function (response) {
            $scope.cycle_data = response.data;
        }, function (err) {
            clear_data();
            console.log(err);
        });
    }
    
    // pulls all matches from TBA into $scope.matches
    $scope.matches = [];
    $scope.pull_matches_from_tba = function () {
        // Fetch current event name from server
        $http.get('/eventname').then(function (response) {
            var url = "https://www.thebluealliance.com/api/v2/event/2018" + response.data + "/matches";
            
            // Headers required by TBA API
            var config = {
                headers: {
                    'Content-Type': 'application/json; charset="utf-8"',
                    'X-TBA-App-Id': '3316:Kassandra:3.0'
                }
            };
            
            // Fetch matches of given event name from TBA
            $http.get(url, config).then(function (response) {
                var data = response[Object.keys(response)[0]];
                data.sort(sort_by_time);
                data.forEach(format_match);
                $scope.matches = data.filter(is_empty_match);
            }, function (err) {console.log(err)});
        }, function (err) {console.log(err)});
    }    

    // gets teams of the given match from $scope.matches
    $scope.get_teams_in_match = function (match) {
        var match = $scope.matches.find(function(m) { return m.name == match });
        if (!match) return [];
        return match.alliances.blue.teams.concat(match.alliances.red.teams);
    }
    
    
    
    $scope.pull_top_exchange = function() {
        $http.get('/top_exchange').then(function (data) {
            $scope.top_exchange = data.data;
        })
    }
    
    $scope.pull_top_switch = function() {
        $http.get('/top_exchange').then(function (data) {
            $scope.top_exchange = data.data;
        })
    }
    
    $scope.pull_top_scale = function() {
        $http.get('/top_exchange').then(function (data) {
            $scope.top_exchange = data.data;
        })
    }

    /*************************************************************************
     ** Data submiting functions                                            **
     *************************************************************************/
    // submit data
    $scope.submit_data = function (cycle_data) {
        $http.post('/new_cycle', {'cycle_data': cycle_data})
             .then(function (response) {$location.url('/team_picker');},
                   function (err) {console.log(err)});
    }
    
    $scope.dec_counter = function(number, step) { 
        return Math.max(0, number - step);
    }

    $scope.inc_counter = function(number, step) {
        return number + step;
    }

    $scope.concat_comment = function(main, comment) {
        if (!main) return comment;
        else return main.concat(', ', comment);
    }


    /*************************************************************************
     ** Admin page                                                          **
     *************************************************************************/
    // pulls teams from DB to $scope.db_teams
    $scope.pull_teams_from_db = function () {
        $http.get("/get_all_teams").then(function (data) {
            $scope.db_teams = data.data;
            $scope.db_teams.sort(sort_parse_int);
        });
    }
    
    $scope.team_selected = function (team) {
        $scope.db_team = team;
        $http.get("/get_all_cycles_by_team/" + team).then(function(data){
            $scope.team_cycles = data.data;
        });
    }
    
    window.get_single_match = function (btn) {
        $location.path('/report/' + btn.value);
        $scope.$apply();
    }

    window.get_overall = function () {
        var team = parseInt($scope.db_team);
        $http.get('/get_cycles_by_team/' + team).then(function (data) {
            $state.go('overall_report', { obj: data.data });
        });
    }

    $scope.set_color = function (match) {
        if (match.is_visible) {
            return { "background-color": "#008CBA" };
        } else {
            return { "background-color": "#333" };
        }
    }

    /*************************************************************************
     ** Report page                                                         **
     *************************************************************************/
    $scope.hideCycle = function (id) {
        $http.get("/hide_cycle/" + id).then(function(data){
            if(data.data.nModified == 1) {
                $scope.cycle_data.is_visible = false;
            }
        });
    }

    $scope.unhideCycle = function (id) {
        $http.get("/unhide_cycle/" + id).then(function(data){
            if(data.data.nModified == 1) {
                $scope.cycle_data.is_visible = true;
            }
        });
    }
    
    /*************************************************************************
     ** Table page                                                         **
     *************************************************************************/
    
    $scope.entry_exists = function (match, team) {
        return (match in $scope.match_team_dictionary) && ($scope.match_team_dictionary[match].includes(parseInt(team)));
    }

    $scope.team_filtered = function (team, filter_team) {
        return filter_team && team.includes(filter_team);
    }

    $scope.get_color = function (numerator, denominator, lower, upper) {
        var num = numerator/denominator;
        if (num > upper) {
            return "#b3ffb3"; //green
        }
        if (num < lower) {
            return "#ffb3b3"; //red
        }
        return "#ffffb3"; //yellow
    }
  });

app.directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
  });