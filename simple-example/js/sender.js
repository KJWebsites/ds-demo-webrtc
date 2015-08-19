window.onload = function() {
	function showVideo( id, stream ) {
		var element = document.getElementById( id );
		element.src = URL.createObjectURL( stream );
		element.play();
	}

	var ds = deepstream( 'localhost:6020' ).login();

	getUserMedia({ video: true }, function( localStream ){
		showVideo( 'input-video', localStream );

		var call = ds.webrtc.makeCall( 'test-callee', null, localStream );
		
		call.on( 'established', function( remoteStream ){
			showVideo( 'output-video', remoteStream );
		});
	}, function( error ){
		throw error;
	});
};