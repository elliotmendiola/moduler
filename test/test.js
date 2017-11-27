var Moduler = require("../lib/index.js");
var beautify = require("json-format");

var boolean = new Moduler ().boolean("Boolean", "\nThis is a yes or no question.").finish()

new Moduler ()
	//Text takes a key, the console description, and a function to handle skipping, just like ALL other types
	.text("text", "\nThis is a text test.", function () {
		var runTextTest = (Math.floor(Math.random() * 1000) % 2) == 1;
		if (!runTextTest) console.log("SKIPPING TEXT TEST");
		return runTextTest;
	})
	//Number takes the default arguments and a min/max
	.number("number", "\nThis is a number test.", function (result) {
		return !result.text
	})
	//Select takes the default arguments and a set of options, lets the user choose 1 of the given options
	.select("select", "\nThis is a select test.", false, ["option 1", "option 2", "option 3"])
	//Multiple takes the default arguments and a set of options, lets the user choose as many of the options as they want
	.multiple("multiple", "\nThis is a multiple select test.", false, ["option 1", "option 2", "option 3"])
	//Repeat takes the normal arguments, a count or text value (asking if the user would like to add another), and a moduler instance to ask a set of repeated questions
	.repeat("repeat", "\nThis is a repeat test", false, 3, boolean)
	//Finish can take only a function that returns true or false after taking a snapshot of the current responses
	.finish()
	//Run tells the questions to run, this must be called once
	.run()
	//Then applies the arguments passed to a promise contained in the class instance
	.then(function (result) {
		console.log("\nResult:\n", beautify(result, { type: "space" }));
		process.exit(0);
	}, function (err) {
		console.error("\nError: ", err);
		process.exit(1);
	})
	//Catch applies the arguments passed to a promise contained in the class instance
	.catch(function (err) {
		console.error("\nError: ", err);
		process.exit(1);
	});