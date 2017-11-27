var fs = require("fs");
var path = require("path");
var select = require("select-shell");
var q = require("q");
var glob = require("glob");
var beautify = require("json-format");

exports.run = function (args) {
	var module;
	if (args.indexOf("-m") != -1 && args.indexOf("--module") != -1) return console.log("Moduler ERROR: Can't use both -m and --module tags.");
	else if (args.indexOf("-m") == -1 && args.indexOf("--module") == -1) return console.log("Moduler Error: Must have --module or -m defined");
	else if (args.indexOf("-m") != -1) module = args.splice(args.indexOf("-m"), 2).pop();
	else if (args.indexOf("--module") != -1) module = args.splice(args.indexOf("--module"), 2).pop();

	var defaulted;
	if (args.indexOf("-d") != -1 && args.indexOf("--default") != -1) return console.log("Moduler ERROR: Cant use both -d and --default tags.");
	else if (args.indexOf("-d") != -1) defaulted = !(!args.splice(args.indexOf("-d"), 1));
	else if (args.indexOf("--default") != -1) defaulted = !(!args.splice(args.indexOf("--default"), 1));

	var ignore = q.defer();

	if (fs.existsSync(path.join(process.env.PWD, "/.gitignore"))) {
		var gitignore = fs.readFileSync(path.join(process.env.PWD, "/.gitignore")).toString();
		if (!gitignore.match(/\n\.moduler/m)) {
			var addToGitignore = select({
				pointer: ' ▸ ',
				pointerColor: 'yellow',
				checked: ' ✔  ',
				unchecked:'    ',
				checkedColor: 'green',
				msgCancel: 'No selected options!',
				msgCancelColor: 'orange',
				multiSelect: false,
				inverse: true,
				prepend: true
			});

			addToGitignore.option(" Yes ")
				.option(" No  ")
				.list();

			addToGitignore.on("select", function (options) {
				if (options[0].value == " Yes ") {
					fs.appendFile(path.join(process.env.PWD, "/.gitignore"), "# Moduler File Ignore\n.moduler", function (err) {
						if (err) throw err;
						console.log(".moduler Added to .gitignore");
						ignore.resolve();
					});
				} else ignore.resolve();
			})
		} else ignore.resolve();
	} else ignore.resolve();

	ignore.promise.then(function () {
		if (!fs.existsSync(path.join(process.env.PWD, "/.moduler"))) fs.writeFileSync(path.join(process.env.PWD, "/.moduler"), "{}");
		var moduler = fs.readFileSync(path.join(process.env.PWD, "/.moduler"));
		try {
			moduler = JSON.parse(moduler);
		} catch (e) {
			moduler = {};
		}

		moduler[module] = moduler[module] || [];

		for (var x in args) {
			var files = glob.sync(args[x], {});
			for (var y in files) {
				if (moduler[module].indexOf(files[y]) == -1) moduler[module].push(files[y]);
			}
		}

		fs.writeFileSync(path.join(process.env.PWD, "/.moduler"), beautify(moduler, { type: "tab" }));
		process.exit(0);
	});
}

exports.arguments = function () {
	return " {-m --module moduleName} [glob, [glob, ...]];"
}

exports.describeArguments = function () {
	return ["{-m --module moduleName} IE: --module catalog", "    This tells the system which module you want to add files to",
			"[glob, [glob, ...] IE: ~/code/*.js ~/example/**/*.*", "    This tells the system which sets of files found under", "    given globs are to be added"];
}

exports.description = function () {
	return "This adds the listed files to the file stack";
}