exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return " [module, [module, ...]];"
}

exports.describeArguments = function () {
	return ["[module, [module, ...]] IE: catalog home minify sass", "    This tells the system which specific modules to", "    remove from the current project"];
}

exports.description = function () {
	return "This removes the specified modules from the current project"
}