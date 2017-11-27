exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return " [module, [module, ...]];"
}

exports.describeArguments = function () {
	return ["[module, [module, ...]] IE: catalog home minify sass", "    This tells the system which specific modules to uninstall"];
}

exports.description = function () {
	return "This uninstalls the specified modules";
}