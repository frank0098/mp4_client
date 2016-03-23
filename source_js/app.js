var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
    when('/users/:id', {
    templateUrl: 'partials/userprofile.html',
    controller: 'UserProfile'
  }).
    when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
    when('/tasks/:id', {
    templateUrl: 'partials/taskdetail.html',
    controller: 'TaskDetail'
  }).
    when('/firstview', {
    templateUrl: 'partials/firstview.html',
    controller: 'FirstController'
  }).
  when('/secondview', {
    templateUrl: 'partials/secondview.html',
    controller: 'SecondController'
  }).
  when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/llamalist', {
    templateUrl: 'partials/llamalist.html',
    controller: 'LlamaListController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
