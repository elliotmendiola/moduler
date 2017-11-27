#!/usr/bin/env node

function moduler () {
	var path = require("path");
	var command = path.join(__dirname, "../commands/", process.argv[2] + ".js");
	var fs = require("fs");
	var help = false;
	if (fs.existsSync(command)) {
		if (process.argv.indexOf("-h") > 2 || process.argv.indexOf("--help") > 2) {
			if (process.argv.indexOf("-h") > 2) process.argv.splice(process.argv.indexOf("-h"), 1);
			else process.argv.splice(process.argv.indexOf("--help"), 1);
			help = true;
		}

		if (!help) require(command).run(process.argv.slice(3));
		else {
			console.log("\n moduler " + process.argv[2] + require(command).arguments() + "\n    " + require(command).description() + "\n        " + require(command).describeArguments().join("\n        ") + "\n");
			process.exit(0);
		}
	} else {
		if (process.argv[2] != "-h" && process.argv[2] != "--help") {
			console.log("\nUnknown Moduler Command: " + process.argv[2]);
			console.log("Existing Commands:");
		} else {
			console.log("Moduler Commands:");
			help = true;
		}
		fs.readdir(path.join(command, "../"), function (err, items) {
			if (err) return console.error(err);
			for (var x in items) {
				console.log("    " + items[x].replace(/\.js/g, "") + require(path.join(command, "../", items[x])).arguments() + (help ? "\n        " + require(path.join(command, "../", items[x])).description() + "\n" : "") + ((x == items.length - 1 && !help) ? "\n" : ""));
			}

			process.exit(0);
		});
	}
}

moduler();