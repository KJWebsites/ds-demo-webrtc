var Deepstream = require( 'deepstream.io' );
var PermissionHandler = require( './permission-handler' );

var ds = new Deepstream();
ds.set( 'permissionHandler', new PermissionHandler() );
ds.set( 'host', '52.28.147.204')
ds.start();