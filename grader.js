#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes. Use commander.js and cheerio. Teaches command line application development and basic DOM parsing.

References:

 + cheerio
   - htps://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
 + restler
   - https://github.com/danwrong/restler
*/


var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile){
  var instr = infile.toString();
  if(!fs.existsSync(instr)){
      console.log("%s does not exist. Exiting.", instr);
      process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;

};

var isUrlExist = function(val){
  if(val instanceof Error){
    console.log('Url does not exist. Exiting.');
      process.exit(1);
  }
};

var assertUrlExists = function(val){
    var url = val.toString();
//    rest.get(url).on('complete',isUrlExist);

//    rest.get(url).on('complete',function(result){
//    if(result instanceof Error){
//	  console.log('%s does not exist. Exiting.', url);
//        process.exit(1);
//      }
//   });
    return url;
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};


var checkUrlFile = function(content, checksfile){
    $ = cheerio.load(content);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
        var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn){
    // Workaround for commander.js issue
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module){
    program
     .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists),CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists),HTMLFILE_DEFAULT)
    .option('-u, --url <url-path>', 'Url to index.html', clone(assertUrlExists))
    .parse(process.argv);

    if(!program.url){
      var checkJson = checkHtmlFile(program.file, program.checks);
      var outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    }

    else{
      rest.get(program.url).on('complete',function(result){
	  var checkJson = checkUrlFile(result, program.checks);
	  var outJson = JSON.stringify(checkJson, null, 4);
	  console.log(outJson);
      });
    }
}
else{
    exports.checkHtmlFile = checkHtmlFile;
}
