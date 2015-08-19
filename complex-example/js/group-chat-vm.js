define(function( require ){
	var ko = require( 'ko' );
	var ds = require( 'ds' );
	var CallVm = require( './call-vm' );
	var CalleeVm = require( './callee-vm' );

	function GroupChatViewModel() {
		ds.webrtc.listenForCallees( this._onCalleeUpdate.bind( this ) );
		this.callees = ko.observableArray();
		this.calleeName = ko.observable();
		this.calls = ko.observableArray([]);
		
		this.showModal = ko.observable( true );
		this.visibleInModal = ko.observable( 'set-name' );
		this.localStream = null;

		getUserMedia({ video: true }, this._onLocalStream.bind( this ), this._onLocalStreamError.bind( this ) );

		if( location.search ) {
			this.calleeName( location.search.substr( 1 ) );
			this.setName();
		}
	}

	GroupChatViewModel.prototype.setName = function() {
		ds.webrtc.registerCallee( this.calleeName(), this._onIncomingCall.bind( this ) );
		this.showModal( false );
	};

	GroupChatViewModel.prototype.makeCall = function( calleeName ) {
		var calleeVm = this._getCalleeVm( calleeName );

		if( !calleeVm.call ) {
			var call = ds.webrtc.makeCall( calleeName, { name: this.calleeName() }, this.localStream );
			this._bindCallEvents( call, calleeName );
			calleeVm.setCall( call, false );
		}
	};

	GroupChatViewModel.prototype._onLocalStream = function( stream ) {
		this.localStream = stream;
		this.calls.push( new CallVm( stream ) );
	};

	GroupChatViewModel.prototype._onLocalStreamError = function( error ) {
		console.log( 'stream error', error );
	};

	GroupChatViewModel.prototype._onIncomingCall = function( call, metaData ) {
		this._bindCallEvents( call, metaData.name );
		this._getCalleeVm( metaData.name ).setCall( call, true );
	};

	GroupChatViewModel.prototype._bindCallEvents = function( call, name ) {
		call.on( 'established', this._addCall.bind( this, call, name ) );
		call.on( 'ended', this._removeCall.bind( this, call ));
	};

	GroupChatViewModel.prototype._addCall = function( call, name, stream ) {
		this.calls.push( new CallVm( stream, name, call ) );
	};

	GroupChatViewModel.prototype._removeCall = function( call ) {
		this.calls( this.calls().filter(function( callVm ){
			return callVm.call !== call;
		}));
	};

	GroupChatViewModel.prototype._getCalleeVm = function( calleeName ) {
		for( var i = 0; i < this.callees().length; i++ ) {
			if( this.callees()[ i ].name() === calleeName ) {
				return this.callees()[ i ];
			}
		}
		return new CalleeVm( calleeName, this );
	};

	GroupChatViewModel.prototype._onCalleeUpdate = function( calleeNames ) {
		this.callees( calleeNames.map( this._getCalleeVm.bind( this ) ) );
	};

	return GroupChatViewModel;
});