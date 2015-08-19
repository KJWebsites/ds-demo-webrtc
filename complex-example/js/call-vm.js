define(function( require ){
	var ko = require( 'ko' );

	function CallVm( stream, name, call ) {
		this.stream = URL.createObjectURL( stream );
		this.showControls = ko.observable( !!call );
		this.isMute = ko.observable( false );
		this.calleeName = ko.observable( name );
		this.call = call;
	}

	CallVm.prototype.toggleMute = function() {
		this.isMute( !this.isMute() );
	};

	CallVm.prototype.hangUp = function() {
		this.call.end();
	};

	return CallVm;
});