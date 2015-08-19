requirejs.config({
    baseUrl: 'js',
    paths: {
    	'webrtc-adapter': '../bower_components/webrtc-adapter/adapter',
    	'ko': '../bower_components/knockout/dist/knockout',
    	'deepstream': '../bower_components/deepstream.io-client-js/dist/deepstream'
    }
});

require([ 'deepstream', 'ko', 'webrtc-adapter'], function( deepstream, ko ){
    var ds = new deepstream( 'localhost:6020' );

	ds.login({}, function(){
		define( 'ds', ds );
        require( ['./group-chat-vm' ], function( GroupChatVm ){
            ko.applyBindings( new GroupChatVm() );
        });
	});
});


