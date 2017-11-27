exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return " {-m --module moduleName};"
}

exports.describeArguments = function () {
	return ["{-m --module moduleName} IE: --module catalog", "    This tells the system which module you want to finalize"];
}

exports.description = function () {
	return "This adds files in the stack to the given module"
}