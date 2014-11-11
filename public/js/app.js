// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','google-maps','ngCookies'])
.service('adresaservice', function($http,$stateParams,$q,$rootScope) {

     this.hartaincarca = function() {
        $rootScope.$broadcast('handleBroadcast');
    };
    this.adresa = function(k,map) {
     
      var p=-1,adresa=$q.defer();
                
        $http.get('/masini').success(function(data){
          if(k.length>13)
          angular.forEach(data,function(masina){
            p++;
            //console.log(masina.id==k);console.log(p);
            if(masina.id==k){
              k=p;
            }
          });
           
      
        
        $http.get('traseu.json').success(function(data){
          //pozitia actuala- aflu ultima pozitie
          
          var ultimacursa=data.trasee[k].curse.length;
          var ultimacoordonata=data.trasee[k].curse[ultimacursa-1].length;
          var intermediar = data.trasee[k].curse[ultimacursa-1][ultimacoordonata-1];
          var pozitiaactuala={};
          pozitiaactuala.latitude=intermediar[0];
          pozitiaactuala.longitude=intermediar[1];
          
          //Am o problema !!!!!!!!!
          //$scope.pozitia=pozitiaactuala;
          //console.log(pozitiaactuala);
          //$scope.pozitia="sdds";
                    
          var latlng = new google.maps.LatLng(pozitiaactuala.latitude,pozitiaactuala.longitude);
          geocoder = new google.maps.Geocoder();
          geocoder.geocode({'latLng': latlng}, function(results, status) {
              var map=map;
              if (status == google.maps.GeocoderStatus.OK) {
                
                 adresa.resolve({adr:results[1].formatted_address,poz:pozitiaactuala});
                                  
                } else {
                  console.log('No results found');
                }
              
            }); return adresa.promise
          });
          });
       
        return adresa.promise;
    }; 
})


.service('loginservice', function($http,$q) {
  this.conturi = function(){
    deferred=$q.defer();
    $http.get("/conturi").success(function(data, status) {
    //deferred.resolve("hahaha");
     deferred.resolve(data);
            }).error(function(data, status) {
                deferred.reject(data);
            });
    return deferred.promise;
  }
})
.service('urlchange', function($http,$q,$interval) {
   var promisiune;
   //seteaza promisiunea cand este activat intervalul
   this.stopp = function(promise){
    promisiune=promise;
   }
   //Daca este setat intervalul si se schimba adresa, opreste inervalul
   this.change = function(){
    //console.log(promisiune);
    $interval.cancel(promisiune);
   }
})

.run(function($state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.run( function($rootScope, $location,urlchange) {
   $rootScope.$watch(function() { 
      return $location.path(); 
    },
    function(a){  
      //cand se schimba url-ul opreste "urmareste"
      urlchange.change();
      
    });
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
     .state ('login', {
        url:"/login",
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.tracking', {
      url: "/tracking",
      views: {
        'menuContent' :{
          templateUrl: "templates/tracking.html"
        }
      }
    })

    .state('app.group', {
      url: "/group/:groupId",
      views: {
        'menuContent' :{
          templateUrl: "templates/grup.html"
        }
      }
    })

    .state('app.alerte', {
      url: "/alerte",
      views: {
        'menuContent' :{
          templateUrl: "templates/alerte.html"
        }
      }
    })
.state('app.harta',{
  url: "/harta",
  views: {
    'menuContent' :{
      templateUrl: "templates/harta.html"
    }
  }
})
.state('app.vehicul',{
  url: "/vehicul/:vehiculId",
  views: {
    'menuContent' :{
      templateUrl: "templates/vehicul.html"
    }
  }
})
.state('app.detaliivehicul',{
  url: "/detaliivehicul/:vehiculId",
  views: {
    'menuContent' :{
      templateUrl: "templates/detaliivehicul.html"
    }
  }
})
.state('app.adgrup',{
  url: "/adgrup",
  views: {
    'menuContent' :{
      templateUrl: "templates/adaugagrup.html"
    }
  }
})
.state('app.stgrup',{
  url: "/stgrup/:groupId",
  views: {
    'menuContent' :{
      templateUrl: "templates/stergegrup.html"
    }
  }
})
.state('app.edgrup',{
  url: "/edgrup/:groupId",
  views: {
    'menuContent' :{
      templateUrl: "templates/editeazagrup.html"
    }
  }
})
.state('app.editselect',{
  url: "/editselect",
  views: {
    'menuContent' :{
      templateUrl: "templates/editselect.html"
    }
  }
})
.state('app.stergselect',{
  url: "/stergselect",
  views: {
    'menuContent' :{
      templateUrl: "templates/stergselect.html"
    }
  }
})
.state('app.cont', {
      url: "/cont", //:groupId",
      views: {
        'menuContent' :{
          templateUrl: "templates/detaliicont.html"
        }
      }
    })
     

      
    

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})

