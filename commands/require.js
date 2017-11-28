exports.run = function (args) {
	console.log(args);
}

exports.arguments = function () {
	return "[npm module | -t local filepath | -t git [github username]/[github repo][@version]];"
}

exports.describeArguments = function () {
	return ["[npm module | -t local filepath | -t git [github username]/[github repo][@version]]", "    This will install the given repo/module/folder and ask you questions about requirements if any."];
}

exports.description = function () {
	return "This adds requirements to the current module project.  You may be asked a series of questions.";
}