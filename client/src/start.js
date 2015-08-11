function start() {
    var ds = deepstream( 'http://52.28.147.204:6020' );
    var iam = ds.getUid();
    window.document.title = iam;
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

    for( var i = 0; i < 8; i++ ) {
      var remotevid = document.createElement( 'video' );
      remotevid.id = "remotevideo-" + i;
      remotevid.className = "remotevideo video-size";
      remotevid.autoplay = true;
      document.body.appendChild( remotevid );
    }

    function resize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var elementWidth = Math.round( ( width - 60 ) / 3 );
      var elementHeight = Math.round(( height - 60 ) / 3 );
      
      var elements = window.document.getElementsByTagName( 'video' );
      for( var i =0; i < elements.length; i++ ) {
        elements[ i ].style.width = elementWidth + 'px';
        elements[ i ].style.height = elementHeight + 'px';
      }
    }
    window.addEventListener("resize", resize);
    resize();

    function onCallEstablished( call, stream ) {
      var remotevid = document.getElementById( 'remotevideo-' + activeCalls );
      remotevid.src = window.URL.createObjectURL( event.stream );
      activeCalls++;

      call.on( 'ended', function() {
        activeCalls--;
        window.URL.revokeObjectURL( remotevid.src );
      });
    }

    function startApp() {
        var calls = [];
        ds.webrtc.registerCallee( iam, function( call, metadata ) {
            call.on( 'established', onCallEstablished.bind( null, call ) );
            call.accept( mediaStream );
            calls.push( call );
        } );

        window.addEventListener("unload", function(event) { 
          for( var i=0; i<calls.length; i++ ) {
            calls[ i ].end();
          }
        }, true);

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
