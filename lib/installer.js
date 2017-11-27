module.exports = function (git, repo, callback) {
	console.log(arguments);
	var added = {};
	return {
		add: function (name, files) {
			added[name] = files;
		},
		done: function (err) {

			/*
			 * Finalize files
			 */

			typeof callback == "function" && callback(err);
		}
	}
}