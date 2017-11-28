const q = require("q");

module.exports = function (package, path) {
	var deferred = q.defer();

	console.log("DOING STUFF");
	deferred.resolve();

	return deferred.promise;
}