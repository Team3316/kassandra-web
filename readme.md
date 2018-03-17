Team Picker:
    Controller:
        clear_all() --> javascripts/data.json --> $scope.cycle_data
        pull_matches_from_tba() --> /eventname --> thebluealliance.com --> $scope.matches
    md-select or input:
        get_teams_in_match(match)
    Bottons:
        set_color(match)
        
Admin:
    Controller:
        pull_teams_from_db() --> /get_all_teams --> getAllTeams --> $scope.db_teams
    mg-select or ng-init:
        team_selected(id) --> /get_all_cycles_by_team/:id --> getCyclesByTeam(id, true) --> $scope.team_cycles
    Buttons:
        get_single_match(id) --> /report/:id
        
Autonomous:
    Buttons:
        dec_counter(value, 1)
        inc_counter(value, 1)
        
Teleop:
    Buttons:
        dec_counter(value, 1)
        inc_counter(value, 1)
        
Final:
    ng-click:
        submit_data(cycle_data) --> /new_cycle --> newCycle
    Bottons:
        concat_comment(...)
        
Table:
    Controller:
        pull_matches_from_tba() --> thebluealliance.com --> $scope.matches
        pull_match_team() --> /get_cycles --> getCycles --> $scope.match_team_dictionary
    Table:
        entry_exists(match, team)
        team_filtered(team, filter_team)

Report:
    Controller:
        get_cycle(id) --> /get_cycle/:id --> getCycle(id) --> $scope.cycle_data
    Buttons:
        hideCycle(id) --> /hide_cycle/:id --> hideCycle(id) --> $scope.cycle_data.is_hidden
        unhideCycle(id) --> /unhide_cycle/:id --> unhideCycle(id) --> $scope.cycle_data.is_hidden

Export:
    Controller:
        export_csv(id) --> /get_cycles_by_team/:id --> getCyclesByTeam(id, false) --> Download CSV