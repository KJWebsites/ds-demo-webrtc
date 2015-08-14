var Deepstream = require( 'deepstream.io' );
var PermissionHandler = require( './permission-handler' );

var ds = new Deepstream();
ds.set( 'permissionHandler', new PermissionHandler() );
ds.set( 'host', '192.168.0.201')
ds.start();