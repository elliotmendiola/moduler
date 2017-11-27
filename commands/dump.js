var fs = require("fs");
var path = require("path");
var select = require("select-shell");
var q = require("q");
var beautify = require("json-format");

exports.run = function (args) {
	module = args;

	var all = false;
	if (args.indexOf("-a") != -1) all = !(!args.splice(args.indexOf("-a"), 1));
	else if (args.indexOf("--all") != -1) all = !(!args.splice(args.indexOf("--all"), 1));

	if (all) {
		fs.writeFileSync(path.join(process.env.PWD, "/.moduler"), "{}");
		process.exit(0);
	}

	if (!fs.existsSync(path.join(process.env.PWD, "/.moduler"))) fs.writeFileSync(path.join(process.env.PWD, "/.moduler"), "{}");
	var moduler = fs.readFileSync(path.join(process.env.PWD, "/.moduler"));
	try {
		moduler = JSON.parse(moduler);
	} catch (e) {
		moduler = {};
	}

	var modules = q.defer();

	if (!module.length) {
		var moduleList = [];

		var moduleSelector = select({
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

		var count = 0;
		for (var x in moduler) {
			count++;
			module.push(x);
			moduleSelector = moduleSelector.option(x);
		}

		moduleSelector.on("select", function (options) {
			for (var x in options) {
				module.push(options[x].value);
			}

			modules.resolve();
		});

		if (count > 1) {
			console.log("Select the modules you want to dump, use the up and down arrows to cycle through and left and right to mark and unmark each one.");
			moduleSelector.list();
			module = [];
		} else if (count == 1) modules.resolve();
	} else modules.resolve();

	modules.promise.then(function () {
		for (var x in module) {
			delete moduler[module[x]];
		}

		fs.writeFileSync(path.join(process.env.PWD, "/.moduler"), beautify(moduler, { type: "tab" }));
		process.exit(0);
	});
}

exports.arguments = function () {
	return " [-a --all] [module, [module, ...]];"
}

exports.describeArguments = function () {
	return ["[-a --all] IE: --all", "    If included, tells the system to dump all saved files", "    in the current directory",
			"[module, [module, ...]] IE: catalog home minify sass", "    This tells the system which specific modules to dump",
			"NOTE: If neither a module or all are included it will", "      allow you the opportunity to select from a list", "      of all stashed modules"];
}

exports.description = function () {
	return "This clears the file stash for selected modules"
}