function start() {
    var ds = deepstream( 'localhost:6020' )
    ds.login( {
        username: 'ds-webrtc-example-' + ds.getUid()
    } );

    var sourcevid = document.getElementById( 'localvideo' );
    var remotevid = document.getElementById( 'remotevideo' );

    var mediaStream = null;
    var addressBook = [];

    navigator.getUserMedia( {
            audio: false,
            video: {
                width: 320,
                height: 180
            }
        },
        function( stream ) {
            mediaStream = stream;
            sourcevid.src = window.URL.createObjectURL( stream );
            startApp();
        },
        function( err ) {
            console.log( "The following error occured: " + err.name );
        }
    );

    function onCallEstablished( stream ) {
                      console.log( "Added remote stream" );
                remotevid.src = window.URL.createObjectURL( event.stream );
    }

    function startApp() {
        var iam = ( Math.random() * 100 ).toFixed( 0 );
        ds.webrtc.registerCallee( iam, function( call, metadata ) {
            call.on( 'established', onCallEstablished );
            call.accept( mediaStream );
        } );

        ds.webrtc.listenForCallees( function( callees ) {
            addressBook = callees;
            var call = ds.webrtc.makeCall( callees[ 0 ], {}, mediaStream );
            call.on( 'established', onCallEstablished );
        } );
    }
}
