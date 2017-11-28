exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return ";"
}

exports.describeArguments = function () {
	return [];
}

exports.description = function () {
	return "This walks you through the process of adding a new module to the current module project (IE: similar to moduler init)";
}