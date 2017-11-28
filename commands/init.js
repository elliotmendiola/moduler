var run = require("child_process").spawn;
var cli = require("../lib/index.js");
var fs = require("fs");
var path = require("path");
var glob = require("glob");
var untildify = require('untildify');
var beautify = require("json-format");
var spinner = require("cli-spinner").Spinner;
var q = require("q");

var getDefault = function getDefault (val, current) {
	return current || val;
};

exports.run = function (args) {
	var def;
	try {
		def = JSON.parse(fs.readFileSync(path.join(process.env.PWD, "/package.json")));
	} catch (e) {
		def = {};
	}

	new cli ()
		.text("name", "name", false, undefined, undefined, getDefault(process.env.PWD.replace(/.*\//, ""), def.name))
		.text("version", "version", false, undefined, undefined, getDefault("1.0.0", def.version))
		.text("description", "description")
		.text("main", "entry point", false, undefined, undefined, getDefault("index.js", def.main))
		.text("test", "test command", false, undefined, undefined, getDefault(undefined, def.scripts && def.scripts.test))
		.text("git", "git repository", false, undefined, undefined, getDefault(undefined, def.repository && def.repository.url))
		.text("keywords", "keywords", false, undefined, undefined, getDefault(undefined, def.keywords && def.keywords.join && def.keywords.join(" ")))
		.text("author", "author", false, undefined, undefined, getDefault(undefined, def.author))
		.text("license", "license", false, undefined, undefined, getDefault("ISC", def.license))
		.boolean("multiple", "Will you be making multiple modules?")
		.text("folder", "\nModule Location (folder location)", function (result) { return !result.multiple })
		.text("glob", "Copied Files (globs, comma separated, ignores node_modules)", function (result) { console.log(result.folder && !result.multiple); return result.folder && !result.multiple }, undefined, undefined, "**/*")
		.finish(function (result) { return !result.multiple })
		.repeat("modules", "Module Information", false, "Would you like to add another Module", new cli ()
			.text("name", "\nModule Name")
			.text("description", "description")
			.text("folder", "Module Location (folder location)")
			.text("glob", "Copied Files (globs, comma separated, ignores node_modules)", function (result) { return result.folder }, undefined, undefined, "**/*")
			.finish())
		.finish()
		.run()
		.then(function (result) {
			var files;
			var exclude;
			console.log("\nChecking for files to add to modules:\n");
			try {
				if (result.multiple) {
					files = {};
					exclude = {};
					for (var x in result.modules) {
						if (result.modules[x].folder && result.modules[x].folder !== "") {
							if (result.modules[x].glob && result.modules[x].glob !== "") {
								result.modules[x].glob = result.modules[x].glob.split(",").map(function (val) { return val.trim(); });
								for (var y in result.modules[x].glob) {
									if (result.modules[x].glob.indexOf("!") !== 0) {
										files[result.modules[x].name] = (files[result.modules[x].name] || []).concat(glob.sync(untildify(path.join(result.modules[x].folder, result.modules[x].glob[y]))));
									} else {
										exclude[result.modules[x].name] = (exclude[result.modules[x].name] || []).concat(glob.sync(untildify(path.join(result.modules[x].folder, result.modules[x].glob[y].substr(1)))));
									}
								}
							} else {
								files[result.modules[x].name] = (files[result.modules[x].name] || []).concat(glob.sync(untildify(path.join(result.modules[x].folder, "**/*"))));
							}
						}

						var copyless = [];
						files[result.modules[x].name].map(function (file) { if (copyless.indexOf(file) == -1 && !file.match(/node_modules/)) copyless.push(file) });
						files[result.modules[x].name] = copyless;
						exclude[result.modules[x].name] && exclude[result.modules[x].name].map(function (file) { while (files[result.modules[x].name].indexOf(file) != -1) { files[result.modules[x].name].splice(files[result.modules[x].name].indexOf(file), 1) } });

						for (var z in files[result.modules[x].name]) {
							console.log(files[result.modules[x].name][z].replace(untildify(result.modules[x].folder), "") + " added to " + result.modules[x].name);
						}

						files[result.modules[x].name] = files[result.modules[x].name].map(function (file) { return { path: file, folder: result.modules[x].folder, local: file.replace(untildify(result.modules[x].folder), "") } });
					}
				} else {
					files = [];
					if (result.folder && result.folder !== "") {
						if (result.glob && result.glob !== "") {
							result.glob = result.glob.split(",").map(function (val) { return val.trim(); });
							for (var y in result.glob) {
								if (result.glob[y].indexOf("!") !== 0) {
									files = (files || []).concat(glob.sync(untildify(path.join(result.folder, result.glob[y]))));
								} else {
									exclude = (exclude || []).concat(glob.sync(untildify(path.join(result.folder, result.glob[y].substr(1)))));
								}
							}
						} else {
							files = (files || []).concat(glob.sync(untildify(path.join(result.folder, "**/*"))));
						}
					}

					var copyless = [];
					files.map(function (file) { if (copyless.indexOf(file) == -1 && !file.match(/node_modules/)) copyless.push(file) });
					files = copyless;
					exclude.map(function (file) { while (files.indexOf(file) != -1) { files.splice(files.indexOf(file), 1) } });

					for (var z in files) {
						console.log(files[z].replace(untildify(result.folder), "") + " added to " + result.name);
					}

					files = files.map(function (file) { return { path: file, folder: result.folder, local: file.replace(untildify(result.folder), "") } });
				}
			} catch (e) {
				console.error(e);
			}

				try {
				var endResult = {}
				if (result.name) endResult.name = result.name;
				if (result.version) endResult.version = result.version;
				if (result.description) endResult.description = result.description;
				if (result.main) endResult.main = result.main;
				if (result.test) endResult.scripts = { test: result.test };
				if (result.git) endResult.repository = { type: "git", url: result.git };
				if (result.keywords) endResult.keywords = result.split(" ");
				if (result.author) endResult.author = result.author;
				if (result.license) endResult.license = result.license;
				if (result.multiple) endResult.moduler = result.modules.map(function (module) { return { name: module.name, description: module.description }; });
				else endResult.moduler = result.name;

				console.log("\n" + beautify(endResult, { type: "space", size: 2 }) + "\n");

				new cli ().boolean("finalize", "Would you like to finalize this module?")
					.finish()
					.run()
					.then(function (answer) {
						if (!answer.finalize) process.exit(0);
						else {

							var ensureDirectoryExistence = function (filePath) {
								var dirname = path.dirname(filePath);
								if (fs.existsSync(dirname)) {
									return true;
								}
								ensureDirectoryExistence(dirname);
								fs.mkdirSync(dirname);
							}

							var copyFile = function (file, module) {
								var deferred = q.defer();

								ensureDirectoryExistence(path.join(".", (module ? "modules/" + module + "/" : "") + file.local))
								fs.writeFile(path.join(".", (module ? "modules/" + module + "/" : "") + file.local), fs.readFileSync(file.path), { flag: "w+" }, function (err) {
									if (err) return deferred.reject(err);
									process.stdout.clearLine();
									process.stdout.cursorTo(0);
									process.stdout.write("✔ added " + file.local + "\nCopying files ... -");
									deferred.resolve();
								})

								return deferred.promise;
							}

							var copyFilesSpinner = new spinner ("Copying files ... %s");
							copyFilesSpinner.setSpinnerString(0);
							copyFilesSpinner.start();

							var all = [];

							try {
								console.log("");
								if (Array.isArray(endResult.moduler) && typeof endResult.moduler != "string") {
									for (var module in files) {
										for (var x in files[module]) {
											all.push(copyFile(files[module][x], module));
										}
									}
								} else {
									for (var x in files) {
										all.push(copyFile(files[x]));
									}
								}

								q.all(all).then(function () {
									fs.writeFileSync(path.join(process.env.PWD, "/package.json"), beautify(endResult), { flag: "w+" });
									copyFilesSpinner.stop();
									process.stdout.clearLine();
									process.stdout.cursorTo(0);
									process.stdout.write("\nSuccessfully initialized your project!");
									process.exit(0);
								}).catch(function (err) {
									console.error(err);
								});
							} catch (e) {
								console.error(e);
							}
						}
					});
			} catch (e) {
				console.error(e);
			}
		});
}

exports.arguments = function () {
	return ";"
}

exports.describeArguments = function () {
	return [];
}

exports.description = function () {
	return "This initializes the current working directory as a ready to upload module";
}