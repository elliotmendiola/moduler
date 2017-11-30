const q = require("q");
const fs = require("fs");
const path = require("path");
const modules = path.join(__dirname, "/modules");

var downloads = {};

var ensureDirectoryExistence = function (filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

var copyFolderRecursive = function (origin, destination) {
	if (fs.existsSync(origin)) {
		fs.readdirSync(origin).forEach(function (file, index) {
			var current = origin + "/" + file;
			var currentDestination = destination + "/" + file;
			if (fs.lstatSync(current).isDirectory()) {
				copyFolderRecursive(current, currentDestination);
			} else {
				ensureDirectoryExistence(currentDestination);
				fs.writeFileSync(currentDestination, fs.readFileSync(current), { flag: "w+" });
			}
		});
	}
}

var installer = {
	install: function (folder) {
		var self = this;
		var deferred = q.defer();
		console.log(folder);
		if (fs.existsSync(path.join(folder, "/package.json"))) {
			try {
				var package = fs.readFileSync(path.join(folder, "/package.json"));

				if (typeof package.moduler == "string") {
					var installs = {};
					var allDownloads = [];
					if (package.requirements) {
						for (let x in package.requirements) {
							if (!fs.existsSync(path.join(modules, package.requirements[x].name, package.requirements[x].type + ":" + package.requirements[x].repo, "/package.json"))) {
								allDownloads.push(self.download(package.requirements[x].type, package.requirements[x].repo))
								allDownloads[allDownloads.length - 1].then(function (result) {
									installs[package.requirements[x].type + ":" + package.requirements[x].repo] = result;
								});
							} else {
								var reqPackage = JSON.parse(fs.readFileSync(path.join(modules, package.requirements[x].name, package.requirements[x].type + ":" + package.requirements[x].repo, "/package.json")));

								if (reqPackage.version) {
									var version = reqPackage.version.match(/(\d+)\.(\d+)\.(\d+)/).splice(1, 3).map(function (val) { return parseInt(val); }).map(function (val, key) { var comparison = (package.requirements[x].version || reqPackage.version).match(/(\d+)\.(\d+)\.(\d+)/).splice(1, 3).map(function (val) { return parseInt(val); })[key]; if (val == comparison) return undefined; else return val > comparison });
									version = (version.indexOf(true) != -1 ? version.indexOf(true) : 3) <= (version.indexOf(false) != -1 ? version.indexOf(false) : 3);
									if (version) {
										allDownloads.push(self.download(package.requirements[x].type, package.requirements[x].repo))
										allDownloads[allDownloads.length - 1].then(function (result) {
											installs[package.requirements[x].type + ":" + package.requirements[x].repo] = result;
										});
									}
								}
							}
						}
					}

					q.all(allDownloads).then(function (requirements) {
						copyFolderRecursive(path.join(folder, "../"), path.join(modules, package.moduler, folder.replace(/.+\//g, "")));
						deferred.resolve({
							module: package.moduler,
							requirements: requirements
						});
					});
				} else if (Array.isArray(package.moduler)) {
					var all = [];
					for (var x in package.moduler) {
						all.push(self.install(path.join(folder, "modules/" + package.moduler[x].name)));
					}

					q.all(all).then(function (result) {
						deferred.resolve(result);
					}).catch(function (err) {
						deferred.reject(err);
					});
				}
			} catch (e) {
				deferred.reject(e);
			}
		} else deferred.reject(new Error ("Installation ERROR: package.json missing from folder"))

		deferred.resolve();

		return deferred.promise;
	},
	download: function (type, repository) {
		if (!downloads[type + ":" + repository]) {
			var deferred = q.defer();
			var download = q.defer();
			var tempPath = path.join(__dirname, "../temp");
			var downloadSpinner = new spinner ("Downloading Module ... %s ");
			downloadSpinner.setSpinnerString(0);
			downloadSpinner.start();
			if (type == "npm") {
				npm({
					arg: args[0],
					path: tempPath
				}).then(function () {
					fs.renameSync(path.join(tempPath, args[0]), path.join(tempPath, "npm:" + args[0]))
					download.resolve(path.join(tempPath, "npm:" + args[0]));
				}).catch(function (err) {
					console.error(err);
				})
			} else if (type == "git") {
				github(args[0], path.join(tempPath, "git:" + args[0]), function (err) {
					downloadSpinner.stop();
					if (err) throw new Error (err);

					console.log("\nModule Successfully Downloaded");
					download.resolve(path.join(tempPath, args[0]), path.join(tempPath, "npm:" + args[0]));
				});
			}

			download.then(self.install).then(function (installed) {
				delete downloads[type + ":" + repository];
				deferred.resolve(installed);
			}).catch(function (err) {
				console.error(err);
			});

			return deferred.promise;
		} else {
			return downloads[type + ":" + repository];
		}
	}
}

module.exports = installer