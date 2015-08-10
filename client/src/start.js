function start() {
    var ds = deepstream( 'http://52.28.147.204:6020' );
    ds.login( {
        username: 'ds-webrtc-example-' + ds.getUid()
    } );

    var users;
    var sourcevid = document.getElementById( 'localvideo' );

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

    function onCallEstablished( call, stream ) {
      var remotevid = document.createElement( 'video' );
      remotevid.className = "remotevideo";
      remotevid.autoplay = true;
      document.body.appendChild( remotevid );
      remotevid.src = window.URL.createObjectURL( event.stream );

      call.on( 'ended', function() {
        document.body.removeChild( remotevid );
      })
    }

    function startApp() {
        var iam = ( Math.random() * 100 ).toFixed( 0 );
        
        ds.webrtc.registerCallee( iam, function( call, metadata ) {
            call.on( 'established', onCallEstablished.bind( null, call ) );
            call.accept( mediaStream );
        } );

        ds.rpc.make( 'get-random-room', {
            user: iam
          },
          function( error, data ) {
            var call;
            for( var i=0; i<data.length; i++) {
              if( data[ i ] !== iam) {
                  call = ds.webrtc.makeCall( data[ i ], {}, mediaStream );
                  call.on( 'established', onCallEstablished.bind( null, call ) );
              }
            }
       } );
    }
}
