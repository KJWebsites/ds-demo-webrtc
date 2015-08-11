var utils = require( './utils' );
var maxUsers = 9;
var roomID = 0;

module.exports = function( ds ) {
	var rooms = [];
	var users = {};

	function getUserChanges( oldUsers, newUsers) {
	  var currentUsers = {};
	  var unSubscribedUsers = {};
	  var i, k;
	  for (i=0, len=newUsers.length; i<len; i++) { 
	  	currentUsers[ newUsers[ i ] ] = oldUsers[ newUsers[ i ] ] || { name: newUsers[ i ] }; 
	  }
	  for ( k in oldUsers) { 
	  	if ( typeof currentUsers[ k ] === 'undefined' ) {
			  unSubscribedUsers[ k ] = oldUsers[ k ];
		 }
	  }
	  return { currentUsers: currentUsers, unSubscribedUsers: unSubscribedUsers};
	}

	function removeUsers( unsubscribedUsers, rooms ) {
		var user;
		var room;
		for( var name in unsubscribedUsers ) {
			user = unsubscribedUsers[ name ];
			if( typeof user.room !== 'undefined' ) {
				room = rooms[ user.room ];
				user = room.users.splice( room.users.indexOf( name ), 1 );
				utils.log( 'Removing user ' + name + ' from room ' + room.name );
				utils.log( 'Room ' + room.name + ' now has ' + room.users.length + ' users' + ' : ' + JSON.stringify( room.users ) );
			}
		}
	}

	function addUserToRoom( room, user) {
		room.users.push( user.name );
		user.room = room.name;
		utils.log( 'Added user ' + user.name + ' to room ' + room.name );
		utils.log( 'Room ' + room.name + ' now has ' + room.users.length + ' users : ' + room.users.join( ',' ) );
	}

	function getRoom( sortedRooms ) {
		var room = null;
		
		for( var i = 0; i < sortedRooms.length && !room; i++ ) {
			if( sortedRooms[ i ].users.length < maxUsers ) {
				room = sortedRooms[ i ];
				break;
			}
		}
		if( !room ) {
			room = { name: roomID++, users: [] };
			rooms.push( room );
		}
		return room;
	}

	function validate( data ) {
		if( typeof data.user === 'undefined' ) {
			return 'Please provider a username';
		}

		if( typeof users[ data.user ] === 'undefined' ) {
			return 'Please register user as a callee';
		}

		return null;
	}

	ds.webrtc.listenForCallees( function( callees ) {
		var userChanges = getUserChanges( users, callees );
		users = userChanges.currentUsers;
		removeUsers( userChanges.unSubscribedUsers, rooms );
	} );

	ds.rpc.provide( 'get-random-room', function( data, response ) {
		var room;
		var randomRooms = utils.shuffle( rooms.slice( 0 ) );
		var validationMessage = validate( data );
		if( validationMessage ) {
			response.error( validation );
		}

		room = getRoom( randomRooms );
		addUserToRoom( room, users[ data.user ] )

		response.send( room.users );
	} );
};