define(function( require ){
	var ko = require( 'ko' );

	function CalleeVm( name, groupChatVm ) {
		this.name = ko.observable( name );
		this.state = ko.observable();
		this.call = null;
		this._groupChatVm = groupChatVm;
		this._isIncoming = null;
	}

	CalleeVm.prototype.setCall = function( call, isIncoming ) {
		this.call = call;
		this.call.on( 'stateChange', this._applyCallState.bind( this ) );
		this._isIncoming = isIncoming;
		this._applyCallState();
	};

	CalleeVm.prototype.acceptCall = function( vm, event ) {
		event.stopPropagation();
		this.call.accept( this._groupChatVm.localStream );
	};

	CalleeVm.prototype.declineCall = function( vm, event ) {
		event.stopPropagation();
		this.call.decline();
	};

	CalleeVm.prototype.cancelCall = function( vm, event ) {
		event.stopPropagation();
		this.call.end();
	};
	
	CalleeVm.prototype._applyCallState = function() {
		if( [ 'ERROR', 'DECLINED', 'ENDED' ].indexOf( this.call.state ) !== -1 ) {
			this.state( null );
			this.call = null;
		}
		else if( this.call.state === 'ESTABLISHED' ) {
			this.state( 'established' );
		}
		else if( this._isIncoming ) {
			this.state( 'incoming' );
		}
		else {
			this.state( 'outgoing' );
		}
	};

	return CalleeVm;
});