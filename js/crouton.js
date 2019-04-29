class Crouton {
	constructor(options) {
		this.options = options;
	}

	getFormats(callback) {
		$.getJSON(options['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies&method=?', callback);
	}
}
