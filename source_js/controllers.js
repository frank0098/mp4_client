var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http','BaseUrlData',
  function ($scope, $http, BaseUrlData) {
    var userurl = BaseUrlData.getData()+'/users';
    $http.get(userurl).success(function(data) {
      $scope.users=data.data;
    })
  }]);


mp4Controllers.controller('UserProfile', ['$scope', '$http','BaseUrlData','$location',
  function ($scope, $http,BaseUrlData,$location) {

    var uID = $location.path().split(/[\s/]+/).pop();
    var baseurl =  BaseUrlData.getData();
    var userurl = baseurl+'/users';
    $http.get(userurl+'/'+uID).success(function(retdata) {
      $scope.userdata = retdata.data;
      var username = retdata.data.name;
      var taskslist=retdata.data.pendingTasks[0];
      var taskdetail=[];
      // for(var x=0;x<taskslist.length;x++){
      //   $http.get(baseurl+'/tasks/'+taskslist[x]).success(function(taskdata){
      //     taskdetail.push(taskdata.data);
      //   })
      // }
      var completeurl = baseurl+'tasks?where={"assignedUserName":"'+username+'", "completed": true}';
      $scope.showcompleted = function(){
      $http.get(completeurl).success(function(completetasks){
        $scope.completedtasks = completetasks.data;
      })
    };
    
    })

  }]);

mp4Controllers.controller('TasksController', ['$scope', '$http','BaseUrlData','$location','taskliststart',
  function ($scope, $http,BaseUrlData,$location,taskliststart) {
    $scope.dropdown = [
        {'sortby': 'dateCreated'},
        {'sortby': 'deadline'},
        {'sortby': 'name'},
        {'sortby': 'assignedUserName'}
    ];
    var baseurl =  BaseUrlData.getData();

    
    $http.get(baseurl+'/tasks').success(function(data) {
      $scope.tasks=data.data;
      $scope.setprev=function(){
        var start=taskliststart.getstart();
        if(start>=10)
          taskliststart.setprev();
      }
      $scope.setnext=function(){
        var start=taskliststart.getstart();
        if(start<data.data.length-10)
          taskliststart.setnext();
      }
    });
  }]);

app.filter('startFrom', ['taskliststart', function(taskliststart) {
    return function(input) {
      if(input){
        var start = taskliststart.getstart();
          return input.slice(start);
      }
      return [];
        
    }
}]);

// app.filter('startFrom', function() {
//     return function(input) {
//         if(input) {
//           start=20;
//             return input.slice(start);
//         }
//         return [];
//     }
// });


mp4Controllers.controller('SettingsController', ['$scope' , '$window','BaseUrlData' , function($scope, $window,BaseUrlData) {
  $scope.url = $window.sessionStorage.baseurl;
  // $scope.displayText = BaseUrlData.getData();
  $scope.setUrl = function(){
    $window.sessionStorage.baseurl = $scope.url;
    BaseUrlData.setData($scope.url);
    // $scope.displayText = BaseUrlData.getData();

  };

}]);








mp4Controllers.controller('FirstController', ['$scope', 'CommonData'  , function($scope, CommonData) {
  $scope.data = "";
   $scope.displayText = ""

  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };

}]);

mp4Controllers.controller('SecondController', ['$scope', 'CommonData' , function($scope, CommonData) {
  $scope.data = "";

  $scope.getData = function(){
    $scope.data = CommonData.getData();

  };

}]);


mp4Controllers.controller('LlamaListController', ['$scope', '$http', 'Llamas', '$window' , function($scope, $http,  Llamas, $window) {

  Llamas.get().success(function(data){
    $scope.llamas = data;
  });


}]);