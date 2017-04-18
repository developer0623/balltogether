var bindNotifications = new Firebase("https://balltogether-8ea2e.firebaseio.com/notifications");

angular.module('starter.services', [])

.factory('ParseFriendService', function($q) {
   var ParseFriendsObject = Parse.Object.extend("Friends");
   var ParseNotificationsObject = Parse.Object.extend("Notifications");
   return {
     getMyFriends: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseFriendsObject);
       query.include("friend1");
       query.include("friend2");
       query.ascending("createdAt");
       query.equalTo("status", "Accept");
       query.containedIn("friendIds", [_param.friend]);
       query.limit(1000);
       query.skip(1000 * offset);
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     getMyFriendsAll: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseFriendsObject);
       query.include("friend1");
       query.include("friend2");
       query.ascending("createdAt");
       query.containedIn("friendIds", [_param.friend]);
       query.limit(1000);
       query.skip(1000 * offset);
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     requestFriend: function(_param){
       console.log(_param);
       var deferred = $q.defer();
       var query = new ParseFriendsObject();
       query.set("friendIds", [_param.friend1Id, _param.friend2Id]);
       query.set("friend1", _param.friend1);
       query.set("friend2", _param.friend2);
       query.set("status", "Pending");
       query.save(null, {
         success: function(results) {
           //deferred.resolve(results);
           var query = new ParseNotificationsObject();
           query.set("receiverId", _param.friend2.id);
           query.set("senderId", _param.friend1.id);
           query.set("senderProfileImage", _param.friend1.get("profileImage"));
           query.set("senderName", _param.friend1.get("name"));
           query.set("type", "FRIENDSHIP");
           query.set("data", "You received new friendship request from "+_param.friend1.get('name'));
           query.save(null, {
             success: function(ret) {
               bindNotifications.update({data:{senderId:_param.friend1.id, receiverId:_param.friend2.id, type:"FRIENDSHIP", data:"You received new friendship request from "+_param.friend1.get('name'), index:0}});
               bindNotifications.update({data:{senderId:_param.friend1.id, receiverId:_param.friend2.id, type:"FRIENDSHIP", data:"You received new friendship request from "+_param.friend1.get('name'), index:1}});
               deferred.resolve(results);
             },
             error: function(d, error) {
               deferred.reject(error);
             }
           });
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     acceptFriend: function(_param){
       var deferred = $q.defer();
       var query =  new Parse.Query(ParseFriendsObject);
       query.equalTo("objectId", _param.id);
       query.first({
         success: function(results) {
           results.set("status", "Accept");
           results.save(null, {
             success: function(result) {
               deferred.resolve(result);
             },
             error: function(d, error) {
               deferred.reject(error);
             }
           });
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     cancelFriend: function(_param){
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseFriendsObject);
       query.equalTo("objectId", _param.id);
       query.first( {
         success: function(results) {
             console.log(results);
             results.destroy();
             deferred.resolve([]);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     cancelFriendShipAll: function(_param){
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseFriendsObject);
       query.containsAll("friendIds", _param.idArray);
       query.find( {
         success: function(results) {
            for(var i in results)
             results[i].destroy();
            deferred.resolve([]);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     }
   }
})

.factory('ParseChatService', function($q) {
   var ParseChatObject = Parse.Object.extend("Chat");
   var ParseNotificationsObject = Parse.Object.extend("Notifications");
   return {
     getRoomId: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseChatObject);
       query.containedIn("memberIds", [_param.friend1Id, _param.friend2Id]);
       query.find({
         success: function(results) {
           //console.log(results);
           if((results != undefined) && (results.length > 0)){
             var isThere = false;
             var atThatIndex = 0;
             for(var index in results){
               var id1 = results[index].get('memberIds')[0];
               var id2 = results[index].get('memberIds')[1];
               if((id1 == _param.friend1Id && id2 == _param.friend2Id) || (id2 == _param.friend1Id && id1 == _param.friend2Id))
                {
                  isThere = true;
                  atThatIndex = index;
                  console.log(results[index]);
                }
             }

             if(isThere == true)
                deferred.resolve(results[atThatIndex]);
             else{
                 var query1 = new ParseChatObject();
                 query1.set("memberIds", [_param.friend1Id, _param.friend2Id]);
                 query1.set("user1", _param.friend1);
                 query1.set("user2", _param.friend2);
                 query1.save(null, {
                   success: function(results) {
                     deferred.resolve(results);
                   },
                   error: function(d, error) {
                     deferred.reject(error);
                   }
                 });
              }
           }else{
               var query1 = new ParseChatObject();
               query1.set("memberIds", [_param.friend1Id, _param.friend2Id]);
               query1.set("user1", _param.friend1);
               query1.set("user2", _param.friend2);
               query1.save(null, {
                 success: function(results) {
                   deferred.resolve(results);
                 },
                 error: function(d, error) {
                   deferred.reject(error);
                 }
               });
            }
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     all: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseChatObject);
       query.include("user1");
       query.include("user2");
       query.containedIn("memberIds", [_param.id]);
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     }
   }
})

.factory('ParseNotificationService', function($q) {
  var ParseNotificationsObject = Parse.Object.extend("Notifications");

   return {
     all: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseNotificationsObject);
       query.containedIn("receiverId", [_param.id, "all"]);
       query.descending("createdAt");
       query.limit(1000);
       query.skip(1000 * offset);
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     inviteFriendToEvent: function(_param){
       var deferred = $q.defer();

       var query = new ParseNotificationsObject();
       query.set("receiverId", _param.receiverId);
       query.set("senderId", _param.senderId);
       query.set("senderProfileImage", _param.sender_profileImage);
       query.set("senderName", _param.senderName);
       query.set("eventId", _param.eventId);
       query.set("type", "EVENT");
       query.set("data", _param.senderName + " invited you to an Event.");
       query.save(null, {
         success: function(ret) {
           bindNotifications.update({data:{senderId:_param.senderName, receiverId:_param.receiverId, type:"EVENT", data:_param.senderName + " invited you to an Event.", index:0}});
           bindNotifications.update({data:{senderId:_param.senderName, receiverId:_param.receiverId, type:"EVENT", data:_param.senderName + " invited you to an Event.", index:1}});
           deferred.resolve(ret);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     createdEvent: function(_param){
       var deferred = $q.defer();

       var query = new ParseNotificationsObject();
       query.set("receiverId", _param.receiverId);
       query.set("senderId", _param.senderId);
       query.set("senderProfileImage", _param.sender_profileImage);
       query.set("senderName", _param.senderName);
       query.set("eventId", _param.eventId);
       query.set("type", "EVENT");
       query.set("data", _param.senderName + " created new Event.");
       query.save(null, {
         success: function(ret) {
           bindNotifications.update({data:{senderId:_param.senderName, receiverId:_param.receiverId, type:"EVENT", data:_param.senderName + " created new Event.", index:0}});
           bindNotifications.update({data:{senderId:_param.senderName, receiverId:_param.receiverId, type:"EVENT", data:_param.senderName + " created new Event.", index:1}});
           deferred.resolve(ret);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     }
   }
})

.factory('ParseCommentService', function($q) {
  var ParseCommentsObject = Parse.Object.extend("Comments");

   return {
     all: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseCommentsObject);
       query.include("user");
       query.equalTo("eventId", _param.id);
       query.limit(1000);
       query.skip(1000 * offset);
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     add: function(_param){
       console.log(_param);
       var deferred = $q.defer();

       var query = new ParseCommentsObject();
       query.set("user", _param.user);
       query.set("comment", _param.comment);
       query.set("eventId", _param.eventId);
       query.save(null, {
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     }
   }
})

.factory('ParseEventService', function($q) {
  var ParseEventObject = Parse.Object.extend("Events");
  var ParseNotificationsObject = Parse.Object.extend("Notifications");
   return {
     all: function(_param, offset){
       if(!offset) offset = 0;
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseEventObject);
       query.include("user");
       query.limit(1000);
       query.skip(1000 * offset);
       query.descending("createdAt");
       query.find({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     getEventDetail: function(_param){
       var deferred = $q.defer();
       var query = new Parse.Query(ParseEventObject);
       query.include("user");
       query.equalTo("objectId", _param.id);
       query.first({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     add: function(_param){
       console.log(_param);
       var deferred = $q.defer();

       var query = new ParseEventObject();
       query.set("user", _param.user);
       query.set("startTime", _param.datetime);
       query.set("type", _param.type);
       query.set("location", _param.address);
       query.set("level", _param.exp);
       query.set("description", _param.description);
       query.set("position", _param.position);
       query.set("attendList", angular.toJson([_param.userId]));

       query.save(null, {
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     destory: function(_param){
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseEventObject);
       query.equalTo("objectId", _param.id);
       query.first( {
         success: function(results) {
           console.log(results);
             results.destroy();
             deferred.resolve([]);
         },
         error: function(d, error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     update: function(_param){
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseEventObject);
       query.equalTo("objectId", _param.groupid);
       query.first({
         success: function(results) {
           results.set("userObjectId", _param.userObjectId);
           results.set("name", _param.name);
           results.set("members", _param.members);
           results.save(null, {
             success: function(result) {
               deferred.resolve(result);
             },
             error: function(d, error) {
               deferred.reject(error);
             }
           });
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     updateAttendList: function(_param){
       var deferred = $q.defer();
       //Query Parse
       var query = new Parse.Query(ParseEventObject);
       query.equalTo("objectId", _param.id);
       query.first({
         success: function(results) {
           results.set("attendList", _param.attendList);
           results.save(null, {
             success: function(result) {
               deferred.resolve(result);
             },
             error: function(d, error) {
               deferred.reject(error);
             }
           });
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     },
     getPlayerList: function(_param){
       var deferred = $q.defer();
       var query = new Parse.Query(Parse.User);
       query.equalTo("objectId", _param.id);
       query.first({
         success: function(results) {
           deferred.resolve(results);
         },
         error: function(error) {
           deferred.reject(error);
         }
       });
       return deferred.promise;
     }
   }
})

.factory('AJAXService', function(ApiEndpoint) {
  var promise;

  var objService = {
    ajax_get:function(url){
		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();
			req.open('GET', url);
			req.onload = function() {
			  // This is called even on 404 etc
			  // so check the status
			  if (req.status == 200) {
				// Resolve the promise with the response text
				resolve(req.response);
			  }
			  else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				reject(req.statusText);
			  }
			};

			// Handle network errors
			req.onerror = function(e) {
			  reject(e);
			};

			// Make the request
			req.send();
		});
	},
	ajax_post:function(url, param){

		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();

			req.open('POST', ApiEndpoint.url+url);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			req.onload = function() {
			  // This is called even on 404 etc
			  // so check the status
			  if (req.status == 200) {
				// Resolve the promise with the response text
				resolve(req.response);
			  }
			  else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				reject(req.statusText);
			  }
			};

			// Handle network errors
			req.onerror = function() {
			  reject("Network Error");
			};

			// Make the request
			req.send(angular.toJson(param));
		});
	}
  };

  return objService;
})

.factory('Storage', function(){
  return {
    getItem: function (key) {
      return localStorage.getItem(key);
    },

    getObject: function (key) {
      return angular.fromJson(localStorage.getItem(key));
    },

    setItem: function (key, data) {
      localStorage.setItem(key, data);
    },

    setObject: function (key, data) {
      localStorage.setItem(key, angular.toJson(data));
    },

    remove: function (key) {
      localStorage.removeItem(key);
    },

    clearAll : function () {
      localStorage.clear();
    }
  };
});
