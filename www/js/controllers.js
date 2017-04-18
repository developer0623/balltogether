angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $state, $ionicViewSwitcher) {
  Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
  Parse.serverURL = "https://parseapi.back4app.com";

  var currentUser = Parse.User.current();
  if(currentUser){
    $ionicViewSwitcher.nextDirection('back');
    $state.go("app.events");
  }
})

.controller('ModalCtrl', function($scope, $state, $rootScope) {
   $rootScope.notificationViewDetails = function() {
      var state = $state.current.name;

      console.log($state);
      console.log(state);
       var msg = $rootScope.notificationMessage;
       var data = JSON.parse($rootScope.notifcationPayload.data);
         if(msg.indexOf("message")> -1){
            console.log('Message Push',data);
            if(state.indexOf("app.chat")<0){
              $rootScope.selectedUser = data;
              $state.go("app.chat");
            }
            
         }else if(msg.indexOf("Request!")> -1){
          console.log('you have friend Request');
          if(state.indexOf("app.other_user")<0){
              $rootScope.selectedUser = data;
              $state.go("app.other_user");
            }
         }
         else if(msg.indexOf("invited")> -1){
          console.log('you have invite');
          if(state.indexOf("app.event_detail")<0){
              $state.go("app.event_detail", {selectedItem:angular.toJson(data)});
            }
         }else if(msg.indexOf("commented")> -1){
          var eveId= $rootScope.notifcationPayload.eventId;
          console.log('Comment Push');
           if(state.indexOf("app.comments")<0){
               $state.go("app.comments", {data:angular.toJson(data), eventId:eveId});
             }
         }
         else if(msg.indexOf("create")> -1){
          console.log('you fried created new Group');
          if(state.indexOf("app.event_detail")<0){
               $state.go("app.event_detail", {selectedItem:angular.toJson(data)});
             }
         }

         $rootScope.notificationModal.hide();
       }
})

.controller('SigninCtrl', function($scope, $rootScope, $ionicHistory, ionicToast, $ionicLoading, $state, $timeout, $ionicViewSwitcher) {
    Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
    Parse.serverURL = "https://parseapi.back4app.com";

    $scope.user = {_userName:"", _pass:""};

    $scope.looksLikeMail = function (str) {
  		var lastAtPos = str.lastIndexOf('@');
  		var lastDotPos = str.lastIndexOf('.');
  		return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
  	}

    $scope.goBack = function(){
      $ionicHistory.goBack();
    };

    $scope.signin = function(){
      if($scope.user._userName == undefined || $scope.user._userName == "")
      {
        ionicToast.show('Please enter valid email address.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._pass == undefined || $scope.user._pass == "")
      {
        ionicToast.show('Please enter password.', 'bottom',false, 3000);
        return;
      }

      $ionicLoading.show();
      Parse.User.logIn($scope.user._userName, $scope.user._pass, {
        success: function(user) {
          console.log(user);
          //if(user.get('emailVerified') == true){
            $ionicViewSwitcher.nextDirection('back');
            $state.go("app.events");
            $rootScope.$broadcast('refreshUserInfo');
            
          //}else{
          //  ionicToast.show("Please verify your email.", 'bottom',false, 3000);
          //}
          $ionicLoading.hide();
        },
        error: function(user, error) {
          // The login failed. Check error to see why.
          console.log(error);
          $ionicLoading.hide();
          ionicToast.show(error.message, 'bottom',false, 3000);
        }
      });
    };

    var fbLoginSuccess = function (userData) {
        console.log(userData);
        $ionicLoading.show({template:'Getting FB User Information...'});
        facebookConnectPlugin.api('/me?fields=first_name,last_name,email,gender,id,picture',["public_profile"],
            function(response) {
                  console.log(response);
                  $ionicLoading.show({template:'Getting Parse User Information...'});

                  var query = new Parse.Query(Parse.User);
                  query.equalTo("username", response.id);
                  query.equalTo("facebookLogin", true);
                  query.find({
                    success: function(aUser) {
                      console.log(aUser);
                      if(aUser.length > 0){
                        Parse.User.logIn(response.id, response.id, {
                          success: function(user) {
                              console.log(user);
                              $ionicViewSwitcher.nextDirection('back');
                              $state.go("app.events");
                              $rootScope.$broadcast('refreshUserInfo');
                              $ionicLoading.hide();
                          },
                          error: function(user, error) {
                            console.log(error);
                            $ionicLoading.hide();
                            ionicToast.show(error.message, 'bottom',false, 3000);
                          }
                        });
                      }else{
                        $ionicLoading.show({template:'Sign up processing...'});
                        var user = new Parse.User();
                        user.set("username", response.id);
                        user.set("password", response.id);
                        user.set("name", response.first_name +" "+response.last_name);
                        user.set("profileImage", response.picture.data.url);
                        user.set("skill", 5);
                        user.set("highlight", angular.toJson({firstTitle:"", firstUrl:"",secondTitle:"", secondUrl:"",thirdTitle:"", thirdUrl:""}));
                        user.set("facebookLogin", true);
                        user.signUp(null, {
                          success: function(user) {
                            console.log(user);
                            $ionicViewSwitcher.nextDirection('back');
                            $state.go("app.events");
                            $ionicLoading.hide();
                          },
                          error: function(user, error) {
                            console.log("Error: " + error.code + " " + error.message);
                            ionicToast.show(error.message, 'bottom',false, 3000);
                            $ionicLoading.hide();
                          }
                        });
                      }
                    },
                    error:function(user, error){
                      console.log(error);
                      $ionicLoading.hide();
                    }
                  });

        });
    }

    $scope.fbLogin = function(){
      $ionicLoading.show();
      facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
        function loginError (error) {
            console.error(error);
            $ionicLoading.hide();
        }
      );
    };

})

.controller('ForgotPasswordCtrl', function($scope, $ionicHistory, $state, $ionicViewSwitcher, ionicToast, $ionicLoading) {
  Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
  Parse.serverURL = "https://parseapi.back4app.com";
  $scope.user = {email:""};

  $scope.looksLikeMail = function (str) {
    var lastAtPos = str.lastIndexOf('@');
    var lastDotPos = str.lastIndexOf('.');
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
  }

  $scope.send = function(){
    console.log($scope.user.email);
    if($scope.user.email == undefined || $scope.user.email == "" || !$scope.looksLikeMail($scope.user.email))
    {
      ionicToast.show('Please enter valid email address.', 'bottom',false, 3000);
      return;
    }

    $ionicLoading.show();
    Parse.User.requestPasswordReset($scope.user.email, {
      success: function() {
        // Password reset request was sent successfully
        $ionicLoading.hide();
        ionicToast.show("Email has been sent. Please check your inbox.", 'bottom',false, 47000);
        $ionicHistory.goBack();
      },
      error: function(error) {
        // Show the error message somewhere
        //alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 47000);
      }
    });
  };

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };
})

.controller('SignupCtrl', function($scope, $rootScope, $ionicHistory, $state, $ionicViewSwitcher, ionicToast, $ionicLoading, $ionicActionSheet, $cordovaCamera, $timeout) {
    Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
    Parse.serverURL = "https://parseapi.back4app.com";

    $scope.ageList = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,57, 58, 59, 60];
    $scope.user = {terms:false, _username:"", _password:"", _profileImage:"", _email:"", _gender:"Gender", accept_terms:false, _city:"", _country:"US", _age:"Age", _position:"", _skilllevel:"5", _preferredPosition:""}
    $scope.goBack = function(){
      $ionicHistory.goBack();
    };

    var onSuccess = function (data) {

  		window.resolveLocalFileSystemURI(data, function(entry) {

  				var reader = new FileReader();

  				reader.onloadend = function(evt) {
                $ionicLoading.show();
  							var byteArray = new Uint8Array(evt.target.result);
  							var output = new Array( byteArray.length );
  							var i = 0;
  							var n = output.length;
  							while( i < n ) {
  							    output[i] = byteArray[i];
  							    i++;
  							}
  							var parseFile = new Parse.File("mypic.jpg", output);

  						  parseFile.save().then(function(ob) {
                    try{
                  		$scope.user._profileImage = JSON.stringify(ob).split(",")[2].split("\":")[1].replace("}", "").replace("\"", "").replace("\"", "");
  									}catch(e){}
  									$timeout(function(){$scope.$apply();});

                    $ionicLoading.hide();
  						  }, function(error) {
  						      console.log(error);
                    $ionicLoading.hide();
  			        });

    			}

  				reader.onerror = function(evt) {
  				      console.log('read error');
  				      console.log(JSON.stringify(evt));
  				}

  				entry.file(function(s) {
  				    	reader.readAsArrayBuffer(s);
  				}, function(e) {
  					    console.log('ee');
  				});
  			});
  	}

    $scope.showCameraSheet = function() {

       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: 'From Camera' },
           { text: 'From PhotoLibrary' }
         ],
         titleText: 'Select your photo',
         cancelText: 'Cancel',
         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
            if(index == 0)
     				{
     					var options = {
     					  quality:50,
     					  targetWidth:300,
     					  targetHeight:300,
                correctOrientation:true,
     					  destinationType: Camera.DestinationType.FILE_URI,
     					  sourceType: Camera.PictureSourceType.CAMERA,
     					};

     					$cordovaCamera.getPicture(options).then(onSuccess, function(err) {
     					  console.log(err);
     					});
     				}else{
     					var options = {
     					  quality:50,
     					  targetWidth:300,
     					  targetHeight:300,
                correctOrientation:true,
     					  destinationType: Camera.DestinationType.FILE_URI,
     					  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
     					};

     					$cordovaCamera.getPicture(options).then(onSuccess, function(err) {
     					  console.log(err);
     					});
     				}
            return true;
         }
       });
     };

    $scope.looksLikeMail = function (str) {
  		var lastAtPos = str.lastIndexOf('@');
  		var lastDotPos = str.lastIndexOf('.');
  		return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
  	}

    $scope.signup = function(){
      if($scope.user._profileImage == undefined || $scope.user._profileImage == "")
      {
        ionicToast.show('Please select your profile photo.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._username == undefined || $scope.user._username == "")
      {
        ionicToast.show('Please enter user name.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._password == undefined || $scope.user._password == "")
      {
        ionicToast.show('Please enter password.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._age == undefined || $scope.user._age == "" || $scope.user._age == "Age")
      {
        ionicToast.show('Please enter age.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._gender == undefined || $scope.user._gender == "" || $scope.user._gender == "Gender")
      {
        ionicToast.show('Please enter gender.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._email == undefined || $scope.user._email == "" || !$scope.looksLikeMail($scope.user._email))
      {
        ionicToast.show('Please enter valid email address.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._city == undefined || $scope.user._city == "")
      {
        ionicToast.show('Please enter city.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._country == undefined || $scope.user._country == "")
      {
        ionicToast.show('Please enter country.', 'bottom',false, 3000);
        return;
      }

      if($scope.user._preferredPosition == undefined || $scope.user._preferredPosition == "")
      {
        ionicToast.show('Please enter preferred position.', 'bottom',false, 3000);
        return;
      }

      if($scope.user.terms == false)
      {
        ionicToast.show('Please agree our terms and conditions.', 'bottom',false, 3000);
        return;
      }

      console.log($scope.user);
      $ionicLoading.show();
      var user = new Parse.User();
      user.set("username", $scope.user._email);
      user.set("password", $scope.user._password);
      user.set("email", $scope.user._email);
      user.set("name", $scope.user._username);
      user.set("age", parseInt($scope.user._age));
      user.set("gender", $scope.user._gender);
      user.set("city", $scope.user._city);
      user.set("country", $scope.user._country);
      user.set("profileImage", $scope.user._profileImage);
      user.set("preferred", $scope.user._preferredPosition);
      user.set("skill", 5);
      user.set("facebookLogin", false);
      user.set("highlight", angular.toJson({firstTitle:"", firstUrl:"",secondTitle:"", secondUrl:"",thirdTitle:"", thirdUrl:""}));
      user.signUp(null, {
        success: function(user) {
          console.log(user);
          
          //$ionicViewSwitcher.nextDirection('back');
          //$state.go("app.home");
          $ionicLoading.hide();
          //ionicToast.show("Please verify your email before Login.", 'bottom',false, 3000);
          //$ionicViewSwitcher.nextDirection('back');
          $state.go("app.events");
          $rootScope.$broadcast('refreshUserInfo');

        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          console.log("Error: " + error.code + " " + error.message);
          ionicToast.show(error.message, 'bottom',false, 3000);
          $ionicLoading.hide();
        }
      });
    }

    var fbLoginSuccess = function (userData) {
        console.log(userData);
        $ionicLoading.show({template:'Getting FB User Information...'});
        facebookConnectPlugin.api('/me?fields=first_name,last_name,email,gender,id,picture',["public_profile"],
            function(response) {
                  console.log(response);
                  $ionicLoading.show({template:'Getting Parse User Information...'});

                  var query = new Parse.Query(Parse.User);
                  query.equalTo("username", response.id);
                  query.equalTo("facebookLogin", true);
                  query.find({
                    success: function(aUser) {
                      console.log(aUser);
                      if(aUser.length > 0){
                        Parse.User.logIn(response.id, response.id, {
                          success: function(user) {
                              console.log(user);
                              $ionicViewSwitcher.nextDirection('back');
                              $state.go("app.events");
                              $rootScope.$broadcast('refreshUserInfo');
                              $ionicLoading.hide();
                          },
                          error: function(user, error) {
                            console.log(error);
                            $ionicLoading.hide();
                            ionicToast.show(error.message, 'bottom',false, 3000);
                          }
                        });
                      }else{
                        $ionicLoading.show({template:'Sign up processing...'});
                        var user = new Parse.User();
                        user.set("username", response.id);
                        user.set("password", response.id);
                        user.set("name", response.first_name +" "+response.last_name);
                        user.set("profileImage", response.picture.data.url);
                        user.set("skill", 5);
                        user.set("highlight", angular.toJson({firstTitle:"", firstUrl:"",secondTitle:"", secondUrl:"",thirdTitle:"", thirdUrl:""}));
                        user.set("facebookLogin", true);
                        user.signUp(null, {
                          success: function(user) {
                            console.log(user);
                            $ionicViewSwitcher.nextDirection('back');
                            $state.go("app.events");
                            $ionicLoading.hide();
                          },
                          error: function(user, error) {
                            console.log("Error: " + error.code + " " + error.message);
                            ionicToast.show(error.message, 'bottom',false, 3000);
                            $ionicLoading.hide();
                          }
                        });
                      }
                    },
                    error:function(user, error){
                      console.log(error);
                      $ionicLoading.hide();
                    }
                  });

        });
    }

    $scope.fbLogin = function(){
      $ionicLoading.show();
      facebookConnectPlugin.login(["public_profile"], fbLoginSuccess,
        function loginError (error) {
            console.error(error);
            $ionicLoading.hide();
        }
      );
    };

    $scope.goTerms = function(){
      $state.go("terms1");
    };
})

.controller('FTemrsCtrl', function($scope, $ionicHistory){
  $scope.goBack = function(){
    $ionicHistory.goBack();
  };
})

.controller('EventsCtrl', function($scope, $rootScope, $sce, $state, $ionicPopover, $ionicScrollDelegate, $ionicLoading, ParseFriendService, ParseEventService) {
  
  
  

  $scope.updateDeviceToken = function() {
            console.log('Update Device Token Called!')
            var deviceToken = localStorage.getItem('ballTogetherDeviceToken');
            if(deviceToken!='' && deviceToken!=null){
                var currentUser = Parse.User.current();
                var serverDeviceToken = currentUser.get('androidDeviceToken');
                if(serverDeviceToken=='' || serverDeviceToken==null || serverDeviceToken!= deviceToken){  
                   console.log('Saving Device Toekn');   
                   currentUser.set('androidDeviceToken',deviceToken);
                   currentUser.save();
                }
            }
  }

  $scope.updateDeviceToken();




  $scope.eventList = new Array();

  var distance = function(lat1, lon1, lat2, lon2, unit) {
  	var radlat1 = Math.PI * lat1/180;
  	var radlat2 = Math.PI * lat2/180;
  	var theta = lon1-lon2;
  	var radtheta = Math.PI * theta/180;
  	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  	dist = Math.acos(dist);
  	dist = dist * 180/Math.PI;
  	dist = dist * 60 * 1.1515;
  	if (unit=="K") { dist = dist * 1.609344 }
  	if (unit=="N") { dist = dist * 0.8684 }
    dist = parseInt(dist * 100) / 100;
  	return dist
  }

  var loadEventsData = function(){
    $scope.eventList = new Array();
    $ionicLoading.show();
    ParseEventService.all().then(function (ret) {
      $ionicLoading.hide();
      $scope.eventList = new Array();
      for(var index in ret){

          var event = {
            id:ret[index].id,
            startTime:ret[index].get('startTime'),
            date:moment(parseInt(ret[index].get('startTime'))).format("DD MMMM YYYY"),
            time:moment(parseInt(ret[index].get('startTime'))).format("HH:mm"),
            type:ret[index].get('type'),
            level:parseInt(ret[index].get('level')),
            location:ret[index].get('location'),
            description:ret[index].get('description'),
            position:ret[index].get('position'),
            attendList:ret[index].get('attendList'),
            attend:false,
            userId:ret[index].get('user').id,
            userCity:ret[index].get('user').get('city'),
            userCountry:ret[index].get('user').get('country'),
            userProfileImage:ret[index].get('user').get('profileImage'),
          }

          if(event.attendList){
            event.attendList = angular.fromJson(event.attendList);
            for(var index in event.attendList){
              if(event.attendList[index] == $scope.currentUser.id){
                event.attend = true;
              }
            }
          }else{
            event.attendList = [];
          }

          if(!event.position){
            event.position = new Parse.GeoPoint({latitude: 53.4450479, longitude: -113.5792213});
          }

          event.distance = distance($scope.currentUser.position._latitude, $scope.currentUser.position._longitude, event.position._latitude, event.position._longitude);

          if(parseInt(moment(new Date().getTime()).valueOf()) > (parseInt(event.startTime) + 86400000) ){
            ParseEventService.destory({id:event.id}).then(function (data) {
              console.log(data);
            },
            function (error) {
            });
          }else{
            $scope.eventList.push(event);
          }

      }
      $scope.$broadcast('scroll.refreshComplete');
    },
    function (error) {
      $scope.$broadcast('scroll.refreshComplete');
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };
  loadEventsData();

  $rootScope.$on('refreshEventList', function(event, args){
     loadEventsData();
  });

  $scope.doRefresh = function(){
    loadEventsData();
  };

  $scope.current = {tab:"events"};
  $scope.changeTab = function(tabName){

    $scope.current.tab = tabName;
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
    getFriendList();
    var videoWidth = window.innerWidth - 50;
    console.log(videoWidth)
    setTimeout(function(){
      if(document.getElementById('player1')){
        var player1 = new MediaElementPlayer('#player1');
        player1.setDimensions(videoWidth,200);
      }
      if(document.getElementById('player2')){
        var player2 = new MediaElementPlayer('#player2');
        player2.setDimensions(videoWidth,200);
      }
      if(document.getElementById('player3')){
        var player3 = new MediaElementPlayer('#player3');
        player3.setDimensions(videoWidth,200);  
      }
    },2000);
  }

  $scope.currentUser.friendList = [];
  var getFriendList = function(){
    $scope.currentUser.friendList = [];
    $ionicLoading.show();
    ParseFriendService.getMyFriends({friend:$scope.currentUser.id}).then(function (ret) {
      $ionicLoading.hide();
      console.log(ret);

      for(var index in ret){
          if(ret[index].get('friend1').id !== $scope.currentUser.id){
            var player = {};
            player.name = ret[index].get('friend1').get('name');
            player.profileImage = ret[index].get('friend1').get('profileImage');
            player.age = ret[index].get('friend1').get('age');
            player.gender = ret[index].get('friend1').get('gender');
            player.city = ret[index].get('friend1').get('city');
            player.country = ret[index].get('friend1').get('country');
            player.preferred = ret[index].get('friend1').get('preferred');
            player.skill = parseInt(ret[index].get('friend1').get('skill'));
            player.email = ret[index].get('friend1').get('email');
            player.id = ret[index].get('friend1').id;
            player.highlight = angular.fromJson(ret[index].get('friend1').get('highlight'));
            player.object = ret[index].get('friend1');
            player.blockUsers = ret[index].get('friend1').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend1').get('androidDeviceToken');

            $scope.currentUser.friendList.push(player);
          }else{
            var player = {};
            player.name = ret[index].get('friend2').get('name');
            player.profileImage = ret[index].get('friend2').get('profileImage');
            player.age = ret[index].get('friend2').get('age');
            player.gender = ret[index].get('friend2').get('gender');
            player.city = ret[index].get('friend2').get('city');
            player.country = ret[index].get('friend2').get('country');
            player.preferred = ret[index].get('friend2').get('preferred');
            player.skill = parseInt(ret[index].get('friend2').get('skill'));
            player.email = ret[index].get('friend2').get('email');
            player.id = ret[index].get('friend2').id;
            player.highlight = angular.fromJson(ret[index].get('friend2').get('highlight'));
            player.object = ret[index].get('friend2');
            player.blockUsers = ret[index].get('friend2').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend2').get('androidDeviceToken');
            $scope.currentUser.friendList.push(player);
          }
      }

      console.log($scope.currentUser.friendList);

      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop();
    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };

  $rootScope.selectedUser = {};
  $scope.goOtherUser = function(index){
    $rootScope.selectedUser = $scope.currentUser.friendList[index];
    $state.go("app.other_user");
  }

  $scope.onEventsSwipeRight = function(){
    $scope.current = {tab:"myevents"};
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.onMyEventsSwipeRight = function(){
    $scope.current = {tab:"favorites"};
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.onMyEventsSwipeLeft = function(){
    $scope.current = {tab:"events"};
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.onFavoriteSwipeRight = function(){
    $scope.current = {tab:"myevents"};
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();
  };

  $scope.attend =false;
  $scope.onAttending = function(item){
    console.log(item);
    //item.attend = !item.attend;
    if(item.attend == false){
      item.attendList.push($scope.currentUser.id);
      item.attend = true;
      $ionicLoading.show();
      ParseEventService.updateAttendList({id:item.id, attendList:angular.toJson(item.attendList)}).then(function (ret) {
        $ionicLoading.hide();
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }else{
      for(var index in item.attendList){
        if(item.attendList[index] == $scope.currentUser.id){
          item.attendList.splice(index, 1);
        }
      }

      item.attend = false;
      $ionicLoading.show();
      ParseEventService.updateAttendList({id:item.id, attendList:angular.toJson(item.attendList)}).then(function (ret) {
        $ionicLoading.hide();
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }
  };

  $scope.itemList = [0,1,2,3,4,5,6,7, 8,9, 10]
  $scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}

  $scope.myevents = {tab:"posts"};
  $scope.changeMyeventTab = function(tabName){

    $scope.myevents.tab = tabName;
    // if(tabName == "friends"){
    //    getFriendList();
    // }else{
    //   $ionicScrollDelegate.resize();
    //   $ionicScrollDelegate.scrollTop();
    // }
  }

  $scope.onInviteFriend = function(item){
    item.invite = !item.invite;
  }

  $scope.fav = {tab:"nearby"};
  $scope.changeFavTab = function(tabName){

    $scope.fav.tab = tabName;
    $ionicScrollDelegate.resize();
    $ionicScrollDelegate.scrollTop();

  }

  $scope.rating = {};
  $scope.rating.rate = 5;
  $scope.rating.max = 5;

  $scope.addEvent = function(){
    $state.go("app.add_event");
    $scope.closePopover();
  };

  $scope.addFriend = function(){
    $state.go("app.add_friend");
    $scope.closePopover();
  };

  $scope.goNotification = function(){
    $rootScope.newNotificationCount = 0;
    $state.go("app.notifications");
  };

  $scope.goDetail = function(item){
    $state.go("app.event_detail", {selectedItem:angular.toJson(item)});
  };

  $scope.newMessage = function(){
    $state.go("app.search_username");
  };

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });


  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $scope.onShareYoutube = function(link){
    console.log(link);
    window.plugins.socialsharing.share(null, null, null, link);
  };



})//end EventsCtrl

.controller('AppCtrl', function($scope, $rootScope, $ionicHistory, $state, $cordovaSocialSharing, $timeout, ionicToast, $ionicViewSwitcher, $cordovaGeolocation) {
    Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
    Parse.serverURL = "https://parseapi.back4app.com";

    $rootScope.newNotificationCount = 0;
    
    $scope.goBack = function(){
      $ionicHistory.goBack();
    };

    $scope.goProfile = function(){
      $state.go("app.profile");
    };

    $scope.logout = function(){
      Parse.User.logOut();
      $timeout(function(){
        $ionicViewSwitcher.nextDirection('back');
        $state.go("home");
      },500);
    };

    $scope.currentUser = {name:"", photo:"", pushNotification:true, position:new Parse.GeoPoint({latitude: 53.4450479, longitude: -113.5792213})};
    var getUserInfo = function(){
      var currentUser = Parse.User.current();
      console.log(currentUser);
      $scope.currentUser = {name:"", photo:"", pushNotification:true, position:new Parse.GeoPoint({latitude: 53.4450479, longitude: -113.5792213}), blockUsers:[]};
      if (currentUser) {
          $scope.currentUser.name = currentUser.get('name');
          $scope.currentUser.profileImage = currentUser.get('profileImage');
          $scope.currentUser.age = currentUser.get('age');
          $scope.currentUser.gender = currentUser.get('gender');
          $scope.currentUser.city = currentUser.get('city');
          $scope.currentUser.country = currentUser.get('country');
          $scope.currentUser.preferred = currentUser.get('preferred');
          $scope.currentUser.skill = parseInt(currentUser.get('skill'));
          $scope.currentUser.email = currentUser.get('email');
          $scope.currentUser.facebookLogin = currentUser.get('facebookLogin');
          $scope.currentUser.id = currentUser.id;
          $scope.currentUser.highlight = angular.fromJson(currentUser.get('highlight'));
          $scope.currentUser.blockUsers = angular.fromJson(currentUser.get('blockUsers'));
          $scope.currentUser.androidDeviceToken = currentUser.get('androidDeviceToken');

          console.log($scope.currentUser);

          try{
              var posOptions = {timeout: 10000, enableHighAccuracy: false};
              $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                  $scope.currentUser.position = new Parse.GeoPoint({latitude: position.coords.latitude, longitude: position.coords.longitude});
                  $rootScope.$broadcast('refreshEventList');
                }, function(err) {
                  $scope.currentUser.position = new Parse.GeoPoint({latitude: 53.4450479, longitude: -113.5792213});
              });
          }catch(e){
              $scope.currentUser.position = new Parse.GeoPoint({latitude: 53.4450479, longitude: -113.5792213});
          }

          // binding notifications

          bindNotifications.on('child_changed', function(chidsnapshot, prevchildkey){
              // console.log(chidsnapshot.val());
              var notification = chidsnapshot.val();
              if(notification.index == 1 && (notification.receiverId == $scope.currentUser.id || notification.receiverId=="all")){
                $rootScope.newNotificationCount++;
                try{$rootScope.$apply();}catch(e){}
              }
          });

      } else {
          // show the signup or login page
          $state.go("home");
      }
    };
    getUserInfo();

    $rootScope.$on('refreshUserInfo', function(event, args){
  	   getUserInfo();
  	});

    $scope.passFeedback = function(){
      $cordovaSocialSharing.shareViaEmail('', 'Help Me!', ['issues.balltogether@gmail.com'], [], [], [])
      .then(function(result) {
        // Success!
      }, function(err) {
        ionicToast.show("Please add an email account to your iphone device.", 'bottom',false, 3000);
      });
    };
})

.controller('AddEventCtrl', function($scope, $rootScope, $cordovaGeolocation, ionicTimePicker, ionicDatePicker, ParseNotificationService, ParseEventService, ParseFriendService, $ionicLoading, ionicToast, $ionicHistory) {
  $scope.newEvent = {time:"", date:"", datetime:"", type:"Public", location:"", description:"", exp:5, position:$scope.currentUser.position};
  $scope.current = { selectedPhoneType:"", selectedPhoneNumber:"", callname:"aa", datetime:"", date:(new Date()).getFullYear() + "-" + ((new Date()).getMonth()+1)+ "-" + (new Date()).getDate(), time:(new Date()).getHours() + " : " + (new Date()).getMinutes()}

  $scope.currentUser.friendList = [];
  var getFriendList = function(){
    $scope.currentUser.friendList = [];
    $ionicLoading.show();
    ParseFriendService.getMyFriends({friend:$scope.currentUser.id}).then(function (ret) {
      $ionicLoading.hide();
      console.log(ret);

      for(var index in ret){
          if(ret[index].get('friend1').id !== $scope.currentUser.id){
            var player = {};
            player.name = ret[index].get('friend1').get('name');
            player.profileImage = ret[index].get('friend1').get('profileImage');
            player.age = ret[index].get('friend1').get('age');
            player.gender = ret[index].get('friend1').get('gender');
            player.city = ret[index].get('friend1').get('city');
            player.country = ret[index].get('friend1').get('country');
            player.preferred = ret[index].get('friend1').get('preferred');
            player.skill = parseInt(ret[index].get('friend1').get('skill'));
            player.email = ret[index].get('friend1').get('email');
            player.id = ret[index].get('friend1').id;
            player.highlight = angular.fromJson(ret[index].get('friend1').get('highlight'));
            player.object = ret[index].get('friend1');
            player.blockUsers = ret[index].get('friend1').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend1').get('androidDeviceToken');

            $scope.currentUser.friendList.push(player);
          }else{
            var player = {};
            player.name = ret[index].get('friend2').get('name');
            player.profileImage = ret[index].get('friend2').get('profileImage');
            player.age = ret[index].get('friend2').get('age');
            player.gender = ret[index].get('friend2').get('gender');
            player.city = ret[index].get('friend2').get('city');
            player.country = ret[index].get('friend2').get('country');
            player.preferred = ret[index].get('friend2').get('preferred');
            player.skill = parseInt(ret[index].get('friend2').get('skill'));
            player.email = ret[index].get('friend2').get('email');
            player.id = ret[index].get('friend2').id;
            player.highlight = angular.fromJson(ret[index].get('friend2').get('highlight'));
            player.object = ret[index].get('friend2');
            player.blockUsers = ret[index].get('friend2').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend2').get('androidDeviceToken');

            $scope.currentUser.friendList.push(player);
          }
      }

      console.log($scope.currentUser.friendList);

    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };
  getFriendList();

  var timePickerObj = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

        if(selectedTime.getUTCHours()<10){
          if(selectedTime.getUTCMinutes() < 10){
            $scope.newEvent.time = "0"+selectedTime.getUTCHours() + ":" + "0"+selectedTime.getUTCMinutes();
          }else{
            $scope.newEvent.time = "0"+selectedTime.getUTCHours() + ":" + selectedTime.getUTCMinutes();
          }
        }else{
          if(selectedTime.getUTCMinutes() < 10){
            $scope.newEvent.time = selectedTime.getUTCHours() + ":" + "0"+selectedTime.getUTCMinutes();
          }else{
            $scope.newEvent.time = selectedTime.getUTCHours() + ":" + selectedTime.getUTCMinutes();
          }
        }
      }
    },
    inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
    format: 12,
    step: 1,
    setLabel: 'Set',
    closeLabel: 'Close'
  };

  $scope.openTimePopup = function(){
    ionicTimePicker.openTimePicker(timePickerObj);
  };

  var datePickerObj = {
    callback: function (val) {  //Mandatory
      console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      $scope.newEvent.date = moment(val).format("YYYY-MM-DD");
    },
    inputDate: new Date(),
    titleLabel: 'Select a Date',
    setLabel: 'Set',
    todayLabel: 'Today',
    closeLabel: 'Close',
    mondayFirst: false,
    weeksList: ["S", "M", "T", "W", "T", "F", "S"],
    monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
    templateType: 'popup',
    from: new Date(2012, 8, 1),
    to: new Date(2018, 8, 1),
    showTodayButton: true,
    dateFormat: 'dd MMMM yyyy',
    closeOnSelect: false,
    disableWeekdays: []
  };

  $scope.openDatePopup = function(){
    ionicDatePicker.openDatePicker(datePickerObj);
  };

  $scope.createEvent = function(){

    if($scope.newEvent.time == undefined || $scope.newEvent.time == "")
    {
      ionicToast.show('Please select event start time.', 'bottom',false, 3000);
      return;
    }

    if($scope.newEvent.date == undefined || $scope.newEvent.date == "")
    {
      ionicToast.show('Please select event start date.', 'bottom',false, 3000);
      return;
    }

    if($scope.newEvent.location == undefined || $scope.newEvent.location == "")
    {
      ionicToast.show('Please enter valid event location.', 'bottom',false, 3000);
      return;
    }

    if($scope.newEvent.description == undefined || $scope.newEvent.description == "")
    {
      ionicToast.show('Please enter event description.', 'bottom',false, 3000);
      return;
    }

    $scope.newEvent.datetime = moment($scope.newEvent.date + " " + $scope.newEvent.time).valueOf() + "";
    var currentUser = Parse.User.current();
    if(currentUser){
      $ionicLoading.show();
      $scope.newEvent.user = currentUser;
      $scope.newEvent.userId = currentUser.id;
      $scope.newEvent.address = $scope.newEvent.location.formatted_address;
      try{
        $scope.newEvent.position = new Parse.GeoPoint({latitude: $scope.newEvent.location.geometry.location.lat(), longitude: $scope.newEvent.location.geometry.location.lng()});
      }catch(e){
        $scope.newEvent.position = new Parse.GeoPoint({latitude: 10, longitude: 10});
      }
      console.log($scope.newEvent);

      ParseEventService.add($scope.newEvent).then(function (ret) {
        $ionicLoading.hide();
        console.log(ret);
        ionicToast.show('New event has been added successfully.', 'bottom',false, 3000);
        // $rootScope.currentEvent = ret;
        //$ionicHistory.goBack();
        //$rootScope.$broadcast('refreshEventList');

        sendNotifications(ret.id);
        sendPushNotifications(ret.id);
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }
  };

  var sendPushNotifications = function(eventId){
    var tokensArray = [];
        for(var index in $scope.currentUser.friendList){
          if($scope.currentUser.friendList[index].id != $scope.currentUser.id)
            if($scope.currentUser.friendList[index].androidDeviceToken!=null && $scope.currentUser.friendList[index].androidDeviceToken!=''){
              tokensArray.push($scope.currentUser.friendList[index].androidDeviceToken);
             }
        }
            
    // debugger
    console.log("Tokens:",tokensArray);
    var event = {};
    ParseEventService.getEventDetail({id:eventId}).then(function (ret) {
        event = {
          id:ret.id,
          startTime:ret.get('startTime'),
          date:moment(parseInt(ret.get('startTime'))).format("DD MMMM YYYY"),
          time:moment(parseInt(ret.get('startTime'))).format("HH:mm"),
          type:ret.get('type'),
          level:parseInt(ret.get('level')),
          location:ret.get('location'),
          description:ret.get('description'),
          position:ret.get('position'),
          attendList:ret.get('attendList'),
          attend:false,
          userId:ret.get('user').id,
          userCity:ret.get('user').get('city'),
          userCountry:ret.get('user').get('country'),
          userProfileImage:ret.get('user').get('profileImage'),
        }

        if(event.attendList){
          event.attendList = angular.fromJson(event.attendList);
          for(var index in event.attendList){
            if(event.attendList[index] == $scope.currentUser.id){
              event.attend = true;
            }
          }
        }else{
          event.attendList = [];
        }
      console.log(event);
      var params = {
              tokens:tokensArray,
              message: $scope.currentUser.name+" created new Event.",
              selectedItem: JSON.stringify(event)
            };

      Parse.Cloud.run('SendPushOnNewEvent', params).then(function(response) {
              // ratings should be 4.5
              console.log(response);
      });
       
      
    },
    function (error) {
     
    });
   // console.log(event);
   // debugger
   //  if (event.id){
   //      var tokensArray = [];
   //      for(var index in $scope.currentUser.friendList){
   //        if($scope.currentUser.friendList[index].id != $scope.currentUser.id)
   //          tokensArray.push($scope.currentUser.friendList[index].androidDeviceToken);
   //      }
   //      console.log("Tokens:",tokensArray)
   //      var params = {
   //            tokens:tokensArray,
   //            message: $scope.currentUser.name+" created new Event.",
   //            selectedItem: JSON.stringify(event)
   //          };

   //      Parse.Cloud.run('SendPushOnNewEvent', params).then(function(response) {
   //            // ratings should be 4.5
   //            console.log(response);
   //      });

   //  }
  

  };

  var defs = [];
  var sendNotification = function(id, eventId){
    // console.log(id);
    var def = $.Deferred();
    ParseNotificationService.createdEvent({receiverId:id, senderId:$scope.currentUser.id, senderName:$scope.currentUser.name, sender_profileImage:$scope.currentUser.profileImage, eventId:eventId}).then(function (ret) {
      // console.log(ret);
      def.resolve(0);
    },
    function (error) {
      def.resolve(1);
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
    return defs.push(def.promise());
  };

  var sendNotifications = function(eventId){
    var defs = [];
    $ionicLoading.show();

    for(var index in $scope.currentUser.friendList){
      if($scope.currentUser.friendList[index].id != $scope.currentUser.id)
        sendNotification($scope.currentUser.friendList[index].id, eventId);
    }

    $.when.apply($, defs).then(function(){
      console.log("all things done");
      $ionicLoading.hide();
      $ionicHistory.goBack();
      $rootScope.$broadcast('refreshEventList');
    });
  };

})

.controller('AddFriendCtrl', function($scope, $state, $cordovaSocialSharing, ionicToast) {
  $scope.goAddFromContacts = function(){
    $state.go("app.add_from_contacts");
  };

  $scope.shareUser = function(){
    $cordovaSocialSharing.share('Hey, download Ball Together ( http://goo.gl/2OgZAX ) and add me as a friend! My Username is \"' + $scope.currentUser.name + '\". Let\'s play 🏀', "Ball Together", null, null)
    .then(function(result) {
      console.log(result);
    }, function(err) {
      ionicToast.show("Please add an email account to your device.", 'bottom',false, 3000);
    });
    //window.plugins.socialsharing.share('Hey, download Ball Together (http://goo.gl/2OgZAX) and add me as a friend! My Username is "' + $scope.currentUser.name + '". Let\'s play basketball!', 'Ball Together');
  };

})

.controller('ProfileCtrl', function($scope, $timeout, $rootScope, $state, ionicToast, $ionicActionSheet, $cordovaCamera, $ionicLoading) {

  $scope.goHighlights = function(){
    $state.go("app.highlights");
  };

  var onSuccess = function (data) {
    window.resolveLocalFileSystemURI(data, function(entry) {
        var reader = new FileReader();

        reader.onloadend = function(evt) {
              $ionicLoading.show();
              var byteArray = new Uint8Array(evt.target.result);
              var output = new Array( byteArray.length );
              var i = 0;
              var n = output.length;
              while( i < n ) {
                  output[i] = byteArray[i];
                  i++;
              }
              var parseFile = new Parse.File("mypic.jpg", output);

              parseFile.save().then(function(ob) {
                  try{
                    $scope.currentUser.profileImage = JSON.stringify(ob).split(",")[2].split("\":")[1].replace("}", "").replace("\"", "").replace("\"", "");
                  }catch(e){}
                  $timeout(function(){$scope.$apply();});

                  $ionicLoading.hide();
              }, function(error) {
                  console.log(error);
                  $ionicLoading.hide();
              });

        }

        reader.onerror = function(evt) {
              console.log('read error');
              console.log(JSON.stringify(evt));
        }

        entry.file(function(s) {
              reader.readAsArrayBuffer(s);
        }, function(e) {
              console.log('ee');
        });
      });
  }

  $scope.showCameraSheet = function() {

     // Show the action sheet
     var hideSheet = $ionicActionSheet.show({
       buttons: [
         { text: 'From Camera' },
         { text: 'From PhotoLibrary' }
       ],
       titleText: 'Select your photo',
       cancelText: 'Cancel',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
          if(index == 0)
          {
            var options = {
              quality:50,
              targetWidth:300,
              targetHeight:300,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA,
            };

            $cordovaCamera.getPicture(options).then(onSuccess, function(err) {
              console.log(err);
            });
          }else{
            var options = {
              quality:50,
              targetWidth:300,
              targetHeight:300,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            };

            $cordovaCamera.getPicture(options).then(onSuccess, function(err) {
              console.log(err);
            });
          }
          return true;
       }
     });
   };

   $scope.looksLikeMail = function (str) {
     var lastAtPos = str.lastIndexOf('@');
     var lastDotPos = str.lastIndexOf('.');
     return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
   }

  $scope.onChange = function(){
    if($scope.currentUser.profileImage == undefined || $scope.currentUser.profileImage == "")
    {
      ionicToast.show('Please select your profile photo.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.age == undefined || $scope.currentUser.age == "")
    {
      ionicToast.show('Please enter age.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.gender == undefined || $scope.currentUser.gender == "")
    {
      ionicToast.show('Please enter gender.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.email == undefined || $scope.currentUser.email == "" || !$scope.looksLikeMail($scope.currentUser.email))
    {
      ionicToast.show('Please enter valid email address.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.city == undefined || $scope.currentUser.city == "")
    {
      ionicToast.show('Please enter city.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.country == undefined || $scope.currentUser.country == "")
    {
      ionicToast.show('Please enter country.', 'bottom',false, 3000);
      return;
    }

    if($scope.currentUser.preferred == undefined || $scope.currentUser.preferred == "")
    {
      ionicToast.show('Please enter preferred position.', 'bottom',false, 3000);
      return;
    }

    console.log($scope.currentUser);
    $ionicLoading.show();
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", $scope.currentUser.id);  // find all the women
    query.first({
      success: function(userAgain) {
        console.log(userAgain);
        $ionicLoading.hide();

        userAgain.set("name", $scope.currentUser.name);
        userAgain.set("age", $scope.currentUser.age);
        userAgain.set("gender", $scope.currentUser.gender);
        userAgain.set("profileImage", $scope.currentUser.profileImage);
        userAgain.set("email", $scope.currentUser.email);
        userAgain.set("city", $scope.currentUser.city);
        userAgain.set("country", $scope.currentUser.country);
        userAgain.set("skill", $scope.currentUser.skill);
        userAgain.set("preferred", $scope.currentUser.preferred);
        userAgain.save(null, {
          success:function(useragainAgain){
            $rootScope.$broadcast('refreshUserInfo');
            ionicToast.show("User information has been changed successfully.", 'bottom',false, 3000);
          },
          error: function(userAgain, error) {
            // This will error, since the Parse.User is not authenticated
            console.log(error);
          }
        });
      },
      error:function(error){
        console.log(error);
        $ionicLoading.hide();
      }
    });
  };

  $scope.goPassword = function(){
    $state.go("app.change_password");
  };
})

.controller('ChangePasswordCtrl', function($scope, $ionicLoading, ionicToast, $ionicHistory) {
  $scope.user = {current_psw:"", new_psw:""};

  var currentUser = Parse.User.current();

  $scope.goBack = function(){
    $ionicHistory.goBack();
  };

  $scope.onSavePassword = function(){
    if($scope.user.current_psw == undefined || $scope.user.current_psw == "")
    {
      ionicToast.show('Please enter current password.', 'bottom',false, 3000);
      return;
    }

    if($scope.user.new_psw == undefined || $scope.user.new_psw == "")
    {
      ionicToast.show('Please enter cell phone number.', 'bottom',false, 3000);
      return;
    }

    var currentUser = Parse.User.current();
    if(currentUser){
        $ionicLoading.show();
        Parse.User.logIn(currentUser.get('username'), $scope.user.current_psw, {
          success: function(userAgain) {
            // Do stuff after successful login.
            //console.log(userAgain);
            userAgain.set("password", $scope.user.new_psw);
              userAgain.save(null, {
                success:function(userAgagin1){
                  $ionicLoading.hide();
                  ionicToast.show("Password has been changed successfully.", 'bottom',false, 3000);
                  $ionicHistory.goBack();
                },
                error: function(userAgain1, error) {
                  // This will error, since the Parse.User is not authenticated
                  console.log(userAgain1);
                  $ionicLoading.hide();
                }
            });

          },
          error: function(user, error) {
            // The login failed. Check error to see why.
            console.log(error);
            $ionicLoading.hide();
            ionicToast.show("Please enter exact current password.", 'bottom',false, 3000);

          }
        });
    }
  };
})

.controller('CommentsCtrl', function($scope, $state, ionicToast, $rootScope, $stateParams, $ionicLoading, $ionicHistory, ParseCommentService, $timeout, $ionicScrollDelegate) {
  // $scope.commentList = angular.fromJson($stateParams.data);

  $scope.commentList = new Array();
  var getCommentsData = function(){
    
    //$ionicLoading.show();
    ParseCommentService.all({id:$stateParams.eventId}).then(function (ret) {
      //$ionicLoading.hide();

      for(var index in ret){
        // var comment = {userid:ret[index].get('user').id, photo:ret[index].get('user').get('profileImage'), androidDeviceToken:ret[index].get('user').get('androidDeviceToken'), comment:ret[index].get('comment'), date:moment(ret[index].get('createdAt')).fromNow()};
        //console.log(comment);
        var comment = {};
            comment.name = ret[index].get('user').get('name');
            comment.profileImage = ret[index].get('user').get('profileImage');
            comment.age = ret[index].get('user').get('age');
            comment.gender = ret[index].get('user').get('gender');
            comment.city = ret[index].get('user').get('city');
            comment.country = ret[index].get('user').get('country');
            comment.preferred = ret[index].get('user').get('preferred');
            comment.skill = parseInt(ret[index].get('user').get('skill'));
            comment.email = ret[index].get('user').get('email');
            comment.id = ret[index].get('user').id;
            comment.highlight = angular.fromJson(ret[index].get('user').get('highlight'));
            comment.object = ret[index].get('user');
            comment.blockUsers = ret[index].get('user').get('blockUsers');
            comment.androidDeviceToken = ret[index].get('user').get('androidDeviceToken');
            comment.comment = ret[index].get('comment');
            comment.date = moment(ret[index].get('createdAt')).fromNow()
        $scope.commentList.push(comment);
      }
    },
    function (error) {
      //$ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };
  getCommentsData();

  
  var eventId = $stateParams.eventId;
  $timeout(function(){$ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom();});
  var currentUser = Parse.User.current();
  $scope.gotootheruser = function(item){
    // alert(JSON.stringify(item));
    // if(item.id != currentUser.id)
    // {
      $rootScope.selectedUser = item;
      $state.go("app.other_user");
    // }
  }

  $scope.addComment = function(){
    //$ionicLoading.show();
    
    if (currentUser) {
      ParseCommentService.add({user:currentUser, comment:$scope.comment.text, eventId:eventId}).then(function (ret) {
        //$ionicLoading.hide();
        var comment = {userid:$scope.currentUser.id, photo:$scope.currentUser.profileImage, androidDeviceToken:currentUser.get('androidDeviceToken'), comment:$scope.comment.text, date:moment(ret.get('createdAt')).fromNow()};
        $scope.commentList.push(comment);
        $scope.comment = { text:""};

        var tokensArray = [];
        // console.log('Current User: ',currentUser.id);
        // console.log('Current androidDeviceToken: ',currentUser.androidDeviceToken);
        //  console.log('Current androidDeviceToken: ',currentUser.get('androidDeviceToken'));
        a = $scope.commentList;
        
        for (var i = 0; i < $scope.commentList.length; i++) {
          // console.log('List User: ',$scope.commentList[i].userid);
          // console.log('List User: ',$scope.commentList[i].androidDeviceToken);

          if($scope.commentList[i].userid!=currentUser.id){
              if($scope.commentList[i].androidDeviceToken!=null && $scope.commentList[i].androidDeviceToken!=''){
                tokensArray.push($scope.commentList[i].androidDeviceToken);
              }
          }
          
        }
        console.log('Tokens Array: ',tokensArray);

        //Call Function to send Push Notification on Comment
        var params = {
          tokens:tokensArray,
          message: $scope.currentUser.name+" commented on the Event you're attending.",
          comments:JSON.stringify($scope.commentList),
          eventId:$stateParams.eventId
        };

        Parse.Cloud.run('SendPushOnComment', params).then(function(response) {
          // ratings should be 4.5
          console.log(response);
        });
        //console.log(ret);
        $ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom();
        $rootScope.$broadcast('refreshEventDetail');
      },
      function (error) {
        //$ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }

  };
})

.controller('ChatCtrl', function($scope, $state, $ionicModal, ionicToast, $firebaseArray, $rootScope, $stateParams, $ionicLoading, $ionicHistory, ParseChatService, ParseFriendService, $timeout, $ionicScrollDelegate, $cordovaSocialSharing, $ionicPopup) {
    console.log($rootScope.selectedUser);
    $scope.otherUser = $rootScope.selectedUser;
    $scope.chatList = [];
    var chatMessagesForRoom;

    var getRoomId = function(){
      var currentUser = Parse.User.current();
      if (currentUser) {
        $ionicLoading.show();
        ParseChatService.getRoomId({friend1Id:currentUser.id, friend1:currentUser, friend2Id:$scope.otherUser.id, friend2:$scope.otherUser.object}).then(function (ret) {
          $ionicLoading.hide();
          console.log(ret);
          var ref = new Firebase("https://balltogether-8ea2e.firebaseio.com/");
          chatMessagesForRoom = $firebaseArray(ref.child('room-messages').child(ret.id).orderByChild("createdAt"));

          $scope.chatList = [];
          var roomInfo = new Firebase("https://balltogether-8ea2e.firebaseio.com/room-messages/"+ret.id);
          roomInfo.on('child_added', function(chidsnapshot, prevchildkey){
              var chatItem = chidsnapshot.val();
              chatItem.createdAt = moment(chatItem.createdAt).fromNow();
              console.log(chatItem);
              $scope.chatList.push(chatItem);
              $ionicScrollDelegate.$getByHandle("chatScroll").scrollBottom();
          });
        },
        function (error) {
          $ionicLoading.hide();
          ionicToast.show(error.message, 'bottom',false, 3000);
        });
      }
    }
    getRoomId();

    $scope.comment = {text:""}
    $scope.addComment = function(){
      if($scope.comment.text != undefined && $scope.comment.text != ""){
        var chatMessage = {
            sender_name: $scope.currentUser.name,
            sender_profileImage: $scope.currentUser.profileImage,
            sender_id:$scope.currentUser.id,
            content: $scope.comment.text,
            createdAt: Firebase.ServerValue.TIMESTAMP
        };
        chatMessagesForRoom.$add(chatMessage).then(function (data) {
            console.log(data);
            $scope.comment.text = "";
            bindNotifications.update({data:{senderId:$scope.currentUser.id, receiverId:$scope.otherUser.id, type:"CHAT", data:"You received a new message from "+$scope.currentUser.name, index:0}});
            bindNotifications.update({data:{senderId:$scope.currentUser.id, receiverId:$scope.otherUser.id, type:"CHAT", data:"You received a new message from "+$scope.currentUser.name, index:1}});
        });

        console.log('Current User: ',$scope.currentUser);
        console.log('Selected User: ',$scope.otherUser);

        var params = {
          receiverId:$scope.otherUser.androidDeviceToken,
          message:"You received a new message from "+$scope.currentUser.name,
          selectedUser: JSON.stringify($scope.currentUser)
        };

        Parse.Cloud.run('SendPushOnMessage', params).then(function(response) {
          // ratings should be 4.5
          console.log(response);
        });
      }
    };

    $scope.goUserProfile = function(){
      $state.go("app.other_user");
    };

    $scope.goInfor = function(){
      $scope.openModal();
    };

    $ionicModal.fromTemplateUrl('block-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.block = function(){
      var confirmPopup = $ionicPopup.confirm({
         title: 'Block User',
         template: 'Are you sure you want to block this user?'
       });

       confirmPopup.then(function(res) {
         if(res) {
           console.log('You are sure');
           if($scope.currentUser.blockUsers && $scope.currentUser.blockUsers!= undefined && $scope.currentUser.blockUsers.length>0)
           {
             $scope.currentUser.blockUsers.push($scope.otherUser.id);
           }else{
             $scope.currentUser.blockUsers = [];
             $scope.currentUser.blockUsers.push($scope.otherUser.id);
           }

           $ionicLoading.show();
           ParseFriendService.cancelFriendShipAll({idArray:[$scope.currentUser.id, $scope.otherUser.id]}).then(function (ret) {
             console.log(ret);

             var query = new Parse.Query(Parse.User);
             query.equalTo("objectId", $scope.currentUser.id);
             query.first({
               success: function(userAgain) {
                 userAgain.set("blockUsers", $scope.currentUser.blockUsers);
                 userAgain.save(null, {
                   success:function(useragainAgain){
                     $ionicLoading.hide();
                     $scope.closeModal();
                     $ionicHistory.goBack();
                   },
                   error: function(userAgain, error){
                     $ionicLoading.hide();
                     $scope.closeModal();
                   }
                 });
               },
               error:function(error){
                 $ionicLoading.hide();
                 $scope.closeModal();
               }
             });
           },
           function (error) {
             $ionicLoading.hide();
             $scope.closeModal();
           });

           $scope.closeModal();
           $ionicHistory.goBack();
           console.log($scope.currentUser.blockUsers);

         } else {
           console.log('You are not sure');
         }
       });
    };

    $scope.report = function(){
      $cordovaSocialSharing.shareViaEmail('', 'Report', ['issues.balltogether@gmail.com'], [], [], [])
      .then(function(result) {
        // Success!
      }, function(err) {
        ionicToast.show("Please add an email account to your iphone device.", 'bottom',false, 3000);
      });
    };
})

.controller('SearchUserNameCtrl', function($scope, $rootScope, $state, $ionicLoading, $ionicHistory, ionicToast, $timeout) {
  $scope.user = {name:""}
  $scope.userList = [];
  var firstsearchflag = false;
  $scope.search = function(){
    if($scope.user.name == ""){
      // return;
      $scope.userList = [];
      firstsearchflag = false;
    } 
    // else if($scope.user.name.length == 1 && !firstsearchflag) {
      else if(!firstsearchflag){
      
      firstsearchflag = true;
      $timeout(function(){
        firstsearchflag = false;
        $scope.mainSearchFunc();
      }, 300);
      

      
    }

    
    
  };


  $scope.mainSearchFunc = function(){

    $ionicLoading.show();
    var query = new Parse.Query(Parse.User);
    // query.equalTo("name", $scope.user.name);
    // query.startsWith("name", $scope.user.name);
      query.matches("name", $scope.user.name, 'i');
      query.find({
        success: function(results) {
          $scope.userList = [];
          if($scope.user.name == ""){
            $scope.userList = [];
          }else {
              for(var index in results){
                  var player = {};
                  player.name = results[index].get('name');
                  player.profileImage = results[index].get('profileImage');
                  player.age = results[index].get('age');
                  player.gender = results[index].get('gender');
                  player.city = results[index].get('city');
                  player.country = results[index].get('country');
                  player.preferred = results[index].get('preferred');
                  player.skill = parseInt(results[index].get('skill'));
                  player.email = results[index].get('email');
                  player.id = results[index].id;
                  player.highlight = angular.fromJson(results[index].get('highlight'));
                  player.object = results[index];
                  player.blockUsers = results[index].get('blockUsers');
                  player.androidDeviceToken = results[index].get('androidDeviceToken');

                  if(player.id != $scope.currentUser.id)
                    $scope.userList.push(player);
              }
          }
          console.log('Search UserList: ',$scope.userList);
          $ionicLoading.hide();
        },
        error: function(error) {
          console.log(error);
          $ionicLoading.hide();
        }
      });
  }

  $scope.goOtherUser = function(index){
    // if($scope.userList[index].id != $scope.currentUser.id)
    // {
    //   $rootScope.selectedUser = $scope.userList[index];
    //   $state.go("app.other_user");
    // }

    if(index.id != $scope.currentUser.id)
    {
      $rootScope.selectedUser = index;
      $state.go("app.other_user");
    }
  };
})

.controller('NotificationsCtrl', function($scope, $state, ionicToast, $rootScope, $stateParams, $ionicLoading, $ionicHistory, ParseChatService, ParseEventService, ParseNotificationService, $timeout, $ionicScrollDelegate) {
  // $scope.tab = {status:"chat", substatus:"all"};
  $scope.tab = {status:"notification", substatus:"all"};
  $scope.shouldShowDelete = true;
  $scope.onChatList = function(){
    if($scope.tab.status != "chat"){
      $scope.tab.status = "chat";
    }

    $rootScope.newNotificationCount = 0;
    $scope.chatMessageList = new Array();
    getMessageList();
  };

  $scope.goUserProfile = function(notification){
    console.log(notification);
    //$state.go("app.otherUserProfile");
    $ionicLoading.show();
    var query = new Parse.Query(Parse.User);
    query.equalTo("objectId", notification.senderId);
    query.first({
      success: function(ret) {
        console.log(ret);
        $ionicLoading.hide();

        var player = {};
        player.name = ret.get('name');
        player.profileImage = ret.get('profileImage');
        player.age = ret.get('age');
        player.gender = ret.get('gender');
        player.city = ret.get('city');
        player.country = ret.get('country');
        player.preferred = ret.get('preferred');
        player.skill = parseInt(ret.get('skill'));
        player.email = ret.get('email');
        player.id = ret.id;
        player.highlight = angular.fromJson(ret.get('highlight'));
        player.object = ret;
        player.blockUsers = ret.get('blockUsers');
        player.androidDeviceToken = ret.get('androidDeviceToken');

        $rootScope.selectedUser = player;
        $state.go("app.other_user");
      },
      error:function(error){
        console.log(error);
        $ionicLoading.hide();
      }
    });
  };

  $scope.goUserProfileFromChat = function(item){
    ret = item.user;
    var player = {};
    player.name = ret.get('name');
    player.profileImage = ret.get('profileImage');
    player.age = ret.get('age');
    player.gender = ret.get('gender');
    player.city = ret.get('city');
    player.country = ret.get('country');
    player.preferred = ret.get('preferred');
    player.skill = parseInt(ret.get('skill'));
    player.email = ret.get('email');
    player.id = ret.id;
    player.highlight = angular.fromJson(ret.get('highlight'));
    player.object = ret;
    player.blockUsers = ret.get('blockUsers');
    player.androidDeviceToken = ret.get('androidDeviceToken');
    $rootScope.selectedUser = player;
    $state.go("app.chat");
  };

  $scope.onNotificationList = function(){
    if($scope.tab.status != "notification"){
      $scope.tab.status = "notification";
    }

    $rootScope.newNotificationCount = 0;
    $scope.notificationList = new Array();
    getNotifications();
  };

  $scope.onChangeSubTab = function(tabName){
    $scope.tab.substatus = tabName;
  }

  $scope.notificationList = new Array();
  var getNotifications = function(){

    $ionicLoading.show();
    ParseNotificationService.all({id:$scope.currentUser.id}).then(function (ret) {
      $ionicLoading.hide();


      for(var index in ret){
          var notification = {
            receiverId:ret[index].get('receiverId'),
            senderProfileImage:ret[index].get('senderProfileImage'),
            senderName:ret[index].get('senderName'),
            senderId:ret[index].get('senderId'),
            type:ret[index].get('type'),
            data:ret[index].get('data'),
            eventId:ret[index].get('eventId'),
            date:moment(ret[index].get('createdAt')).fromNow()
          }

          $scope.notificationList.push(notification);
      }
      console.log($scope.notificationList);
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop();
    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };

  $scope.chatMessageList = new Array();
  var getMessageList = function(){
    $rootScope.newNotificationCount = 0;
    $scope.chatMessageList = new Array();
    $ionicLoading.show();
    ParseChatService.all({id:$scope.currentUser.id}).then(function (ret) {


      var ref = new Firebase("https://balltogether-8ea2e.firebaseio.com/room-messages");
      var query = ref.once("value", function(data){
        data.forEach(function(aConnection) {
          //console.log(aConnection.val());
          for(var index in ret){
            if(ret[index].id == aConnection.key()){
                jsonObj = aConnection.val();
                var firstProp;
                for(var key in jsonObj) {
                    if(jsonObj.hasOwnProperty(key)) {
                      if(jsonObj[key].sender_id != $scope.currentUser.id)
                        firstProp = jsonObj[key];
                    }
                }
                if(firstProp){
                  firstProp.createdAt1 = firstProp.createdAt;
                  firstProp.createdAt = moment(firstProp.createdAt).fromNow();

                  var otherBlockUserlist = []
                  if(ret[index].get('user1').id == $scope.currentUser.id){
                    firstProp.user = ret[index].get('user2');
                    otherBlockUserlist = firstProp.user.get('blockUsers');
                  }else {
                    firstProp.user = ret[index].get('user1');
                    otherBlockUserlist = firstProp.user.get('blockUsers');
                  }

                  firstProp.roomId = ret[index].id;

                  if($scope.currentUser.blockUsers && $scope.currentUser.blockUsers.length > 0){
                    var flag = false;
                    for(var j in $scope.currentUser.blockUsers){
                      if($scope.currentUser.blockUsers[j] == ret[index].get('user1').id || $scope.currentUser.blockUsers[j] == ret[index].get('user2').id)
                      {
                        flag = true;
                      }
                    }

                    if(otherBlockUserlist && otherBlockUserlist != undefined && otherBlockUserlist.length>0){
                      for(var j in otherBlockUserlist){
                        if(otherBlockUserlist[j] == $scope.currentUser.id || otherBlockUserlist[j] == $scope.currentUser.id)
                        {
                          flag = true;
                        }
                      }
                    }

                    if(flag == false)
                      $scope.chatMessageList.push(firstProp);
                  }else{
                    $scope.chatMessageList.push(firstProp);
                  }
                }
            }
          }
        });

        $ionicLoading.hide();
      });
    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };
  // getMessageList();
  getNotifications();

  $scope.delete = function(item){
    console.log(item);
    var refq = new Firebase("https://balltogether-8ea2e.firebaseio.com/room-messages/"+ item.roomId);
    refq.remove();
    getMessageList();
  };

  $scope.goEventDetail = function(item){
    $ionicLoading.show();
    ParseEventService.getEventDetail({id:item.eventId}).then(function (ret) {
        var event = {
          id:ret.id,
          startTime:ret.get('startTime'),
          date:moment(parseInt(ret.get('startTime'))).format("DD MMMM YYYY"),
          time:moment(parseInt(ret.get('startTime'))).format("HH:mm"),
          type:ret.get('type'),
          level:parseInt(ret.get('level')),
          location:ret.get('location'),
          description:ret.get('description'),
          position:ret.get('position'),
          attendList:ret.get('attendList'),
          attend:false,
          userId:ret.get('user').id,
          userCity:ret.get('user').get('city'),
          userCountry:ret.get('user').get('country'),
          userProfileImage:ret.get('user').get('profileImage'),
        }

        if(event.attendList){
          event.attendList = angular.fromJson(event.attendList);
          for(var index in event.attendList){
            if(event.attendList[index] == $scope.currentUser.id){
              event.attend = true;
            }
          }
        }else{
          event.attendList = [];
        }
        console.log(event);
        $state.go("app.event_detail", {selectedItem:angular.toJson(event)});
        $ionicLoading.hide();
    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  }

})

.controller('PlayersCtrl', function($scope, $rootScope, $state, $stateParams, ParseEventService, $ionicLoading, ionicToast, $timeout) {
  console.log(angular.fromJson($stateParams.selectedEvent));
  $scope.selectedEvent = angular.fromJson($stateParams.selectedEvent)
  var defs = [];

  var getPlayerData = function(id){
    var def = $.Deferred();
    ParseEventService.getPlayerList({id:id}).then(function (ret) {

      try{
            var player = {};
            player.name = ret.get('name');
            player.profileImage = ret.get('profileImage');
            player.age = ret.get('age');
            player.gender = ret.get('gender');
            player.city = ret.get('city');
            player.country = ret.get('country');
            player.preferred = ret.get('preferred');
            player.skill = parseInt(ret.get('skill'));
            player.email = ret.get('email');
            player.id = ret.id;
            player.highlight = angular.fromJson(ret.get('highlight'));
            player.object = ret;
            player.blockUsers = ret.get('blockUsers');
            player.androidDeviceToken = ret.get('androidDeviceToken');

            $scope.playerList.push(player);
      }catch(e){def.resolve(1);}
      def.resolve(0);
    },
    function (error) {
      def.resolve(1);
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
    return defs.push(def.promise());
  };

  var getPlayerList = function(){
    $ionicLoading.show();
    $scope.playerList = new Array();
    for(var index in $scope.selectedEvent.attendList){
      getPlayerData($scope.selectedEvent.attendList[index]);
    }
  };
  getPlayerList();

  $.when.apply($, defs).then(function(){
    console.log("all things done");
    $ionicLoading.hide();
  });

  $rootScope.selectedUser = {};
  $scope.goOtherUser = function(index){
    if($scope.playerList[index].id != $scope.currentUser.id)
    {
      $rootScope.selectedUser = $scope.playerList[index];
      $state.go("app.other_user");
    }
  }
})

.controller('OtherUserCtrl', function($scope, $ionicPopup, $state, $sce, $rootScope, $ionicHistory, $stateParams, ionicToast, $ionicLoading, $ionicHistory, $ionicScrollDelegate, ParseFriendService) {
    $scope.otherUser = $rootScope.selectedUser;
    console.log($scope.otherUser);
    $scope.otherUser.friendList = [];

    $scope.isBlock = false;
    if($scope.currentUser.blockUsers && $scope.currentUser.blockUsers.length > 0){
      var flag = false;
      for(var j in $scope.currentUser.blockUsers){
        if($scope.currentUser.blockUsers[j] == $scope.otherUser.id || $scope.currentUser.blockUsers[j] == $scope.otherUser.id)
        {
          flag = true;
        }
      }

      if($scope.otherUser.blockUsers && $scope.otherUser.blockUsers != undefined && $scope.otherUser.blockUsers.length>0){
        for(var j in $scope.otherUser.blockUsers){
          if($scope.otherUser.blockUsers[j] == $scope.currentUser.id || $scope.otherUser.blockUsers[j] == $scope.currentUser.id)
          {
            flag = true;
          }
        }
      }

      if(flag == true){
        $scope.isBlock = true;
      }
    }

    $scope.myevents = {tab:"highlight"};

    $scope.changeMyeventTab = function(tabName){

      $scope.myevents.tab = tabName;
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop();
    }

    $scope.weAreFriend = "Yet";
    $scope.whoIsSender = "Me";
    $scope.ourFriendId ="";
    // $scope.ourFrienddevicetoken ="";
    // $scope.ourFriendname ="";
    var getFriendList = function(){
      $scope.weAreFriend = "Yet";
      $scope.whoIsSender = "Me";
      $scope.ourFriendId ="";
      // $scope.ourFrienddevicetoken ="";
      // $scope.ourFriendname ="";
      $scope.otherUser.friendList = [];
      $ionicLoading.show();
      ParseFriendService.getMyFriendsAll({friend:$scope.otherUser.id}).then(function (ret) {
        $ionicLoading.hide();
        //console.log(angular.toJson(ret));

        for(var index in ret){
            if(ret[index].get('friend1').id !== $scope.otherUser.id){
              var player = {};
              player.name = ret[index].get('friend1').get('name');
              player.profileImage = ret[index].get('friend1').get('profileImage');
              player.age = ret[index].get('friend1').get('age');
              player.gender = ret[index].get('friend1').get('gender');
              player.city = ret[index].get('friend1').get('city');
              player.country = ret[index].get('friend1').get('country');
              player.preferred = ret[index].get('friend1').get('preferred');
              player.skill = parseInt(ret[index].get('friend1').get('skill'));
              player.email = ret[index].get('friend1').get('email');
              player.id = ret[index].get('friend1').id;
              player.highlight = angular.fromJson(ret[index].get('friend1').get('highlight'));
              player.object = ret[index].get('friend1');
              player.blockUsers = ret[index].get('friend1').get('blockUsers');
              player.androidDeviceToken = ret[index].get('friend1').get('androidDeviceToken');
              if(ret[index].get('status') == "Accept")
              {
                $scope.otherUser.friendList.push(player);
              }
            }else{
              var player = {};
              player.name = ret[index].get('friend2').get('name');
              player.profileImage = ret[index].get('friend2').get('profileImage');
              player.age = ret[index].get('friend2').get('age');
              player.gender = ret[index].get('friend2').get('gender');
              player.city = ret[index].get('friend2').get('city');
              player.country = ret[index].get('friend2').get('country');
              player.preferred = ret[index].get('friend2').get('preferred');
              player.skill = parseInt(ret[index].get('friend2').get('skill'));
              player.email = ret[index].get('friend2').get('email');
              player.id = ret[index].get('friend2').id;
              player.highlight = angular.fromJson(ret[index].get('friend2').get('highlight'));
              player.object = ret[index].get('friend2');
              player.blockUsers = ret[index].get('friend2').get('blockUsers');
              player.androidDeviceToken = ret[index].get('friend2').get('androidDeviceToken');
              if(ret[index].get('status') == "Accept")
              {
                $scope.otherUser.friendList.push(player);
              }

            }

            if((ret[index].get('friend1').id == $scope.currentUser.id) && (ret[index].get('friend2').id == $scope.otherUser.id)){
              if(ret[index].get('status') == "Pending")
              {
                $scope.weAreFriend = "Pending";
                $scope.whoIsSender = "Me";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }

              if(ret[index].get('status') == "Accept")
              {
                $scope.weAreFriend = "Accept";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }
            }

            if((ret[index].get('friend2').id == $scope.currentUser.id) && (ret[index].get('friend1').id == $scope.otherUser.id)){
              if(ret[index].get('status') == "Pending")
              {
                $scope.weAreFriend = "Pending";
                $scope.whoIsSender = "You";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }

              if(ret[index].get('status') == "Accept")
              {
                $scope.weAreFriend = "Accept";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }
            }


        }

        console.log($scope.weAreFriend);

        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollTop();
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    };

    getFriendList();

    $scope.goOtherUser = function(index){
      // alert($scope.currentUser.name);
      // if($scope.userList[index].id != $scope.currentUser.id)
    // {
    //   $rootScope.selectedUser = $scope.userList[index];
    //   $state.go("app.other_user");
    // }
      $rootScope.selectedUser = $scope.otherUser.friendList[index];
      $state.go("app.other_user1");
    };

    $scope.requestFriend = function(){
      if($scope.weAreFriend == "Yet"){
        var currentUser = Parse.User.current();
        if (currentUser) {
          $ionicLoading.show();
          ParseFriendService.requestFriend({friend1Id:currentUser.id, friend1:currentUser, friend2Id:$scope.otherUser.id, friend2:$scope.otherUser.object}).then(function (ret) {
            $ionicLoading.hide();
            console.log(ret);
            $scope.weAreFriend = "Pending";
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();

            console.log('Current User: ',$scope.currentUser);
            console.log('Selected User: ',$scope.otherUser);

            var params = {
              receiverId:$scope.otherUser.androidDeviceToken,
              message:"You have a new Friend Request!",
              selectedUser: JSON.stringify($scope.currentUser)
            };

            Parse.Cloud.run('SendPushOnFriendRequest', params).then(function(response) {
              // ratings should be 4.5
              console.log(response);
              // alert(JSON.stringify(response));
            });


          },
          function (error) {
            $ionicLoading.hide();
            ionicToast.show(error.message, 'bottom',false, 3000);
          });
        }
      }
      if($scope.weAreFriend == "Pending"){
         var confirmPopup = $ionicPopup.confirm({
           title: 'Friend Request',
           template: 'You already sent a friend request.<br>Do you want to send friend request again?',
           cancelText: 'No',
           okText: 'Yes'
         });

         confirmPopup.then(function(res) {
           if(res) {
             var currentUser = Parse.User.current();
             if (currentUser) {
               $ionicLoading.show();
               ParseFriendService.requestFriend({friend1Id:currentUser.id, friend1:currentUser, friend2Id:$scope.otherUser.id, friend2:$scope.otherUser.object}).then(function (ret) {
                 $ionicLoading.hide();
                 console.log(ret);
                 ionicToast.show("Friend reqest has been sent.", 'bottom',false, 3000);
                 $scope.weAreFriend = "Pending";
                 $ionicScrollDelegate.resize();
                 $ionicScrollDelegate.scrollTop();

                console.log('Current User: ',$scope.currentUser);
                console.log('Selected User: ',$scope.otherUser);

                var params = {
                  receiverId:$scope.otherUser.androidDeviceToken,
                  message:"You have a new Friend Request!",
                  selectedUser: JSON.stringify($scope.currentUser)
                };

                Parse.Cloud.run('SendPushOnFriendRequest', params).then(function(response) {
                  // ratings should be 4.5
                  console.log(response);
                });

               },
               function (error) {
                 $ionicLoading.hide();
                 ionicToast.show(error.message, 'bottom',false, 3000);
               });
             }
           } else {
             console.log('You are not sure');
           }
         });
      }
    };

    $scope.cancelFriend = function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Cancel Friendship',
        template: 'Do you want to cancel friendship?',
        cancelText: 'No',
        okText: 'Yes'
      });

      confirmPopup.then(function(res) {
        if(res) {
          console.log($scope.ourFriendId);
          var currentUser = Parse.User.current();
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.cancelFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);
              ionicToast.show("Friendship has been cancelled.", 'bottom',false, 3000);
              $scope.weAreFriend = "Yet";
              $ionicScrollDelegate.resize();
              $ionicScrollDelegate.scrollTop();
              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }
        } else {
          console.log('You are not sure');
        }
      });
    }

    $scope.acceptFriend = function(){

      if($scope.whoIsSender == "Me"){
        $scope.requestFriend();
        return;
      }

      var confirmPopup = $ionicPopup.confirm({
        title: 'Accept Friend',
        template: 'Do you want to accept friend request?',
        cancelText: 'No',
        okText: 'Yes'
      });

      confirmPopup.then(function(res) {
        if(res) {
          console.log($scope.ourFriendId);
           // alert($scope.otherUser.androidDeviceToken);
          var currentUser = Parse.User.current();
          // alert($scope.currentUser.name+" = " + $scope.currentUser.androidDeviceToken + "     "+$scope.otherUser.name + "   = "+ $scope.otherUser.androidDeviceToken);
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.acceptFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);


              var params = {
                  receiverId:$scope.otherUser.androidDeviceToken,
                  message:$scope.currentUser.name+" accepted your Request!",
                  selectedUser: JSON.stringify($scope.currentUser)
                };

                Parse.Cloud.run('SendPushOnAccept', params).then(function(response) {
                  // ratings should be 4.5
                  // alert(JSON.stringify(response));
                  console.log(response);
                });

              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }




        } else {
          console.log('You are not sure');
          var currentUser = Parse.User.current();
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.cancelFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);
              ionicToast.show("Friendship has been cancelled.", 'bottom',false, 3000);
              $scope.weAreFriend = "Yet";
              $ionicScrollDelegate.resize();
              $ionicScrollDelegate.scrollTop();
              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }
        }
      });
    };

    $scope.trustSrc = function(src) {
  		return $sce.trustAsResourceUrl(src);
  	}

    $scope.goBack = function(){
      $ionicHistory.goBack();
    };

    $scope.goChat = function(){
      $state.go("app.chat");
    };

    $scope.onShareYoutube = function(link){
      console.log(link);
      window.plugins.socialsharing.share(null, null, null, link);
    };
})


.controller('OtherUser1Ctrl', function($scope, $ionicPopup, $state, $sce, $rootScope, $ionicHistory, $stateParams, ionicToast, $ionicLoading, $ionicHistory, $ionicScrollDelegate, ParseFriendService) {
    $scope.otherUser = $rootScope.selectedUser;
    console.log($scope.otherUser);
    $scope.otherUser.friendList = [];

    $scope.isBlock = false;
    if($scope.currentUser.blockUsers && $scope.currentUser.blockUsers.length > 0){
      var flag = false;
      for(var j in $scope.currentUser.blockUsers){
        if($scope.currentUser.blockUsers[j] == $scope.otherUser.id || $scope.currentUser.blockUsers[j] == $scope.otherUser.id)
        {
          flag = true;
        }
      }

      if($scope.otherUser.blockUsers && $scope.otherUser.blockUsers != undefined && $scope.otherUser.blockUsers.length>0){
        for(var j in $scope.otherUser.blockUsers){
          if($scope.otherUser.blockUsers[j] == $scope.currentUser.id || $scope.otherUser.blockUsers[j] == $scope.currentUser.id)
          {
            flag = true;
          }
        }
      }

      if(flag == true){
        $scope.isBlock = true;
      }
    }

    $scope.myevents = {tab:"highlight"};

    $scope.changeMyeventTab = function(tabName){
      $scope.myevents.tab = tabName;
      $ionicScrollDelegate.resize();
      $ionicScrollDelegate.scrollTop();
    }

    $scope.weAreFriend = "Yet";
    $scope.whoIsSender = "Me";
    $scope.ourFriendId ="";
    

    var getFriendList = function(){
      $scope.weAreFriend = "Yet";
      $scope.whoIsSender = "Me";
      $scope.ourFriendId ="";
      // $scope.ourFrienddevicetoken ="";
      // $scope.ourFriendname ="";

      $scope.otherUser.friendList = [];
      $ionicLoading.show();
      ParseFriendService.getMyFriendsAll({friend:$scope.otherUser.id}).then(function (ret) {
        $ionicLoading.hide();
        //console.log(angular.toJson(ret));

        for(var index in ret){
            if(ret[index].get('friend1').id !== $scope.otherUser.id){
              var player = {};
              player.name = ret[index].get('friend1').get('name');
              player.profileImage = ret[index].get('friend1').get('profileImage');
              player.age = ret[index].get('friend1').get('age');
              player.gender = ret[index].get('friend1').get('gender');
              player.city = ret[index].get('friend1').get('city');
              player.country = ret[index].get('friend1').get('country');
              player.preferred = ret[index].get('friend1').get('preferred');
              player.skill = parseInt(ret[index].get('friend1').get('skill'));
              player.email = ret[index].get('friend1').get('email');
              player.id = ret[index].get('friend1').id;
              player.highlight = angular.fromJson(ret[index].get('friend1').get('highlight'));
              player.object = ret[index].get('friend1');
              player.blockUsers = ret[index].get('friend1').get('blockUsers');
              player.androidDeviceToken = ret[index].get('friend1').get('androidDeviceToken');
              if(ret[index].get('status') == "Accept")
              {
                $scope.otherUser.friendList.push(player);
              }
            }else{
              var player = {};
              player.name = ret[index].get('friend2').get('name');
              player.profileImage = ret[index].get('friend2').get('profileImage');
              player.age = ret[index].get('friend2').get('age');
              player.gender = ret[index].get('friend2').get('gender');
              player.city = ret[index].get('friend2').get('city');
              player.country = ret[index].get('friend2').get('country');
              player.preferred = ret[index].get('friend2').get('preferred');
              player.skill = parseInt(ret[index].get('friend2').get('skill'));
              player.email = ret[index].get('friend2').get('email');
              player.id = ret[index].get('friend2').id;
              player.highlight = angular.fromJson(ret[index].get('friend2').get('highlight'));
              player.object = ret[index].get('friend2');
              player.blockUsers = ret[index].get('friend2').get('blockUsers');
              player.androidDeviceToken = ret[index].get('friend2').get('androidDeviceToken');
              if(ret[index].get('status') == "Accept")
              {
                $scope.otherUser.friendList.push(player);
              }

            }

            if((ret[index].get('friend1').id == $scope.currentUser.id) && (ret[index].get('friend2').id == $scope.otherUser.id)){
              if(ret[index].get('status') == "Pending")
              {
                $scope.weAreFriend = "Pending";
                $scope.whoIsSender = "Me";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }

              if(ret[index].get('status') == "Accept")
              {
                $scope.weAreFriend = "Accept";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }
            }

            if((ret[index].get('friend2').id == $scope.currentUser.id) && (ret[index].get('friend1').id == $scope.otherUser.id)){
              if(ret[index].get('status') == "Pending")
              {
                $scope.weAreFriend = "Pending";
                $scope.whoIsSender = "You";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }

              if(ret[index].get('status') == "Accept")
              {
                $scope.weAreFriend = "Accept";
                $scope.ourFriendId =ret[index].id;
                // $scope.ourFrienddevicetoken = player.androidDeviceToken;
                // $scope.ourFriendname = player.name;
              }
            }


        }

        console.log($scope.weAreFriend);

        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollTop();
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    };
    getFriendList();

    $scope.goOtherUser = function(index){
      $rootScope.selectedUser = index;
      $state.go("app.other_user");
    };

    $scope.requestFriend = function(){
      if($scope.weAreFriend == "Yet"){
        var currentUser = Parse.User.current();
        if (currentUser) {
          $ionicLoading.show();
          ParseFriendService.requestFriend({friend1Id:currentUser.id, friend1:currentUser, friend2Id:$scope.otherUser.id, friend2:$scope.otherUser.object}).then(function (ret) {
            $ionicLoading.hide();
            console.log(ret);
            $scope.weAreFriend = "Pending";
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollTop();
          },
          function (error) {
            $ionicLoading.hide();
            ionicToast.show(error.message, 'bottom',false, 3000);
          });
        }
      }
      if($scope.weAreFriend == "Pending"){
         var confirmPopup = $ionicPopup.confirm({
           title: 'Friend Request',
           template: 'You already sent a friend request.<br>Do you want to send friend request again?',
           cancelText: 'No',
           okText: 'Yes'
         });

         confirmPopup.then(function(res) {
           if(res) {
             var currentUser = Parse.User.current();
             if (currentUser) {
               $ionicLoading.show();
               ParseFriendService.requestFriend({friend1Id:currentUser.id, friend1:currentUser, friend2Id:$scope.otherUser.id, friend2:$scope.otherUser.object}).then(function (ret) {
                 $ionicLoading.hide();
                 console.log(ret);
                 ionicToast.show("Friend reqest has been sent.", 'bottom',false, 3000);
                 $scope.weAreFriend = "Pending";
                 $ionicScrollDelegate.resize();
                 $ionicScrollDelegate.scrollTop();
               },
               function (error) {
                 $ionicLoading.hide();
                 ionicToast.show(error.message, 'bottom',false, 3000);
               });
             }
           } else {
             console.log('You are not sure');
           }
         });
      }
    };

    $scope.cancelFriend = function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Cancel Friendship',
        template: 'Do you want to cancel friendship?',
        cancelText: 'No',
        okText: 'Yes'
      });

      confirmPopup.then(function(res) {
        if(res) {
          console.log($scope.ourFriendId);
          var currentUser = Parse.User.current();
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.cancelFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);
              ionicToast.show("Friendship has been cancelled.", 'bottom',false, 3000);
              $scope.weAreFriend = "Yet";
              $ionicScrollDelegate.resize();
              $ionicScrollDelegate.scrollTop();
              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }
        } else {
          console.log('You are not sure');
        }
      });
    }

    $scope.acceptFriend = function(){

      if($scope.whoIsSender == "Me"){
        $scope.requestFriend();
        return;
      }

      var confirmPopup = $ionicPopup.confirm({
        title: 'Accept Friend',
        template: 'Do you want to accept friend request?',
        cancelText: 'No',
        okText: 'Yes'
      });

      confirmPopup.then(function(res) {
        if(res) {
          console.log($scope.ourFriendId);
          var currentUser = Parse.User.current();
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.acceptFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);
              var params = {
                  receiverId:$scope.otherUser.androidDeviceToken,
                  message:$scope.currentUser.name+" accepted your Request!",
                  selectedUser: JSON.stringify($scope.currentUser)
                };

                Parse.Cloud.run('SendPushOnAccept', params).then(function(response) {
                  // ratings should be 4.5
                  // alert(JSON.stringify(response));
                  console.log(response);
                });

              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }
        } else {
          console.log('You are not sure');
          var currentUser = Parse.User.current();
          if (currentUser) {
            $ionicLoading.show();
            ParseFriendService.cancelFriend({id:$scope.ourFriendId}).then(function (ret) {
              $ionicLoading.hide();
              console.log(ret);
              ionicToast.show("Friendship has been cancelled.", 'bottom',false, 3000);
              $scope.weAreFriend = "Yet";
              $ionicScrollDelegate.resize();
              $ionicScrollDelegate.scrollTop();
              $ionicHistory.goBack();
            },
            function (error) {
              $ionicLoading.hide();
              ionicToast.show(error.message, 'bottom',false, 3000);
            });
          }
        }
      });
    };

    $scope.trustSrc = function(src) {
  		return $sce.trustAsResourceUrl(src);
  	}

    $scope.goBack = function(){
      $ionicHistory.goBack();
    };

    $scope.goChat = function(){
      $state.go("app.chat");
    };

    $scope.onShareYoutube = function(link){
      console.log(link);
      window.plugins.socialsharing.share(null, null, null, link);
    };
})


.controller('HighlightsCtrl', function($scope, ionicToast, $ionicLoading, $ionicHistory) {
    $scope.highlights = {firstTitle:"", firstUrl:"",secondTitle:"", secondUrl:"",thirdTitle:"", thirdUrl:""};
    if($scope.currentUser.highlight != "" && $scope.currentUser.highlight != undefined)
      $scope.highlights = angular.fromJson($scope.currentUser.highlight);

    $scope.onSubmit = function(){
      if(($scope.highlights.firstUrl != "" && ($scope.highlights.firstUrl.indexOf("https://www.youtube.com/") <0)) || $scope.highlights.firstUrl == "https://www.youtube.com/embed/"){
        ionicToast.show('Please enter valid youtube link like this "https://www.youtube.com/embed/xxxxxxxx".', 'bottom',false, 5000);
        $scope.highlights.firstUrl = "https://www.youtube.com/embed/";
        return;
      }

      if(($scope.highlights.secondUrl != "" && ($scope.highlights.secondUrl.indexOf("https://www.youtube.com/") <0)) || $scope.highlights.secondUrl == "https://www.youtube.com/embed/"){
        ionicToast.show('Please enter valid youtube link like this "https://www.youtube.com/embed/xxxxxxxx".', 'bottom',false, 5000);
        $scope.highlights.secondUrl = "https://www.youtube.com/embed/";
        return;
      }

      if(($scope.highlights.thirdUrl != "" && ($scope.highlights.thirdUrl.indexOf("https://www.youtube.com/") <0)) || $scope.highlights.thirdUrl == "https://www.youtube.com/embed/"){
        ionicToast.show('Please enter valid youtube link like this "https://www.youtube.com/embed/xxxxxxxx".', 'bottom',false, 5000);
        $scope.highlights.thirdUrl = "https://www.youtube.com/embed/";
        return;
      }

      if($scope.highlights.firstUrl =="" && $scope.highlights.secondUrl =="" && $scope.highlights.thirdUrl ==""){
        return;
      }
      console.log($scope.highlights);
      $ionicLoading.show();
      var query = new Parse.Query(Parse.User);
      query.equalTo("objectId", $scope.currentUser.id);  // find all the women
      query.first({
        success: function(userAgain) {
          console.log(userAgain);
          $ionicLoading.hide();

          userAgain.set("highlight", angular.toJson($scope.highlights));
          userAgain.save(null, {
            success:function(useragainAgain){
              ionicToast.show("New Highlights has been submitted successfully.", 'bottom',false, 3000);
              $ionicHistory.goBack();
            },
            error: function(userAgain, error) {
              console.log(error);
            }
          });
        },
        error:function(error){
          console.log(error);
          $ionicLoading.hide();
        }
      });
    };
})

.controller('InviteFriendsCtrl', function($scope,$rootScope, $ionicLoading, ParseFriendService, ParseNotificationService, ionicToast, $stateParams) {

  $scope.search={text:""};
  $scope.friendList = new Array();
  var getFriendList = function(tabName){
    $scope.friendList = new Array();

    $ionicLoading.show();
    ParseFriendService.getMyFriends({friend:$scope.currentUser.id}).then(function (ret) {
      $ionicLoading.hide();
      console.log(ret);

      for(var index in ret){
          if(ret[index].get('friend1').id !== $scope.currentUser.id){
            var player = {};
            player.name = ret[index].get('friend1').get('name');
            player.profileImage = ret[index].get('friend1').get('profileImage');
            player.age = ret[index].get('friend1').get('age');
            player.gender = ret[index].get('friend1').get('gender');
            player.city = ret[index].get('friend1').get('city');
            player.country = ret[index].get('friend1').get('country');
            player.preferred = ret[index].get('friend1').get('preferred');
            player.skill = parseInt(ret[index].get('friend1').get('skill'));
            player.email = ret[index].get('friend1').get('email');
            player.blockUsers = ret[index].get('friend1').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend1').get('androidDeviceToken');

            player.id = ret[index].get('friend1').id;
            player.highlight = angular.fromJson(ret[index].get('friend1').get('highlight'));
            player.object = ret[index].get('friend1');
            player.invite = false;
            $scope.friendList.push(player);
          }else{
            var player = {};
            player.name = ret[index].get('friend2').get('name');
            player.profileImage = ret[index].get('friend2').get('profileImage');
            player.age = ret[index].get('friend2').get('age');
            player.gender = ret[index].get('friend2').get('gender');
            player.city = ret[index].get('friend2').get('city');
            player.country = ret[index].get('friend2').get('country');
            player.preferred = ret[index].get('friend2').get('preferred');
            player.skill = parseInt(ret[index].get('friend2').get('skill'));
            player.email = ret[index].get('friend2').get('email');
            player.blockUsers = ret[index].get('friend2').get('blockUsers');
            player.androidDeviceToken = ret[index].get('friend2').get('androidDeviceToken');

            player.id = ret[index].get('friend2').id;
            player.highlight = angular.fromJson(ret[index].get('friend2').get('highlight'));

            player.object = ret[index].get('friend2');
            player.invite = false;
            $scope.friendList.push(player);
          }
      }

      console.log($scope.friendList);

    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });

  }
  getFriendList();


  $scope.onInviteFriend = function(user){

    //window.plugins.socialsharing.share('Message and subject', 'The subject');
    // console.log(user);
    // return;
    $ionicLoading.show();
    ParseNotificationService.inviteFriendToEvent({receiverId:user.id, senderId:$scope.currentUser.id, senderName:$scope.currentUser.name, sender_profileImage:$scope.currentUser.profileImage, eventId:$stateParams.eventId}).then(function (ret) {
      $ionicLoading.hide();
      console.log(ret);
      user.invite = true;
      ionicToast.show("Invitation has been sent.", 'bottom',false, 3000);
      console.log('Current User: ',$scope.currentUser);
      console.log('Selected User: ',user);
      console.log('stateParams: ',$rootScope.currentEvent);
      var params = {
          receiverId:user.androidDeviceToken,
          message:$scope.currentUser.name+" invited you to an Event.",
          selectedItem: JSON.stringify($rootScope.currentEvent)
      };

      Parse.Cloud.run('SendPushOnInvite', params).then(function(response) {
          // ratings should be 4.5
          console.log(response);
      });

    },
    function (error) {
      $ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });

  };
})

.controller('AddFromContactsCtrl', function($scope, $ionicLoading, ionicToast, $cordovaSocialSharing) {

    $scope.search = {text:""};

    $scope.userList = new Array();
    var getUserList = function(){
      $ionicLoading.show();
      var options      = new ContactFindOptions();
      options.filter = "";
      options.multiple = true;
      options.hasPhoneNumber = true;
      var fields       = ["displayName"];
      navigator.contacts.find(fields, function(contacts){
        $scope.userList= new Array();
        for(var index in contacts){
          if(contacts[index] && contacts[index].name && contacts[index].name.formatted && contacts[index].phoneNumbers && contacts[index].phoneNumbers[0] && contacts[index].phoneNumbers[0].value){
            var member = { name: contacts[index].name.formatted, phone:contacts[index].phoneNumbers[0].value, selected:false};
            $scope.userList.push(member);
          }
        }

        console.log($scope.userList);
        $ionicLoading.hide();
      }, function(contactError){
        ionicToast.show(contactError, 'bottom',false, 3000);
        $ionicLoading.hide();
      }, options);

    };
    getUserList();

    $scope.invite = function(item){
      $cordovaSocialSharing.shareViaSMS('Hey, download Ball Together ( http://goo.gl/2OgZAX ) and add me as a friend! My Username is "' + $scope.currentUser.name + '". Let\'s play 🏀', item.phone).then(function(result) {
        console.log(result);
      }, function(err) {
        console.log(err);
      });
    };
})

.controller('EventDetailCtrl', function($scope, $cordovaGeolocation, $cordovaSocialSharing, $cordovaLaunchNavigator, $rootScope, $state, $stateParams, $ionicLoading, ParseEventService, ParseCommentService, ionicToast) {
  $scope.selectedEvent = angular.fromJson($stateParams.selectedItem);
  console.log($scope.selectedEvent);
  var getCommentsData = function(){
    $scope.commentList = new Array();
    //$ionicLoading.show();
    ParseCommentService.all({id:$scope.selectedEvent.id}).then(function (ret) {
      //$ionicLoading.hide();

      for(var index in ret){
         var comment = {userid:ret[index].get('user').id, photo:ret[index].get('user').get('profileImage'), androidDeviceToken:ret[index].get('user').get('androidDeviceToken'), comment:ret[index].get('comment'), date:moment(ret[index].get('createdAt')).fromNow()};
        //console.log(comment);
        // var comment = {};
        //     comment.name = ret[index].get('user').get('name');
        //     comment.profileImage = ret[index].get('user').get('profileImage');
        //     comment.age = ret[index].get('user').get('age');
        //     comment.gender = ret[index].get('user').get('gender');
        //     comment.city = ret[index].get('user').get('city');
        //     comment.country = ret[index].get('user').get('country');
        //     comment.preferred = ret[index].get('user').get('preferred');
        //     comment.skill = parseInt(ret[index].get('user').get('skill'));
        //     comment.email = ret[index].get('user').get('email');
        //     comment.id = ret[index].get('user').id;
        //     comment.highlight = angular.fromJson(ret[index].get('user').get('highlight'));
        //     comment.object = ret[index].get('user');
        //     comment.blockUsers = ret[index].get('user').get('blockUsers');
        //     comment.androidDeviceToken = ret[index].get('user').get('androidDeviceToken');
        //     comment.comment = ret[index].get('comment');
        //     comment.date = moment(ret[index].get('createdAt')).fromNow()
        $scope.commentList.push(comment);
      }
    },
    function (error) {
      //$ionicLoading.hide();
      ionicToast.show(error.message, 'bottom',false, 3000);
    });
  };
  getCommentsData();

  $rootScope.$on('refreshEventDetail', function(event, args){
     getCommentsData();
  });

  $scope.goComments = function(){
    // $state.go("app.comments", {data:angular.toJson($scope.commentList), eventId:$scope.selectedEvent.id});
    $state.go("app.comments", {eventId:$scope.selectedEvent.id});
  };

  console.log($scope.selectedEvent);
  $scope.map = {center: {latitude: $scope.selectedEvent.position.latitude, longitude: $scope.selectedEvent.position.longitude }, zoom: 17 }
  $scope.options = {
      draggable: true,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.SATELLITE
  };
  $scope.marker = {
    coords: {
      latitude: $scope.selectedEvent.position.latitude,
      longitude: $scope.selectedEvent.position.longitude
    },
    show: false,
    id: 0
  };

  $scope.onAttending = function(){
    console.log($scope.selectedEvent);
    //item.attend = !item.attend;
    if($scope.selectedEvent.attend == false){
      $scope.selectedEvent.attendList.push($scope.currentUser.id);
      $scope.selectedEvent.attend = true;
      $ionicLoading.show();
      ParseEventService.updateAttendList({id:$scope.selectedEvent.id, attendList:angular.toJson($scope.selectedEvent.attendList)}).then(function (ret) {
        $ionicLoading.hide();
        $rootScope.$broadcast('refreshEventList');
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }else{
      for(var index in $scope.selectedEvent.attendList){
        if($scope.selectedEvent.attendList[index] == $scope.currentUser.id){
          $scope.selectedEvent.attendList.splice(index, 1);
        }
      }

      $scope.selectedEvent.attend = false;
      $ionicLoading.show();
      ParseEventService.updateAttendList({id:$scope.selectedEvent.id, attendList:angular.toJson($scope.selectedEvent.attendList)}).then(function (ret) {
        $ionicLoading.hide();
        $rootScope.$broadcast('refreshEventList');
      },
      function (error) {
        $ionicLoading.hide();
        ionicToast.show(error.message, 'bottom',false, 3000);
      });
    }
  };

  $scope.goInviteFriends = function(){
    // console.log('Event: ',$scope.selectedEvent);
    $rootScope.currentEvent = $scope.selectedEvent;
    $state.go("app.invite_friends", {createrId:$scope.selectedEvent.userId, eventId:$scope.selectedEvent.id});
  }

  $scope.goPlayers = function(){
    $state.go("app.players", {selectedEvent:angular.toJson($scope.selectedEvent)});
  };

  $scope.navigateMap = function(){
    try{
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var destination = [$scope.selectedEvent.position.latitude, $scope.selectedEvent.position.longitude];
    	  var start = [position.coords.latitude, position.coords.longitude];
        $cordovaLaunchNavigator.navigate(destination, start).then(function() {
          console.log("Navigator launched");
        }, function (err) {
          console.error(err);
        });
      }, function(err) {
        // error
      });
    }catch(e){console.log(e);}
  };

  $scope.share = function(){
    $cordovaSocialSharing.share("Hey, download Ball Together ( http://goo.gl/2OgZAX ) and check out this Event, Let's play 🏀", "Ball Together", null, null)
    .then(function(result) {
      console.log(result);
    }, function(err) {
      ionicToast.show("Please add an email account to your device.", 'bottom',false, 3000);
    });
  };

})


;
