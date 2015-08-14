function start() {
    var ds = deepstream( 'http://192.168.0.201:6020' );
    var iam = ds.getUid();
    ds.login( {
        username: 'ds-webrtc-example-' + iam
    } );

    var activeCalls = 0;
    var sourcevid = document.getElementById( 'localvideo' );

    var mediaStream = null;
    var addressBook = [];

    navigator.getUserMedia( {
            audio: false,
            video: {
                width: 80,
                height: 60
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

    for ( var i = 0; i < 8; i++ ) {
        var remotevid = document.querySelector( '#remotevideo' );
        remotevid.content.querySelector( '.remotevideo' ).id = "remotevideo-" + i;
        var clone = document.importNode( remotevid.content, true );
        document.body.insertBefore( clone, sourcevid );
    }

    function resize() {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var elementWidth = Math.round( ( width - 60 ) / 3 );
        var elementHeight = Math.round( ( height - 60 ) / 3 );

        var elements = document.querySelectorAll( '.videofeed' ) ;
        for ( var i = 0; i < elements.length; i++ ) {
            elements[ i ].style.width = elementWidth + 'px';
            elements[ i ].style.height = elementHeight + 'px';
        }
    }
    window.addEventListener( "resize", resize );
    resize();

    function onCallEstablished( call, metaData, stream ) {
        var remotevid = document.querySelector( '#remotevideo-' + activeCalls );
        remotevid.querySelector( 'video' ).src = window.URL.createObjectURL( event.stream );
        remotevid.querySelector( '.username' ).textContent = metaData.username;
        activeCalls++;

        call.on( 'ended', function() {
            activeCalls--;
            window.URL.revokeObjectURL( remotevid.src );
        } );
    }

    function startApp() {
        var calls = [];
        ds.webrtc.registerCallee( iam, function( call, metaData ) {
            call.on( 'established', onCallEstablished.bind( null, call, metaData ) );
            call.accept( mediaStream );
            calls.push( call );
        } );

        window.addEventListener( "unload", function( event ) {
            for ( var i = 0; i < calls.length; i++ ) {
                calls[ i ].end();
            }
        }, true );

        ds.rpc.make( 'get-random-room', {
                user: iam
            },
            function( error, data ) {
                var call;
                var metaData = {
                    username: iam
                };
                if ( !error ) {
                    for ( var i = 0; i < data.length; i++ ) {
                        if ( data[ i ] !== iam ) {
                            call = ds.webrtc.makeCall( data[ i ], metaData, mediaStream );
                            call.on( 'established', onCallEstablished.bind( null, call, metaData ) );
                        }
                    }
                }

            } );
    }
}
