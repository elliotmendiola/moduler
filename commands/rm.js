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
	return "This handles fully removing a module from a module project.";
}