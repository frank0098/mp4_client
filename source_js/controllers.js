var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('UsersController', ['$scope', '$http','BaseUrlData',
  function ($scope, $http, BaseUrlData) {
    var userurl = BaseUrlData.getData()+'users';
    $scope.message ="";
    $http.get(userurl+'?select={"_id":1,"name":1,"email":1}').success(function(data) {
      $scope.users=data.data;

    })

    $scope.deleteuserfunc=function(userid){
      var userdetailurl=userurl+"/"+userid;

      $http.get(userdetailurl).success(function(detaildata){
        var detail=detaildata.data;
        if(detail.pendingTasks.length!=0){
          var taskslist=detail.pendingTasks[0].split(',');
          $scope.msg=taskslist;
          angular.forEach(taskslist,function(item){
            var objid=item.replace(/[_\W]+/g, '');
            var everytaskurl=BaseUrlData.getData()+'tasks/'+objid;
            // console.log(everytaskurl);
            $http.get(everytaskurl).success(function(taskdata){
              var taskdetaildata=taskdata.data;
              var updatedtask={
                name:taskdetaildata.name,
                email:taskdetaildata.email,
                description:taskdetaildata.description,
                deadline:taskdetaildata.deadline,
                assignedUserName:"unassigned",
                assignedUser: ''
              }
              $http({
                  method  : 'PUT',
                  url     : everytaskurl,
                  data    : $.param(updatedtask), //forms user object
                  headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                 })

            })
          })

        }



        $http.delete(userdetailurl)
            .success(function(data) {
                $scope.message = data.message;
                $http.get(userurl).success(function(data) {
               $scope.users=data.data;
               $scope.msg=updatedtask;

            })
          })
          .error(function(data) {
               $scope.message = data.message;
               $scope.msg=data;
          });
      }

      )}
        

  }]);


mp4Controllers.controller('UserProfile', ['$scope', '$http','BaseUrlData','$location',
  function ($scope, $http,BaseUrlData,$location) {

    var uID = $location.path().split(/[\s/]+/).pop();
    var baseurl =  BaseUrlData.getData();
    var userurl = baseurl+'/users';
    $http.get(userurl+'/'+uID).success(function(retdata) {
      $scope.userdata = retdata.data;
      // $scope.new=retdata;
      var username = retdata.data.name;
      var email = retdata.data.email;
      var taskslist=[];
      if(retdata.data.pendingTasks.length!=0)
         taskslist=retdata.data.pendingTasks[0].split(',');
      var taskdetail=[];

      for(var x=0;x<taskslist.length;x++){
        var objid=taskslist[x].replace(/[_\W]+/g, '');
        $http.get(baseurl+'/tasks/'+objid).success(function(taskdata){
          taskdetail.push(taskdata.data);
        })
      }
      $scope.pendingTasks=taskdetail;
      var completeurl = baseurl+'tasks?where={"assignedUserName":"'+username+'", "completed": true}';
      $scope.showcompleted = function(){
      $http.get(completeurl).success(function(completetasks){
        $scope.completedtasks = completetasks.data;
      })
    };
      $scope.completetask=function(taskid){
        $http.get(baseurl+'/tasks/'+taskid).success(function(getdata){
          var retriveddata=getdata.data;
          $scope.submitdata={
            name: retriveddata.name,
            description:retriveddata.description,
            deadline:retriveddata.deadline,
            assignedUserName:retriveddata.assignedUserName,
            completed:true

          }
          $http({
              method  : 'PUT',
              url     : baseurl+'/tasks/'+taskid,
              data    : $.param($scope.submitdata), //forms user object
              headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
             }).success(function(data){
              $scope.returninfo = data.message;
              var newpendinglist=[];
              var container=[];
              for(var x=0;x<taskslist.length;x++){
                var objid=taskslist[x].replace(/[_\W]+/g, '');
                if(objid!=taskid){
                  newpendinglist.push(objid);
                }
              }
              container.push(newpendinglist);
              $http({
              method  : 'PUT',
              url     : userurl+'/'+uID,
              data    : $.param({name:username,email:email,pendingTasks:container}), //forms user object
              headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
             }).success(function(putdata){

              $scope.returninfo=putdata.message;

              $http.get(userurl+'/'+uID).success(function(newretdata){
                var newtaskslist=[];
                
                if(newretdata.data.pendingTasks.length!=0)
                      newtaskslist=newretdata.data.pendingTasks[0].split(',');
                    
                var newtaskdetail=[];
                if(newretdata.data.pendingTasks.length==0){
                  $scope.pendingTasks=[]
                  $scope.pendingTasks=newtaskdetail;
                }
                else{

                  for(var x=0;x<newtaskslist.length;x++){
                  var objid=newtaskslist[x].replace(/[_\W]+/g, '');
                  $http.get(baseurl+'/tasks/'+objid).success(function(taskdata){
                    newtaskdetail.push(taskdata.data);
                    $scope.pendingTasks=newtaskdetail;
                  })
                }
                

                }

              })
                 
             })

             }).error(function(data){
              $scope.returninfo = data.message;
             })
        })
        
      }

    
    })

  }]);

mp4Controllers.controller('AddUserController', ['$http','$scope' , '$window','BaseUrlData' , function($http,$scope, $window,BaseUrlData) {
  var userurl = BaseUrlData.getData()+'users';
  $scope.wtf=userurl;
  $scope.returninfo='';
  $scope.formdata={
    name:'',
    email:''
  }
  $scope.adduserfunc=function(){
    
    $http({
      method  : 'POST',
      url     : userurl,
      data    : $.param($scope.formdata),
      headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
     }).then(function(data){
      $scope.formdata={
        name:'',
        email:''
      }
      $scope.returninfo = data.data.message;
     },function(data){
      $scope.returninfo = data.data.message;
     })
  }


}]);


mp4Controllers.controller('TasksController', ['$scope', '$http','BaseUrlData','$location','taskliststart',
  function ($scope, $http,BaseUrlData,$location,taskliststart) {
    
    $scope.start=0;
    $scope.tasktype='All';
    $scope.orderv='false';
    $scope.reverse=false;
    $scope.ascending=1;

    var urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
    &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
    var baseurl =  BaseUrlData.getData();

    $scope.url=baseurl+urlsuffix;
    $scope.predicate = 'dateCreated';
    $scope.sortoption = {
    availableOptions: [
      {id: '1', name: 'dateCreated'},
      {id: '2', name: 'deadline'},
      {id: '3', name: 'name'},
      {id: '4', name: 'assignedUserName'},
    ],
    selectedOption: {id: '1', name: 'dateCreated'} 
    };
    $scope.updatesortoption=function(){
      $scope.start=0;
      $scope.predicate = $scope.sortoption.selectedOption.name;
      $scope.url=baseurl+urlsuffix;

      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
    &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
    if($scope.tasktype=='All'){
      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
    }
    else if($scope.tasktype=='Pending'){
      var moresuffix='&where={"completed": false}';
      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
    }
    else if($scope.tasktype=='Completed'){
      var moresuffix='&where={"completed": true}';
      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
    }

       $http.get(baseurl+urlsuffix).success(function(data) {
            $scope.tasks=data.data;
            $scope.url=baseurl+urlsuffix;
          });
    }

    $scope.setcompletionfunc=function(){
      taskliststart.setzero();
      $scope.start=0;
      $scope.url=baseurl+urlsuffix;
      if($scope.tasktype=='All'){
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
      }
      else if($scope.tasktype=='Pending'){
        var moresuffix='&where={"completed": false}';
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
      }
      else if($scope.tasktype=='Completed'){
        var moresuffix='&where={"completed": true}';
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
      }

     $http.get(baseurl+urlsuffix).success(function(data) {
          $scope.tasks=data.data;
          $scope.url=baseurl+urlsuffix;
        });

    }

    $scope.setorderfunc=function(){
      $scope.start=0;
      $scope.url=baseurl+urlsuffix;

      if($scope.ascending==1){
        $scope.ascending=-1;
      }
      else{
        $scope.ascending=1;
      }

      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';

      urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
      &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
      if($scope.tasktype=='All'){
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
      }
      else if($scope.tasktype=='Pending'){
        var moresuffix='&where={"completed": false}';
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
      }
      else if($scope.tasktype=='Completed'){
        var moresuffix='&where={"completed": true}';
        urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
      }

       $http.get(baseurl+urlsuffix).success(function(data) {
            $scope.tasks=data.data;
            $scope.url=baseurl+urlsuffix;
          });
    }
    

    $scope.setprev=function(){

        if($scope.start>=10){
          $scope.start=$scope.start-10;

          if($scope.tasktype=='All'){
                urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
            }
            else if($scope.tasktype=='Pending'){
              var moresuffix='&where={"completed": false}';
              urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                        &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
            }
            else if($scope.tasktype=='Completed'){
              var moresuffix='&where={"completed": true}';
              urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                        &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
            }

            $http.get(baseurl+urlsuffix).success(function(data) {
            $scope.tasks=data.data;
          });
        }
    }
    $scope.setnext=function(){
      var countsuffix='&count=true';
      $http.get(baseurl+urlsuffix+countsuffix).success(function(data){
        var length = data.data;
        if($scope.start<length-10){
          $scope.start=$scope.start+10;

          if($scope.tasktype=='All'){
                urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                  &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}';
            }
            else if($scope.tasktype=='Pending'){
              var moresuffix='&where={"completed": false}';
              urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                        &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
            }
            else if($scope.tasktype=='Completed'){
              var moresuffix='&where={"completed": true}';
              urlsuffix='/tasks?select={"_id":1,"deadline":1,"name":1,"assignedUserName":1}
                        &limit=10&skip='+$scope.start+'&sort={'+$scope.predicate+':'+$scope.ascending+'}'+moresuffix;
            }
            $http.get(baseurl+urlsuffix).success(function(data) {
            $scope.tasks=data.data;
          })
        }
      })

    }
    $scope.deletetask=function(taskid){
        $http.delete(baseurl+'/tasks/' + taskid)
            .success(function(data) {
                $scope.message = data.message;
                $http.get(baseurl+urlsuffix).success(function(data) {
                $scope.tasks=data.data;

            })
          })
          .error(function(data) {
               $scope.message = data.message;
          })
        };

    $http.get(baseurl+urlsuffix).success(function(data) {
      $scope.tasks=data.data;
    });
  }]);

app.filter('ifcomplete', [function() {
    return function(input,type) {
      if(type=='All')
        return input;
      if(input){
        output=[]
        if(type=='Pending'){
          for(var x=0;x<input.length;x++){
          if(input[x].completed==false){
            output.push(input[x]);
          }
        }
      }
      else{
          for(var x=0;x<input.length;x++){
            if(input[x].completed==true){
              output.push(input[x]);
            }
          }
        }


        
        return output;
      }
      return [];
        
    }
}]);
mp4Controllers.controller('TaskDetail', ['$scope', '$http','BaseUrlData','$location',
  function ($scope, $http, BaseUrlData,$location) {
    var taskurl = BaseUrlData.getData()+'tasks';
    var userurl = BaseUrlData.getData()+'users';
    var tID = $location.path().split(/[\s/]+/).pop();
    $scope.url=taskurl+'/'+tID;
    $scope.returninfo ="";
    $scope.formdata={
      name:'',
      description:'',
      assignedUserName:'',
      deadline:'',
      completed:''
    }
    $http.get(userurl).success(function(userdatas){
      var userdata = userdatas.data;
      var userlist=[];
      var name_id_dict={};

      userlist.push('unassigned');
      for(var x=0;x<userdata.length;x++){
        userlist.push(userdata[x].name);
        name_id_dict[userdata[x].name]=userdata[x]._id;
      }
      $scope.userlist=userlist;

      $http.get(taskurl+'/'+tID).success(function(retdata){

        $scope.formdata.name=retdata.data.name;
        $scope.formdata.description=retdata.data.description;
        $scope.formdata.assignedUserName=retdata.data.assignedUserName;
        $scope.formdata.deadline=retdata.data.deadline;
        var oldassigned=retdata.data.assignedUserName;
        var oldcompleteness='';
        if(retdata.data.completed==false){
            $scope.formdata.completed="false";
            oldcompleteness="false";
          }
        else{
          $scope.formdata.completed="true";
          oldcompleteness="true";
        }

        $scope.updatetaskfunc=function(){

        $http({
        method  : 'PUT',
        url     : taskurl+'/'+tID,
        data    : $.param($scope.formdata), //forms user object
        headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
       }).success(function(data){
        $scope.returninfo = data.message;
        var newassigned=$scope.formdata.assignedUserName;
        var newcompleted=$scope.formdata.completed;

        if(newassigned!=oldassigned || newcompleted!=oldcompleteness){

          if(newassigned==oldassigned){
            var url=userurl+'/'+name_id_dict[oldassigned];
            $http.get(url).success(function(getdata){

              var oldpendingobj=getdata.data.pendingTasks;
              var oldpendinglist=[];
              if(oldpendingobj.length!=0){
                // oldpendinglist=oldpendingobj;
                oldpendinglist=oldpendingobj[0].split(',');
              } 

              if(newcompleted=="false" && oldcompleteness=="true"){
                var judge=0;
                for(var x=0;x<oldpendinglist.length;x++){
                  if(oldpendinglist[x].replace(/[_\W]+/g, '')==tID){
                    judge=1;
                  }
                }
                  if(judge==0)
                    oldpendinglist.push(tID);

              }
              else{
                var tmp_pendinglist=[]

                for(var x=0;x<oldpendinglist.length;x++){
                  var thing=oldpendinglist[x].replace(/[_\W]+/g, '');
                  if(thing!=tID){
                    tmp_pendinglist.push(thing);
                  }
                }
                oldpendinglist=tmp_pendinglist;

              }
              var container=[]
              container.push(oldpendinglist);
              var newdata={
                name:getdata.data.name,
                email:getdata.data.email,
                pendingTasks:container
              }
              $http({
                    method  : 'PUT',
                    url     : url,
                    data    : $.param(newdata),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                   }).success(function(data){
                    $scope.returninfo = data.message;
                   }).error(function(data){
                    $scope.returninfo = data.message;
                   })
              })
          }
          else if(newassigned!=oldassigned){
            var oldurl=userurl+'/'+name_id_dict[oldassigned];
            var newurl=userurl+'/'+name_id_dict[newassigned];
            var oldpendinglist=[];
            var newpendinglist=[];
            $scope.cont=oldurl;

            if(oldassigned=='unassigned' && newassigned!='unassigned'){
              //add into pending tasks
              $http.get(newurl).success(function(getdata2){
                var newdata=getdata2.data;
                var newpendingobj=newdata.pendingTasks;
                if(newpendingobj.length!=0){
                    // newpendinglist=newpendingobj;
                    newpendinglist=newpendingobj[0].split(',');
                  }
                  if(newcompleted!="true"){
                    newpendinglist.push(tID);
                    var container2=[]
                    container2.push(newpendinglist);
                    var data2={
                    name:newdata.name,
                    email:newdata.email,
                    pendingTasks:container2
                    }
                    $http({
                    method  : 'PUT',
                    url     : newurl,
                    data    : $.param(data2),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                   }).success(function(data){
                    $scope.returninfo = data.message;
                    
                   }).error(function(data){
                    $scope.returninfo = data.message;
                   })

                  }

              })
              

            }
            else if (oldassigned!='unassigned' && newassigned=='unassigned'){
              //remove from pending tasks
              $http.get(oldurl).success(function(getdata1){
                var olddata=getdata1.data;
                var oldpendingobj=olddata.pendingTasks;

                if(oldpendingobj.length!=0){
                    oldpendinglist=oldpendingobj[0].split(',');
                  }
                if(oldcompleteness!="true"){
                  console.log(oldpendinglist)
                  console.log(oldpendinglist.length)
                   var tmp_pendinglist=[]
                    for(var x=0;x<oldpendinglist.length;x++){
                      var thing=oldpendinglist[x].split(/[\s/]+/).pop();
                      if(thing!=tID && !(tID in tmp_pendinglist)){
                        tmp_pendinglist.push(thing);
                      }
                    }
                  oldpendinglist=tmp_pendinglist;
                  var container1=[]
                  container1.push(oldpendinglist);
                  var data1={
                      name:olddata.name,
                      email:olddata.email,
                      pendingTasks:container1
                    }
                  $http({
                      method  : 'PUT',
                      url     : oldurl,
                      data    : $.param(data1),
                      headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                     }).success(function(data){
                      $scope.returninfo = data.message;

                     }).error(function(data){
                      $scope.returninfo = data.message;
                     })
                }
                
              })
              

            }
            else if(oldassigned!='unassigned' && newassigned!='unassigned'){

                //if need to update user
                 if(oldcompleteness!="true" || newcompleted!="true"){
              $http.get(oldurl).success(function(getdata1){
                var olddata=getdata1.data;
                $http.get(newurl).success(function(getdata2){
                  var newdata=getdata2.data;
                  var oldpendingobj=olddata.pendingTasks;
                  var newpendingobj=newdata.pendingTasks;
                  if(oldpendingobj.length!=0){
                    oldpendinglist=oldpendingobj[0].split(',');
                  }
                  if(newpendingobj.length!=0){
                    newpendinglist=newpendingobj[0].split(',');
                  }

                  if(oldcompleteness=="false" && newcompleted=="false"){
                    var tmp_pendinglist=[]
                    for(var x=0;x<oldpendinglist.length;x++){
                      var thing=oldpendinglist[x].replace(/[_\W]+/g, '');
                      if(thing!=tID && !(tID in tmp_pendinglist)){
                        tmp_pendinglist.push(thing);
                      }
                    }
                    oldpendinglist=tmp_pendinglist;
                    newpendinglist.push(tID);
                    // console.log(oldpendingobj,oldpendinglist)
                  }
                  else if(oldcompleteness=="true" && newcompleted=="false"){
                    newpendinglist.push(tID);
                  }
                  else if(oldcompleteness=="false" && newcompleted=="true"){
                    var tmp_pendinglist=[]
                    for(var x=0;x<oldpendinglist.length;x++){
                      var thing=oldpendinglist[x].replace(/[_\W]+/g, '');
                      if(thing!=tID && !(tID in tmp_pendinglist)){
                        tmp_pendinglist.push(thing);
                      }
                    }
                    oldpendinglist=tmp_pendinglist;
                    
                  }
                  var container1=[]
                  var container2=[]
                  container1.push(oldpendinglist);
                  container2.push(newpendinglist);
                  var data1={
                    name:olddata.name,
                    email:olddata.email,
                    pendingTasks:container1
                  }
                  var data2={
                    name:newdata.name,
                    email:newdata.email,
                    pendingTasks:container2
                  }
                  $http({
                    method  : 'PUT',
                    url     : oldurl,
                    data    : $.param(data1),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                   }).success(function(data){
                    $scope.returninfo = data.message;

                   }).error(function(data){
                    $scope.returninfo = data.message;
                   })

                   $http({
                    method  : 'PUT',
                    url     : newurl,
                    data    : $.param(data2),
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
                   }).success(function(data){
                    $scope.returninfo = data.message;
                    
                   }).error(function(data){
                    $scope.returninfo = data.message;
                   })

                })
              })
            }



            }//end else

           

          }
        }
       


       }).error(function(data){
        $scope.returninfo = data.message;
       }
       )}
      })

        
  })
  }]);
mp4Controllers.controller('AddTaskController', ['$http','$scope' , '$window','BaseUrlData' , function($http,$scope, $window,BaseUrlData) {
  $scope.returninfo="";
  var taskurl = BaseUrlData.getData()+'tasks';
  var userurl = BaseUrlData.getData()+'users';
  $scope.formdata={
      name:'',
      description:'',
      assignedUserName:'',
      deadline:'',
      completed:false
    }
  $http.get(userurl).success(function(userdatas){
      var userdata = userdatas.data;
      var userlist=[];
      var name_id_dict={};
      
      for(var x=0;x<userdata.length;x++){
        userlist.push(userdata[x].name);
        name_id_dict[userdata[x].name]=userdata[x]._id;
      }
      $scope.userlist=userlist;
      $scope.addtaskfunc=function(){
        if($scope.formdata.assignedUserName=='')
          $scope.formdata.assignedUserName='unassigned';
    $http({
      method  : 'POST',
      url     : taskurl,
      data    : $.param($scope.formdata), //forms user object
      headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
     }).success(function(data){
      $scope.returninfo = data.message;
      if($scope.formdata.assignedUserName!='unassigned'){

        var useridurl=userurl+'/'+name_id_dict[$scope.formdata.assignedUserName];
         
        $http.get(useridurl).success(function(getdata){
          var newdata=getdata.data;
          var oldpendingobj=newdata.pendingTasks;
          var oldpendinglist=[];
          if(oldpendingobj.length!=0){
            oldpendinglist=oldpendingobj;
          }
          oldpendinglist.push(data.data._id);
          var container=new Array(1);
          container[0]=oldpendinglist;

          var newdata={
            name:getdata.data.name,
            email:getdata.data.email,
            pendingTasks:container
          }
      
          $http({
            method  : 'PUT',
            url     : useridurl,
            data    : $.param(newdata),
            headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
           }).success(function(data){
            $scope.returninfo = data.message;
           }).error(function(data){
            $scope.returninfo = data.message;
           })
        })
      }
     }).error(function(data){
      $scope.returninfo = data.message;
     })
  }
    })
  


}]);

// app.filter('startFrom', ['taskliststart', function(taskliststart) {
//     return function(input) {
//       if(input){
//         var start = taskliststart.getstart();
//           // return input.slice(start,start+10);
//           return input;
//       }
//       return [];
        
//     }
// }]);

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
  // $scope.url = $window.sessionStorage.baseurl;
  // $scope.displayText = BaseUrlData.getData();
  $scope.url=BaseUrlData.getData();
  $scope.setUrl = function(){
    BaseUrlData.setData($scope.url);
    $scope.displayText='URL is set successfully'
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