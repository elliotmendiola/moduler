exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return " [module, [module, ...]];"
}

exports.describeArguments = function () {
	return ["[module, [module, ...]] IE: catalog home minify@https://github.io/exampleUser/exampleProject@", "    This tells the system which specific modules to import"];
}

exports.description = function () {
	return "This imports the given module into the current project,\n        if the module is not available it will try to install it."
}