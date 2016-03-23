var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('BaseUrlData', function(){
    var url = "http://www.uiucwp.com:4000/api/";
    return{
        getData : function(){
            return url;
        },
        setData : function(newData){
            url = newData;
        }
    }
});

mp4Services.factory('taskliststart', function(){
    var start=0;
    return{
        getstart:function(){
            return start;
        },
        setnext:function(){
            start=start+10;
        },
        setprev:function(){
            start=start-10;
        }
    }
});

mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

mp4Services.factory('Llamas', function($http, $window) {
    return {
        get : function() {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl+'/api/llamas');
        }
    }
});
