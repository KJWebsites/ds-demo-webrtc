var ds = require( 'deepstream.io-client-js' )( '52.28.147.204:6021' );
var RoomsProvider = require( './rooms' );
var rooms;

var authData = {
	name: 'rooms'
};

ds.login( authData, function( success, errorEvent, errorMsg ){
	if( success ) {
		if( !rooms ) {
			rooms = new RoomsProvider( ds );
		}
		console.log( 'Rooms provider ready' );
	}
	else {
		process.stderr.write( 'Login failed: ' + errorMsg );
	}
});

ds.on( 'error', function( msg, event, topic ){
	process.stderr.write( msg );
});