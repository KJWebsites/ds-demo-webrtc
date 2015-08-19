function start() {
    var ds = deepstream( 'http://52.28.147.204:6020' );
    var iam = ds.getUid();
    ds.login( {
        username: 'ds-webrtc-example-' + iam
    } );

    var example = document.querySelector( '.webrtc-example' );

    var sourcevid = document.querySelector( '.localvideo' );

    var mediaStream = null;
    var calls = [];
    var addressBook = [];

    navigator.getUserMedia( {
            audio: false,
            video: {
                width: 160,
                height: 120
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

    function onCallRecieved( call, metaData ) {
        call.on( 'established', onCallEstablished.bind( null, call, metaData ) );
        call.accept( mediaStream );
        calls.push( call );
    }

    function onCallEstablished( call, metaData, stream ) {
        var remotevid = document.querySelector( '.remotevideo:not(.active)' );
        remotevid.src = window.URL.createObjectURL( event.stream );
        remotevid.classList.add( 'active' );

        call.on( 'ended', function() {
            remotevid.classList.remove( 'active' );
            window.URL.revokeObjectURL( remotevid.src );
            remotevid.src = '';
            calls.splice( calls.indexOf( remotevid ), 1 );
        } );
    }

    function exitRoom( callback ) {

        endAllCalls();
        ds.rpc.make( 'exit-room', {
                user: iam
            },
            function( error, data ) {
                if ( !error ) {
                    callback && callback();
                }
        } );
    }

    function enterRandomRoom() {
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
                            calls.push( call );
                        }
                    }
                }

        } );
    }

    function changeRoom() {
        exitRoom( enterRandomRoom );
    }

    function endAllCalls() {
        for ( var i = 0; i < calls.length; i++ ) {
            calls[ i ].end();
        }
        calls = [];
    }

    function startApp() {
        ds.webrtc.registerCallee( iam, onCallRecieved );
        window.addEventListener( "unload", endAllCalls, true );
        enterRandomRoom();
        example.classList.add( 'active' );
    }

    function stopApp() {
        exitRoom();
        window.URL.revokeObjectURL( sourcevid.src );
        mediaStream.stop && mediaStream.stop();
        sourcevid.src = '';
        example.classList.remove( 'active' );
    }

    window.changeRoom = changeRoom;
    window.stopApp = stopApp;
}
