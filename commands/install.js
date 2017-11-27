var github = require("download-git-repo");
var path = require("path");var fs = require('fs');
var q = require("q");
var spinner = require("cli-spinner").Spinner;

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
	var type;
	if (args.indexOf("-t") == -1 && args.indexOf("--type") == -1) throw new Error ("Moduler ERROR: install command requires -t/--type argument to be local or git");
	else if (args.indexOf("-t") != -1 && args.indexOf("--type") != -1) throw new Error ("Moduler ERROR: install command capped at one -t/--type");
	else if (args.indexOf("-t") != -1) type = args.splice(args.indexOf("-t"), 2)[1];
	else if (args.indexOf("--type") != -1) type = args.splice(args.indexOf("--type"), 2)[1];
	if (type != "local" && type != "git") throw new Error ("Moduler ERROR: install command requires -t/--type argument to be local or git");

	var download = q.defer();
	if (args.length == 1 && type == "git") {
		var tempPath = path.join(__dirname, "../temp");
		deleteFolderRecursive(tempPath);
		var downloadSpinner = new spinner ("Downloading Module ... %s ");
		downloadSpinner.setSpinnerString(0);
		downloadSpinner.start();
		github(args[0], tempPath, function (err) {
			downloadSpinner.stop();
			if (err) throw new Error (err);

			console.log("\nModule Successfully Downloaded");
			download.resolve(tempPath);
		});
	} else if (args.length == 1 && type == "local") {
		download.resolve(args[0]);
	}

	download.promise.then(function (tempPath) {
		var installSpinner = new spinner ("Installing Module " + args[0] + " ... %s ");
		installSpinner.setSpinnerString(0);
		installSpinner.start();

		if (fs.existsSync(path.join(tempPath, "/package.json"))) {

			try {
				var tempPackage = JSON.parse(fs.readFileSync(path.join(tempPath, "/package.json")));

				if (!fs.existsSync(path.join(tempPath, tempPackage.main))) throw new Error ("Package Missing Entry Point: " + tempPackage.main)
				require(path.join(tempPath, tempPackage.main))(require("../lib/index.js")(type == "git", args[0], function () {
					console.log("\nFinished Installing!");
					if (type == "git") deleteFolderRecursive(tempPath);
					installSpinner.stop();
				}));
			} catch (err) {
				console.log("\nErrored During Installation");
				console.error(err);
				if (type == "git") deleteFolderRecursive(tempPath);
				installSpinner.stop();
			}
		} else {
			console.log("Error During Installation: package.json missing in " + args[0]);
			if (type == "git") deleteFolderRecursive(tempPath);
			installSpinner.stop();
		}
	})
}

exports.arguments = function () {
	return " {repo};"
}

exports.describeArguments = function () {
	return ["{repo} IE: exampleUser/exampleProject#branch", "    This should be the owner/name#branch of the repo you want to import OR", "    local file folder path glob"];
}

exports.description = function () {
	return "This installs the module from the given repo or export folder"
}