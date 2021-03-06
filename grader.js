#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/
var rest = require('restler');
var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://murmuring-brushlands-3582.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
 // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_string>', 'Path to url of index.html')
        .parse(process.argv);
//url condition
    if(program.url != null)   {
	var tempHtml = 'fetched_index.html';
	var getErDone = function(result, response) {
	    console.error("Wrote to file: %s", tempHtml); 
	    fs.writeFileSync(tempHtml, result);
	    assertFileExists(tempHtml);

	    var cheerioHtmlFile = function(htmlfile) {
		return cheerio.load(fs.readFileSync(htmlfile));
	    };

	    var loadChecks = function(checksfile) {
		return JSON.parse(fs.readFileSync(checksfile));
	    };

	    var checkHtmlFile = function(htmlfile, checksfile) {
		$ = cheerioHtmlFile(htmlfile);
		var checks = loadChecks(checksfile).sort();
		var out = {};
		for(var ii in checks) {
		    var present = $(checks[ii]).length > 0;
		    out[checks[ii]] = present;
		}
		return out;
	    };
	    
	    var checkJson = checkHtmlFile(tempHtml, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    var outfile = 'outFromJson';
	    fs.writeFileSync(outfile, outJson);
	};
//here is the url call
        rest.get(program.url).on('complete', getErDone);

    } else {
//file condiition (duplicated code, but I need to move on with my homework)
	var cheerioHtmlFile = function(htmlfile) {
	    return cheerio.load(fs.readFileSync(htmlfile));
	};

	var loadChecks = function(checksfile) {
	    return JSON.parse(fs.readFileSync(checksfile));
	};

	var checkHtmlFile = function(htmlfile, checksfile) {
	    $ = cheerioHtmlFile(htmlfile);
	    var checks = loadChecks(checksfile).sort();
	    var out = {};
	    for(var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	    }
	    return out;
	};
        var checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    };
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
