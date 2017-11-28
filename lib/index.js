var q = require("q");
var select = require("select-shell");
// var reader = require("readline-sync").question;

var readline = function (description, def) {
	var deferred = q.defer();
	var result = "";

	var dataHandler = function (data) {
		// console.log(data);
		if (data[0] == 13) {
			// process.stdin.pause();
			process.stdin.removeListener("data", dataHandler);
			deferred.resolve(result || def);
		} else if (data[0] == 127) {
			result = result.substr(0, result.length - 1);
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(description + (typeof def == "string" ? ": (" + def + ") " : ": ") + result);
		} else if (data[0] == 3) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(description + (typeof def == "string" ? ": (" + def + ") " : ": ") + "Aborted\n");
		} else {
			result += data.toString();
		}
	}

	process.stdin.resume();
	process.stdout.write(description + (typeof def == "string" ? ": (" + def + ") " : ": "))
	process.stdin.on("data", dataHandler);

	return deferred.promise;
}

function Moduler () {
	var self = this;
	self.$deferred = q.defer();
	self.$then = q.defer();
	self.$start = self.$then;
	self.$result = {};
	self.queue = [];
}

Moduler.prototype.text = function (name, description, when, pattern, failMessage, def) {
	var self = this;
	var promise = self.$then.promise;
	var deferred = q.defer();
	self.queue.push({
		type: "text",
		arguments: arguments
	});

	promise.then(function () {
		if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();

		readline(description, def).then(function (answer) {
			self.$result[name] = answer;
			deferred.resolve();
		});
	}, function (err) {
		self.$deferred.reject(err);
	}).catch(function (err) {
		self.$deferred.reject(err);
	});

	self.$then = deferred;

	return self;
}

Moduler.prototype.number = function (name, description, when, min, max, def) {
	var self = this;
	var promise = self.$then.promise;
	var deferred = q.defer();
	self.queue.push({
		type: "number",
		arguments: arguments
	});

	promise.then(function () {
		if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();

		var confirmNumber = function (answer) {
			if (!isNaN(parseFloat(answer))) {
				self.$result[name] = parseFloat(answer);
				deferred.resolve();
			} else {
				readline("You entered " + answer + ", please enter a number").then(confirmNumber);
			}
		}

		readline(description, def).then(confirmNumber);
	}, function (err) {
		self.$deferred.reject(err);
	}).catch(function (err) {
		self.$deferred.reject(err);
	});

	self.$then = deferred;

	return self;
}

Moduler.prototype.boolean = function (name, description, when) {
	var self = this;
	var promise = self.$then.promise;
	var deferred = q.defer();
	self.queue.push({
		type: "boolean",
		arguments: arguments
	});

	promise.then(function () {
		if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();

		var options = ["Yes", "No"];

		var selector = select({
			pointer: ' ▸ ',
			pointerColor: 'yellow',
			msgCancel: 'No selected options!',
			msgCancelColor: 'orange',
			multiSelect: false,
			inverse: true,
			prepend: true
		});

		for (var x in options) {
			selector.option(options[x]);
		}

		console.log(description);
		selector.list();

		selector.on("select", function (selected) {
			self.$result[name] = selected[0].value == "Yes";
			deferred.resolve();
		});
	}, function (err) {
		self.$deferred.reject(err);
	}).catch(function (err) {
		self.$deferred.reject(err);
	});

	self.$then = deferred;

	return self;
}

Moduler.prototype.select = function (name, description, when, options) {
	var self = this;
	if (Array.isArray(options) && options.length > 0) {
		var promise = self.$then.promise;
		var deferred = q.defer();
		self.queue.push({
			type: "select",
			arguments: arguments
		});

		promise.then(function () {
			if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();

			var selector = select({
				pointer: ' ▸ ',
				pointerColor: 'yellow',
				msgCancel: 'No selected options!',
				msgCancelColor: 'orange',
				multiSelect: false,
				inverse: true,
				prepend: true
			});
			for (var x in options) {
				selector.option(options[x]);
			}

			console.log(description);
			selector.list();

			selector.on("select", function (selected) {
				self.$result[name] = selected[0].value;
				deferred.resolve();
			});
		}, function (err) {
			self.$deferred.reject(err);
		}).catch(function (err) {
			self.$deferred.reject(err);
		});

		self.$then = deferred;
	} else if (!Array.isArray(options)) throw new Error ("Moduler ERROR: Moduler.multiple must be called with an array of options, type " + typeof options + " used")
	else if (options.length <= 0) throw new Error ("Moduler ERROR: Moduler.multiple must be called with an array of options with a size greater than 0");

	return self;
}

Moduler.prototype.multiple = function (name, description, when, options) {
	var self = this;
	if (Array.isArray(options) && options.length > 0) {
		var promise = self.$then.promise;
		var deferred = q.defer();
		self.queue.push({
			type: "multiple",
			arguments: arguments
		});

		promise.then(function () {
			if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();

			var selector = select({
				pointer: ' ▸ ',
				pointerColor: 'yellow',
				checked: ' ✔  ',
				unchecked:'    ',
				checkedColor: 'green',
				msgCancel: 'No selected options!',
				msgCancelColor: 'orange',
				multiSelect: true,
				inverse: true,
				prepend: true
			});

			for (var x in options) {
				selector.option(options[x]);
			}

			console.log(description);
			selector.list();

			selector.on("select", function (selected) {
				self.$result[name] = selected.map(function (x) { return x.value });
				deferred.resolve();
			});
		}, function (err) {
			self.$deferred.reject(err);
		}).catch(function (err) {
			self.$deferred.reject(err);
		});

		self.$then = deferred;
	} else if (!Array.isArray(options)) throw new Error ("Moduler ERROR: Moduler.multiple must be called with an array of options, type " + typeof options + " used")
	else if (options.length <= 0) throw new Error ("Moduler ERROR: Moduler.multiple must be called with an array of options with a size greater than 0");

	return self;
}

Moduler.prototype.repeat = function (name, description, when, countOrExitQuestion, moduler) {
	if (typeof countOrExitQuestion == "number" && countOrExitQuestion <= 0) throw new Error ("Moduler repeat ERROR: count improper number");
	var self = this;
	var promise = self.$then.promise;
	var deferred = q.defer();
	self.queue.push({
		type: "repeat",
		arguments: arguments
	});
	var endResult = [];

	promise.then(function () {
		if (self.$result[name] || (when && typeof when != "function") || (typeof when == "function" && !when(self.$result))) return deferred.resolve();
		if (typeof countOrExitQuestion == "number") {
			var count = 0;
			var run = function (results) {
				endResult.push(results);
				if (count < countOrExitQuestion) moduler.copy().run().then(run, function (err) {
					self.$deferred.reject(err);
				}).catch(function (err) {
					self.$deferred.reject(err);
				});
				else {
					self.$result[name] = endResult;
					deferred.resolve();
				}
				count++;
			}

			moduler.copy().run().then(run, function (err) {
				self.$deferred.reject(err);
			}).catch(function (err) {
				self.$deferred.reject(err);
			});
			count++;
		} else {
			var check = function (results) {
				endResult.push(results);
				new Moduler ().boolean("answer", (typeof countOrExitQuestion == "string" ? countOrExitQuestion : "Would you like to add another?")).finish().run().then(function (result) {
					if (result.answer) moduler.copy().run().then(check, function (err) {
						self.$deferred.reject(err);
					}).catch(function (err) {
						self.$deferred.reject(err);
					});
					else {
						self.$result[name] = endResult;
						deferred.resolve();
					}
				}, function (err) {
					self.$deferred.reject(err);
				}).catch(function (err) {
					self.$deferred.reject(err);
				});
			}
			moduler.copy().run().then(check, function (err) {
				self.$deferred.reject(err);
			}).catch(function (err) {
				self.$deferred.reject(err);
			});
		}
	}, function (err) {
		self.$deferred.reject(err);
	}).catch(function (err) {
		self.$deferred.reject(err);
	});

	self.$then = deferred;

	return self;
}

Moduler.prototype.finish = function (when) {
	var self = this;
	var promise = self.$then.promise;
	var deferred = q.defer();
	self.queue.push({
		type: "finish",
		arguments: arguments
	});

	promise.then(function () {
		if (typeof when == "function" && !when(self.$result)) return deferred.resolve();
		self.$deferred.resolve(self.$result);
	}, function (err) {
		self.$deferred.reject(err);
	}).catch(function (err) {
		self.$deferred.reject(err);
	});

	self.$then = deferred;

	return self;
}

Moduler.prototype.run = function () {
	var self = this;
	self.$start.resolve();
	return self;
}

Moduler.prototype.then = function () {
	var self = this;
	self.$deferred.promise.then.apply(self.$deferred.promise, arguments);
	return self;
}

Moduler.prototype.catch = function () {
	var self = this;
	self.$deferred.promise.catch.apply(self.$deferred.promise, arguments);
	return self;
}

Moduler.prototype.copy = function () {
	var self = this;
	var result = new Moduler ();
	for (var x in self.queue) {
		Moduler.prototype[self.queue[x].type].apply(result, self.queue[x].arguments);
	}

	return result;
}

module.exports = Moduler;