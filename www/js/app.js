// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.cloud', 'starter.controllers', 'starter.services', 'ngCordova', 'ionic-toast', 'ionic.rating', 'ionic-datepicker', 'ionic-timepicker', 'uiGmapgoogle-maps', 'google.places', 'ng-mfb', 'firebase'])

.run(function($ionicPlatform,$ionicPush,$rootScope,$ionicModal ) {
  $ionicPlatform.ready(function($state, ionicToast) {
    Parse.initialize("VmOVLMKhTy6z1eriyHTfyvK2g62C9hG56gA2ufns", "4eF2JJhRezECUnTUI6TysCh6cpZuH0L6XgoSNDRo");
    Parse.serverURL = "https://parseapi.back4app.com";
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
     // $ionicPush.register().then(function(t) {
     //        console.log('Token Here',t);
            
     //       $ionicPush.saveToken(t).then(function(t) {

     //        alert('Token saved:'+ t.token);
     //        localStorage.setItem('ballTogetherDeviceToken',t.token);
        
     //      });
     //    });

      $ionicPush.register().then(function(t) {
        return $ionicPush.saveToken(t);
      }).then(function(t) {
          console.log("Token saved"+ t.token);
         localStorage.setItem('ballTogetherDeviceToken',t.token);
      });
      $ionicModal.fromTemplateUrl('templates/notification-pop-up.html', {
                scope: $rootScope,
                animation: 'fade-in',
                backdropClickToClose: false,
                hardwareBackButtonClose: false
            }).then(function(modal) {
                $rootScope.notificationModal = modal;
            });

        $rootScope.$on('cloud:push:notification', function(event, response) {
          console.log(response);
          var msg = response.message;
          // console.log(msg);
          $rootScope.notificationMessage = msg.text.toString();
          $rootScope.notifcationPayload = response.message.payload;
          $rootScope.notificationModal.show();
        });

    if(navigator.network && navigator.network.connection.type == "none"){
  		ionicToast.show("You don't appear to have an active connection. Please check your network status.", 'bottom',false, 10000);
  		$state.go("home");
  	}

  	var onOffline = function(){
  		ionicToast.show("You don't appear to have an active connection. Please check your network status.", 'bottom',false, 10000);
  		$state.go("home");
  	};

    var onOnline = function(){
      var bindNotifications = new Firebase("https://balltogether-8ea2e.firebaseio.com/notifications");
    };

  	document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", onOnline, false);
  });

})

.config(
    ['uiGmapGoogleMapApiProvider', function(GoogleMapApiProviders) {
        GoogleMapApiProviders.configure({
            china: true
        });
    }]
)

.constant('ApiEndpoint', {
  url: 'https://secure22.win.hostgator.com/api_baddtech_com/AppServices.asmx/'
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,$ionicCloudProvider) {
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.maxCache(0);
  // "app_id": "360aaa8b"
   $ionicCloudProvider.init({
    "core": {
      "app_id": "4d484b30"
    },
    "push": {
      "sender_id": "467037542287",
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "#ffffff"
        }
      }
    }
  });

  $stateProvider

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })

  .state('signin', {
    url: '/signin',
    templateUrl: 'templates/signin.html',
    controller: 'SigninCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })

  .state('terms1', {
    url: '/terms1',
    templateUrl: 'templates/terms1.html',
    controller: 'FTemrsCtrl'
  })

  .state('forgot_password', {
    url: '/forgot_password',
    templateUrl: 'templates/forgot_password.html',
    controller: 'ForgotPasswordCtrl'
  })

  .state('app', {
    url: '/app',
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.notifications', {
    url: '/notifications',
    views: {
      'menuContent': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl'
      }
    }
  })

  .state('app.chat', {
    url: '/chat',
    views: {
      'menuContent': {
        templateUrl: 'templates/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })

  .state('app.terms', {
    url: '/terms',
    views: {
      'menuContent': {
        templateUrl: 'templates/terms.html'
      }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html'
      }
    }
  })

  .state('app.events', {
    url: '/events',
    views: {
      'menuContent': {
        templateUrl: 'templates/events.html',
        controller: 'EventsCtrl',
        cache:false
      }
    }
  })

  .state('app.change_password', {
    url: '/change_password',
    views: {
      'menuContent': {
        templateUrl: 'templates/change_password.html',
        controller: 'ChangePasswordCtrl'
      }
    }
  })

  .state('app.event_detail', {
    url: '/event_detail/:selectedItem',
    views: {
      'menuContent': {
        templateUrl: 'templates/event_detail.html',
        controller: 'EventDetailCtrl'
      }
    }
  })

  .state('app.comments', {
    url: '/comments/:eventId',
    views: {
      'menuContent': {
        templateUrl: 'templates/comments.html',
        controller: 'CommentsCtrl'
      }
    }
  })

  .state('app.players', {
    url: '/players/:selectedEvent',
    views: {
      'menuContent': {
        templateUrl: 'templates/players.html',
        controller: 'PlayersCtrl'
      }
    }
  })

  .state('app.other_user', {
    url: '/other_user',
    views: {
      'menuContent': {
        templateUrl: 'templates/other_user.html',
        controller: 'OtherUserCtrl'
      }
    }
  })

  .state('app.other_user1', {
    url: '/other_user1',
    views: {
      'menuContent': {
        templateUrl: 'templates/other_user1.html',
        controller: 'OtherUser1Ctrl'
      }
    }
  })

  .state('app.add_from_contacts', {
    url: '/add_from_contacts',
    views: {
      'menuContent': {
        templateUrl: 'templates/add_from_contacts.html',
        controller: 'AddFromContactsCtrl'
      }
    }
  })

  .state('app.search_username', {
    url: '/search_username',
    views: {
      'menuContent': {
        templateUrl: 'templates/search_username.html',
        controller: 'SearchUserNameCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.highlights', {
    url: '/highlights',
    views: {
      'menuContent': {
        templateUrl: 'templates/highlights.html',
        controller: 'HighlightsCtrl'
      }
    }
  })

  .state('app.add_event', {
      url: '/add_event',
      views: {
        'menuContent': {
          templateUrl: 'templates/add_event.html',
          controller: 'AddEventCtrl'
        }
      }
  })

  .state('app.add_friend', {
        url: '/add_friend',
        views: {
          'menuContent': {
            templateUrl: 'templates/add_friend.html',
            controller: 'AddFriendCtrl'
          }
        }
   })

   .state('app.invite_friends', {
         url: '/invite_friends/:createrId/:eventId',
         views: {
           'menuContent': {
             templateUrl: 'templates/invite_friends.html',
             controller: 'InviteFriendsCtrl'
           }
         }
    })

;
  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
});
