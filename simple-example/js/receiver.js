window.onload = function() {
	function showVideo( id, stream ) {
		var element = document.getElementById( id );
		element.src = URL.createObjectURL( stream );
		element.play();
	}

	var ds = deepstream( 'localhost:6020' ).login();
	var localStream;

	getUserMedia({ video: true }, function( stream ){
		localStream = stream;
		showVideo( 'input-video', stream );
	}, function( error ){
		throw error;
	});

	ds.webrtc.registerCallee( 'test-callee', function( call, metaData ){
		call.accept( localStream );

		call.on( 'established', function( remoteStream ){
			showVideo( 'output-video', remoteStream );
		});
	});
};