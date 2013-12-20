var fs = require('fs')
  , _ = require('underscore')
  , async = require('async')
  , path = require('path');

var libs = {
	librairies: [],
	require: function(lib) {
		var p = path.join(__dirname, lib);
		
		this.librairies.push(
			_.extend({}, require('../core/lib'), require(p))
		);

		return this;
	},
	initAll: function(cb) {
		var self = this;

		async.each(this.librairies, function(lib, cb) {
			lib.init(cb);
		}, function(err) {
			cb(err, self.getAttributes());
		});
	},
	init: function(lib, cb) {
		
		cb = typeof lib === 'function' ? lib : cb;

		if(typeof lib === 'string') {
			this.require(lib);
        } else {
			var libs = fs.readdirSync(__dirname);

			libs = _.reject(libs, function(val){ return val === 'index.js'; });

			for(var i in libs)
				this.require(libs[i]);
		}

		// console.log(this.librairies);

		this.initAll(cb);
	},
	get: function(lib) {
		var self = this;

		return lib ? _.filter(self.librairies, function(v) { return v.name.toLowerCase() == lib.toLowerCase(); })[0] : this.librairies;
	},
	getAttributes: function(lib) {
		if(lib)
			return this.librairies[lib].attributes;
		else {
			var libs = {}, num = this.librairies.length;

			while(num--) {
				var l = this.librairies[num];

				libs[l.name] = l.attributes;
			}

			return libs;
		}
	}
}

module.exports = libs;