function shuffle(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function log( message, data ) {
	var logMessage = ( new Date() ).toGMTString() + ' | ' + message + ' | ';
	if( data ) {
		console.log( logMessage, data );
	} else {
		console.log( logMessage );
	}
}

module.exports = {
  shuffle: shuffle,
  log: log
}