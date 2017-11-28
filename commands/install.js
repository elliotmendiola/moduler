var github = require("download-git-repo");
var path = require("path");var fs = require('fs');
var q = require("q");
var spinner = require("cli-spinner").Spinner;
var npm = require("download-npm-package");
var installer = require("../lib/installer");

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

exports.run = function (args) {
	console.log(path.join(__dirname, "../modules"));
	var type = "npm";
	if (args.indexOf("-t") != -1 && args.indexOf("--type") != -1) throw new Error ("Moduler ERROR: install command capped at one -t/--type");
	else if (args.indexOf("-t") != -1) type = args.splice(args.indexOf("-t"), 2)[1];
	else if (args.indexOf("--type") != -1) type = args.splice(args.indexOf("--type"), 2)[1];
	if (type != "local" && type != "git" && type != "npm") throw new Error ("Moduler ERROR: install command requires -t/--type argument to be local or git");

	var download = q.defer();
	if (args.length == 1 && (type == "git" || type == "npm")) {
		var tempPath = path.join(__dirname, "../temp");
		deleteFolderRecursive(tempPath);
		var downloadSpinner = new spinner ("Downloading Module ... %s ");
		downloadSpinner.setSpinnerString(0);
		downloadSpinner.start();
		if (type == "npm") {
			npm({
				arg: args[0],
				path: tempPath
			}).then(function () {
				download.resolve(tempPath);
			}).catch(function (err) {
				console.error(err);
			})
		} else if (type == "git") {
			github(args[0], tempPath, function (err) {
				downloadSpinner.stop();
				if (err) throw new Error (err);

				console.log("\nModule Successfully Downloaded");
				download.resolve(tempPath);
			});
		}
	} else if (args.length == 1 && type == "local") {
		download.resolve(args[0]);
	}

	download.promise.then(function (tempPath) {
		installer(path.join(tempPath, (type == "npm" ? "/" + args[0].split("@")[0] : "/"))).then(function () {
			if (type == "git" || type == "npm") deleteFolderRecursive(tempPath);
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