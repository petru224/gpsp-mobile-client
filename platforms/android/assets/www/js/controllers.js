
angular.module('starter.controllers', ["google-maps"])


.controller('AppCtrl', function($scope,$location,adresaservice) {
	$scope.map = {
	    center: {
	        latitude: 45,
	        longitude: -73
	    },
	    zoom: 8,
	    events: {
			tilesloaded: function (map) {
				$scope.$apply(function () {
					adresaservice.hartaincarca();
					$scope.mapInstance = map;
					$scope.centreazaPozAct=function(LatLng){
						$scope.map.center={latitude: LatLng.latitude,
											longitude:LatLng.longitude};
						$scope.map.zoom=13;					
					}
				});   
			}
		}
	};
	 
	//deschide link-urile cu functia go()
	$scope.go = function ( path ) {
	  $location.path( path );  
	};
})

.controller('LoginCtrl', function($scope, $state,$cookies,loginservice) {
	$scope.forms={};
	$scope.loginData={};
	//var account = {"email": "zgureanpetru@gmail.com","pass":123};
	
	$scope.logare = function(){
	var promise=loginservice.conturi();
	promise.then(function(conturi){$scope.submit(conturi);});	
	}
	
    
	$scope.submit = function (conturi) {
		$scope.forms.loginForm.isSubmited = true;
		t=false;
   		if(!$scope.forms.loginForm.$valid)
   			return;
   		for(i=0;i<conturi.length;i++)
			if(($scope.loginData.email==conturi[i].email)&&($scope.loginData.password==conturi[i].parola)) {
				$state.go('app.tracking');//trebuie o pagina principala home
				t=true;
				$cookies.utilizator=conturi[i].email;
			}
		if(!t){$scope.forms.loginForm.incorectpass = true;}
	};
})


.controller('listamasiniCtrl', function($scope,$http,$stateParams) {
	$http.get('masini').success(function(data){
		$scope.masini=[];
		angular.forEach(data,function(masina){
			if(masina.grupid==$stateParams.groupId){
				$scope.masini.push(masina);
			}
		});
		
	});
})

.controller('listagrupuriCtrl', function($scope,$http,$cookies) {
	$http.get('grupuri.json').success(function(data){
		$scope.grupuri=[];console.log(data.properties.nume);
		angular.forEach(data,function(grup){
			if(grup.utilizator==$cookies.utilizator){
				$scope.grupuri.push(grup);
			}
		});
		
	});

})

.controller('vehiculidCtrl', function($scope,$http,$stateParams) {
	$http.get('/masini').success(function(data){
		$scope.masini=[];
		angular.forEach(data,function(masina){
			if(masina.id==$stateParams.vehiculId){
				$scope.masina=masina;
			}
		});
		
	});

})

.controller('traseuCtrl', function($scope,$http,$stateParams,adresaservice,$interval,urlchange,$location) {

	$http.get('traseu.json').success(function(data){

		//daca am deschis o pagina a unui vehicul 
		if($stateParams.vehiculId!=null){
			//verifica id-ul masinii cu cel din trasee aut1==(k==0)
			var i=-1;
			var k=-1;
			angular.forEach(data.trasee,function(traseu){
				i++;
				if(traseu.id==$stateParams.vehiculId)k=i;
			}
			);
			$scope.markerele=[];
			$scope.k=k;
		    $scope.functadresa(k);						    
			//data si timpul cursei
			$scope.date=data.trasee[k].moment;
		};
		//functia de incarcare a traseului
		$scope.incarcatraseu = function() {
				

				if($scope.dataindex==null)$scope.dataindex=0;
				var json = data.trasee[k].curse[$scope.dataindex];
				$scope.coordonate = [];
				$scope.viteza =[];
				$scope.bounds = new google.maps.LatLngBounds();
				//var boundscoord=[];

				for (i = 0; i < json.length; ++i) {
			    		var thisObj = new Object();
			    		thisObj.latitude = json[i][0];
			    		thisObj.longitude = json[i][1];
			    		$scope.coordonate[i] = thisObj;
			    		$scope.viteza[i]=json[i][2];
			    		//boundscoord[i]=new google.maps.LatLng(thisObj.latitude, thisObj.longitude);
						$scope.bounds.extend(new google.maps.LatLng(thisObj.latitude, thisObj.longitude));
						//$scope.coordonate[i].titlu = $scope.viteza[i].toString();
							
							}
							

				for(i = 0; i < json.length; ++i){
						if($scope.viteza[i] <15)$scope.coordonate[i].culoare="#00FF00";
							else if($scope.viteza[i] <30)$scope.coordonate[i].culoare="#009900";
								else if($scope.viteza[i] <45)$scope.coordonate[i].culoare="#006600";
									else if($scope.viteza[i] <60)$scope.coordonate[i].culoare="#003300";
										else if($scope.viteza[i] <75)$scope.coordonate[i].culoare="#663300";
											else if($scope.viteza[i] <90)$scope.coordonate[i].culoare="#996600";
												else if($scope.viteza[i] <105)$scope.coordonate[i].culoare="#993300";
													else if($scope.viteza[i] <120)$scope.coordonate[i].culoare="#FFFF00";
														else if($scope.viteza[i] <135)$scope.coordonate[i].culoare="#FF3300";
															else if($scope.viteza[i] <150)$scope.coordonate[i].culoare="#FF0000";
																else $scope.coordonate[k].culoare="#FF0000";

							}

				
		  			
		  			$scope.centreaza();
		  			
		  			
		  				//console.log($scope.map);
  			};
  			
		}
		);
			
			//centreaza traseul pe harta
  			$scope.centreaza = function() {
  					if($scope.bounds!=null)$scope.mapInstance.fitBounds($scope.bounds);
  				};
  			$scope.urmareste = function(umrare){
  				$scope.nk=0;
				$scope.promise = $interval(function(){
						//for-ul sterge markerul precedent	
						for (var i = 0; i < $scope.markerele.length; i++) {
								    $scope.markerele[i].setMap(null);
								  }	
						$scope.nk++;
						$scope.pozActMark(umrare);
						adresaservice.adresa($scope.k,$scope.mapInstance).then(function(v){ $scope.adresa=v.adr;
																							$scope.pozitia=v.poz;})
				},3000)
				urlchange.stopp($scope.promise);
  			}
  			$scope.stopumrareste = function(){
  				$interval.cancel($scope.promise)}
  			//afla adresa
			$scope.functadresa = function(k) {
				//creeaza markerul la adresa acutala dupa ce se incarca harta:
				//cu adresaservice astept pana se calculeaza pozitia in $scope.pozitia
				//cu scope.$on('handleBroadcast', function(){}) astept pana se incarca harta si creez markerul in pozitia deja calculata
				adresaservice.adresa(k,$scope.mapInstance).then(function(v){ var calls=0;
																			$scope.adresa=v.adr;
																			$scope.pozitia=v.poz;
																			//if($location.path().substring(0,13)=="/app/vehicul/")
																				if($scope.adresa.length>22)$scope.adresa=$scope.adresa.substring(0,22)+"...";
																			var offCallMeFn = $scope.$on('handleBroadcast', function() {
																        		$scope.pozActMark(1);
																        		calls++;
																        		if(calls==2) offCallMeFn();//nustiu de ce dar trebuie se apeleaza de 2 ori, daca opresc evenimentul dupa daor unu - nu merge
																    		});
																			
																});
				
				$scope.pozActMark = function(umrare) {
								
								var myLatlng = new google.maps.LatLng($scope.pozitia.latitude,$scope.pozitia.longitude);
			  					var marker = new google.maps.Marker({
								    position: myLatlng,
								    map: $scope.mapInstance,
								    title:"Esti aici"
								});
								$scope.markerele.push(marker);
								//$scope.mapInstance.zoom=3;
								if(umrare==1){ //pentru urmareste

									$scope.map.center={latitude: $scope.pozitia.latitude,
													   longitude:$scope.pozitia.longitude};
									$scope.map.zoom=10;
								}
			  				};


				}

			
	})
.controller('removeMarkers', function($scope) {
	$scope.clearFirst = function() {
  			$scope.removeMakers($scope.dataindex);
  				//console.log($scope.map);
  			}
})
.controller('cookies', function($scope,$cookies) {
	$scope.check = function() {
  			
  				console.log($cookies.utilizator);
  			}
})
//conditia de adaugare sa nu existe mai mult de un id cu aceeasi data(alerta.vehid==cursa.id)&&(alerta.data==cursa.moment[i])==false
//sa adaug si numele cand pt mai multe tipuri de alerte
.controller('alertsCtrl', function($scope,$cookies,$http) {
  				var listamasini=[],i,j,alerte=[],t;
  				
  				$scope.listamasini=[];
  				$http.get('/masini').success(function(data){
					angular.forEach(data,function(masina){
						for(i=0;i<masina.utilizatori.length;++i)
						if(masina.utilizatori==$cookies.utilizator){
							listamasini.push(masina);
							}
					});
						$http.get('/alerte').success(function(data3){
							angular.forEach(data2.trasee,function(cursa){
									for(i=0;i<listamasini.length;++i)if(cursa.id==listamasini[i].id){	
										for(i=0;i<cursa.viteza.length;++i)
											for(j=0;j<cursa.viteza[i].length;++j)if(cursa.viteza[i][j]>120){
																						t=false;
																						if(data3.length==0) t=true;
																						tt=true;
																						//console.log(cursa.id+"||"+cursa.moment[i]);
																						angular.forEach(data3,function(alerta){
																							if((alerta.vehid==cursa.id)&&(alerta.data==cursa.moment[i]))tt=false;
																								
																						});	
																						if(tt)t=true;																																						
																						if(t)dpd.alerte.post({"nume":"Depasire viteza: "+cursa.viteza[i][j]+" km/h","data":cursa.moment[i],"vehid":cursa.id,"cursa":i.toString()}, function(result, err) {
																										  if(err) return console.log(err);
																										});
																						
																						
																					}
												//creez alerta pt fiecare test? sau dupa ce scane sub limita apoi iar creste in aceeasi cursa, 
												//sau doar o singura alerta de viteza pt cura(maxima)
												//urmeaza sa adaug ultima vizita si sa salvez alertele ,, dupa care sa le compar dupa data
									}	
								});
							});
						});
				})
				  			


.controller('selectgrupCtrl', function($scope,$http,$stateParams,$cookies) {
	$scope.adaug=function(){

					dpd.grupuri.post({"nume":$scope.model,"utilizator":$cookies.utilizator}, function(result, err) {
					  if(err) return console.log(err);
					});
					window.history.back();					
				}
	$http.get('/grupuri').success(function(data){
		angular.forEach(data,function(grup){
			if(grup.id==$stateParams.groupId){
				$scope.grup=grup;

				$scope.edit=function(){

					dpd.grupuri.put($stateParams.groupId, {"nume":$scope.model}, function(result, err) {
					  if(err) return console.log(err);
					  console.log($scope.model);
					});
					window.history.go(-2);					
				}	
				$scope.sterg=function(){

					dpd.grupuri.del($stateParams.groupId, function (err) {
					  if(err) console.log(err);
					});
					window.history.go(-2);					
				}			
			}
		});

	});
})
.controller('incarcalerteCtrl', function($scope,$cookies,$http) {
				$scope.listalerte=[];
				$scope.masinalerte=[];
  				var listamasini=[];
  				$http.get('/masini').success(function(data){
					angular.forEach(data,function(masina){
						for(i=0;i<masina.utilizatori.length;++i)
						if(masina.utilizatori==$cookies.utilizator){
							listamasini.push(masina);
							}
					});
					$http.get('/alerte').success(function(data2){
							angular.forEach(data2,function(alerta){
									for(i=0;i<listamasini.length;++i)if(alerta.vehid==listamasini[i].id){
										$scope.listalerte.push(alerta);
										$scope.masinalerte.push(listamasini[i]);
									}

							});		
					});

				});
})
.controller('contCtrl', function($scope,$http,$cookies) {
	$http.get('/conturi').success(function(data){
		angular.forEach(data,function(data2){
			if(data2.email==$cookies.utilizator)
				$scope.cont=data2;	
		});
	})
	$scope.salveazasetarile = function(){
	 var eroare=0,parola=$scope.inParola;
	 if($scope.inEmail==undefined)$scope.inEmail=$scope.cont.email;
	 if($scope.inTelefon==undefined)$scope.inTelefon=$scope.cont.telefon;
	 if($scope.inParola==undefined)parola=$scope.cont.parola;
	 	else if($scope.inParola!=$scope.inParola2)eroare=1;

	 	if(!eroare) {
	 		dpd.conturi.put($scope.cont.id, {"email":$scope.inEmail,"telefon":$scope.inTelefon,"parola":parola}, function(result, err) {
			  if(err) return console.log(err);
			  console.log("success"+parola);
			});
	 	}
	 if(eroare)$scope.errParola="Ai introdus parole diferite!";	
	}
})