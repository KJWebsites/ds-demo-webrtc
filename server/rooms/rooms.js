var utils = require( './utils' );
var maxUsers = 3;

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
		console.log( 'Should remove', user)
		if( typeof user.room !== 'undefined' ) {
			room = rooms[ user.room ];
			room.users.splice( room.users.indexOf( name ), 1 );
			utils.log( 'Removing user ' + user.name + ' from room ' + room.name );
		}
	}
}

var roomID = 0;
function getRandomRoom( rooms, user ) {
	var room = null;
	var randomRooms = utils.shuffle( rooms.slice( 0 ) );
	for( var i = 0; i < randomRooms.length && !room; i++ ) {
		if( randomRooms[ i ].users.length < maxUsers ) {
			room = randomRooms[ i ];
			room.users.push( user );
			break;
		}
	}
	if( !room ) {
		room = { name: roomID++, users: [ user ] };
		rooms.push( room );
	}
	user.room = room.name;
	utils.log( 'Added user ' + user.name + ' to room ' + room.name );
	utils.log( 'Room ' + room.name + ' now has ' + room.users.length + ' users' );
	return room;
}

module.exports = function( ds ) {
	var rooms = [];
	var users = {};

	ds.webrtc.listenForCallees( function( callees ) {
		var userChanges = getUserChanges( users, callees );
		users = userChanges.currentUsers;
		removeUsers( userChanges.unSubscribedUsers, rooms );
	} );

	ds.rpc.provide( 'get-random-room', function( data, response ) {
		var user = data.user;
		var result = [];
		var room;

		if( !user ) {
			response.error( 'Missing User' );
		}

		room = getRandomRoom( rooms, users[ user ] );
		
		for( var i=0; i< room.users.length; i++) {
			result.push( room.users[ i ].name );
		} 
		response.send( result );
	} );
};