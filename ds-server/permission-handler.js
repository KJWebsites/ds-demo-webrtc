function PermissionHandler() {
	if( !process.env.PROVIDER_KEY ) {
		throw new Error( 'Environment variable PROVIDER_KEY not found' );
	}
}

PermissionHandler.prototype.isValidUser = function( connectionData, authData, callback ) {
	if( authData.type === 'provider' ) {
		if( authData.key === process.env.PROVIDER_KEY ) {
			callback( null, authData.name );
		} else {
			callback( 'Invalid provider auth: ' + authData.name );
		}

		return;
	}

	callback( null, authData.user );
};

PermissionHandler.prototype.canPerformAction = function( username, message, callback ) {
	callback( null, true );
};

PermissionHandler.prototype.onClientDisconnect = function( username ) {
};

module.exports = PermissionHandler;
