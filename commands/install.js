var github = require("download-git-repo");
var path = require("path");var fs = require('fs');
var q = require("q");
var spinner = require("cli-spinner").Spinner;
var npm = require("download-npm-package");
var installer = require("../lib/installer.js");

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(path);
  }
};

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

var logInstalled = function (installed, prefix) {
	prefix = prefix || "";
	installed.forEach(function (val, key) {
		if (key == installed.length - 1) {
			if (Array.isArray(val.requirements) && val.requirements.length > 0) {
				console.log(prefix + "└─┬─ " + val.module);
				logInstalled(val.requirements, prefix + "  ");
			} else {
				console.log(prefix + "└─── " + val.module);
			}
		} else {
			if (Array.isArray(val.requirements) && val.requirements.length > 0) {
				console.log(prefix + "├─┬─ " + val.module);
				logInstalled(val.requirements, prefix + "│ ");
			} else {
				console.log(prefix + "├─── " + val.module);
			}
		}
	});
}

exports.run = function (args) {
	console.log(path.join(__dirname, "../modules"));
	var type = "npm";
	if (args.indexOf("-t") != -1 && args.indexOf("--type") != -1) throw new Error ("Moduler ERROR: install command capped at one -t/--type");
	else if (args.indexOf("-t") != -1) type = args.splice(args.indexOf("-t"), 2)[1];
	else if (args.indexOf("--type") != -1) type = args.splice(args.indexOf("--type"), 2)[1];
	if (type != "local" && type != "git" && type != "npm") throw new Error ("Moduler ERROR: install command requires -t/--type argument to be local or git");

	var download = q.defer();
	var tempPath = path.join(__dirname, "../temp");
	if (args.length == 1 && (type == "git" || type == "npm")) {
		deleteFolderRecursive(tempPath);
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
	} else if (args.length == 1 && type == "local") {
		copyFolderRecursive(args[0], path.join(tempPath, "local"))
		download.resolve(path.join(tempPath, "local"));
	}

	download.promise.then(function (tempPath) {
		installer.install(tempPath).then(function (installed) {
			deleteFolderRecursive(path.join(__dirname, "../temp"));
			if (!Array.isArray(installed)) installed = [installed];
			logInstalled(installed);
			process.exit(0);
		});
	})
}

exports.arguments = function () {
	return " {repo};"
}

exports.describeArguments = function () {
	return ["[npm module | -t local filepath | -t git [github username]/[github repo][@version]]", "    This should be the module/github repo/folder you want to install, which will make it available for import."];
}

exports.description = function () {
	return "This installs the module from the given repo or export folder"
}