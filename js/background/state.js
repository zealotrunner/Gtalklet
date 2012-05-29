var state = {
	constants: {},
	state: {},
	loadedFeatures: {'xmpp': true},
	/*
	recover = function() {
		this = optionManager.get('recovery', true);
		this.recovered = true;
	},
	*/
};

/*
console.log( (new Date().getTime()) - optionManager.get('crashed_at', false));
if (optionManager.get('crashed_at', false) && (new Date().getTime()) - optionManager.get('crashed_at', false) < 2000) {
	state = optionManager.get('recovery');
	state.recovered = true;
} else {
	state.recovered = false;
}
*/

$.extend(true, state, ((function() {
	var 
	_defaultConstants = {};
	_defaultState = {},
	_loadedFeatures = {'xmpp': true},
	_handlers = {}

	addStateConstants = function(constants) {
		if (!state.recovered) {
			$.extend(true, state.constants, constants);
		}
	},
	addState = function(newState) {
		if (!state.recovered) {
			$.extend(true, state.state, newState);
		}
	},
	addDefaultState = function(newState) {
		if (!state.recovered) {
			$.extend(true, _defaultState, newState);
			$.extend(true, state.state, newState);
		}
	},
	addHandler = function(handlerName, handler) {
		if (!_handlers[handlerName]) {
			_handlers[handlerName] = [];
		}
		_handlers[handlerName].push(handler);
	},

	allRegistered = function() {
		_defaultState = $.extend(true, {}, state.state);
		_defaultConstants = $.extend(true, {}, state.constants);
	},

	reset = function() {
		state.loadedFeatures = {'xmpp': true};
		_loadedFeatures = {'xmpp': true};

		state.state = {};
		state.constants = {};
		$.extend(true, state.state, _defaultState);
		$.extend(true, state.constants, _defaultConstants);

		optionManager.updated('JID');
	},
	
	featureLoaded = function(featureName) {
		return _loadedFeatures[featureName];
	},
	
	loadedFeature = function(featureName) {
		state.loadedFeatures[featureName] = true;
		_loadedFeatures[featureName] = true;
	},

	/**
	 * @param string report 操作名
	 * @param array parameters 操作的参数
	 */
	call = function(report, parameters) {
		var stateChange = {
			report: report,
			returns: parameters
		};
		var returns = stateChange.returns;

		if (_handlers[report]) {
			for (var index in _handlers[report]) {
				_handlers[report][index](parameters, returns, stateChange);
			}
		}

		return stateChange;
	}; 

	return {
		addState: addState,
		addStateConstants: addStateConstants,
		addDefaultState: addDefaultState,
		addHandler: addHandler,
		reset: reset,
		allRegistered: allRegistered,
		featureLoaded: featureLoaded,
		loadedFeature: loadedFeature,
		call: call,
	};
})()));
