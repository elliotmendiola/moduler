# Moduler

### WORK IN PROGRESS: Still need to implement import, rm, uninstall

Moduler makes it simple to import modules into your project, turning multiple day projects into a few hours of work.  Additionally it makes creating new modules simple and easy to share.

## Getting Started

```
npm install -g node-moduler
```

### Installing modules

```
moduler install [npm package]|-t local [folder path]|-t git [github user]/[github repo]#[branch]
```

### Importing modules

```
moduler import [example]
```

Some modules require additional information, and may ask you questions that must be answered in order to properly import the module

```

  moduler import catalog
  Stored values: 3
  
  What is the name of value 1? id
  What is the type of value 1?
   >  String
      Number
      Date
  
  
  What is the name of value 2? name
  What is the type of value 2?
   >  String
      Number
      Date
  
  
  What is the name of value 3? created
  What is the type of value 3?
      String
      Number
   >  Date

```

After all questions are answered the installed files will be imported into your working directory.  Some modules may be imported multiple times, if the files are all contained in a variable folder name.  If the imported modules require other modules they will automatically be installed and imported, and any questions necessary for installation not answered by the requirements will also be asked of you.

The files aren't specific to any one framework or file structure, that is up to the modules themselves.

## Creating Modules

Modules can be installed in bulk or one at a time.  Using our moduler init tool you can create a single project for multiple modules, and even import existing code from other projects.

## Built With

* [download-git-repo](https://github.com/flipxfx/download-git-repo) - used to simplify downloading github repos for installation
* [glob](https://github.com/isaacs/node-glob) - used to allow globs in moduler add.
* [json-format](https://github.com/luizstacio/json-format) - used to confirm proper formatting on package.json when modifying it.
* [q](https://github.com/kriskowal/q) - promise library.
* [select-shell](https://github.com/luizstacio/select-shell) - used to simplify the multiple select/select process for the CLI.
* [cli-spinner](https://www.npmjs.com/package/cli-spinner) - used to easily create loaders/spinners on the console
* [download-npm-package](https://www.npmjs.com/package/download-npm-package) - used to simplify downloading npm modules into specific directories
* [untildify](https://www.npmjs.com/package/untildify) - used to convert ~ into the proper file path for linux users

## Author

Elliot Mendiola  [email](elliotmendiola@gmail.com) [elliot.codes](https://www.elliot.codes) (in progress)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details