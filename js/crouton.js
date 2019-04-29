class Crouton {
	constructor(options) {
		this.options = options;
	}

	getServiceBodies(callback) {
		jQuery.getJSON(this.options['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies&callback=?', callback);
	}

	getFormats(callback) {
		jQuery.getJSON(this.options['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&callback=?', callback);
	}
}
