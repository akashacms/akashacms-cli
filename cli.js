#!/usr/bin/env node

/**
 *
 * Copyright 2012-2019 David Herron
 * 
 * This file is part of AkashaCMS (http://akashacms.com/).
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 **/

var util       = require('util');
var fs         = require('fs');
var path       = require('path');
var spawn      = require('child_process').spawn;
var exec       = require('child_process').exec;
var http       = require('http');
var program    = require('commander');
var request    = require('request');
var resolve    = require('resolve').sync;


var loadAkasha = function() {
    var fnakasha;
    if (process.env.AKASHAPATH) {
        fnakasha = process.env.AKASHAPATH;
    } else {
        try {
            fnakasha = resolve('akashacms', { basedir: process.cwd() });
        } catch (ex) {
            console.error("Could not find AkashaCMS because: "+ ex);
            console.error("");
            console.error("If you're seeing this message, akashacms hasn't been");
            console.error("installed locally.  You may need to type 'npm install'. ");
            console.error("");
            console.error("See http://akashacms.com for more help");
            process.exit();
        }
    }
    return require(fnakasha);
};

'use strict';

process.title = 'akashacms';

program
   .version('0.0.1')
//   .option('-C, --chdir <path>', 'change the working directory')
//   .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
//   .option('-T, --no-tests', 'ignore test hook')

program
    .command('init <dirName>')
    .description('initialize an AkashaCMS site')
    .action(function(dirName){
        /*var git = exec(
                'git clone git://github.com/robogeek/akashacms-example.git' + dirName,
                {env: process.env, stdio: 'inherit'},
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });*/
        var git = spawn('git',
              [ 'clone', 'git://github.com/akashacms/akashacms-example.git', dirName],
              {env: process.env, stdio: 'inherit'});
    });

program
    .command('skeleton <dirName>')
    .description('Download the skeleton AkashaCMS site')
    .action(function(dirName){
        /*var git = exec(
                'git clone git://github.com/robogeek/akashacms-example.git' + dirName,
                {env: process.env, stdio: 'inherit'},
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });*/
        var git = spawn('git',
              [ 'clone', 'git://github.com/akashacms/akashacms-skeleton.git', dirName],
              {env: process.env, stdio: 'inherit'});
    });

program
    .command('build')
    .description('build an AkashaCMS site in the current directory')
    .action(function() {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.process(function(err) {
            if (err) throw new Error(err);
        });
    });

program
    .command('render <fileName>')
    .description('render a file into the output directory')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
		akasha.gatherDir(config.root_docs, function(err, data) {
			if (err) throw err;
			else {
				akasha.renderFile(fileName, function(err) {
					if (err) throw err;
				});
			}
		});
    });

program
    .command('zip')
    .description('Create ZIP archive of rendered site')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.zipRenderedSite(function(err) {
            if (err) throw err;
        });
    });
	

program
    .command('ping')
    .description('Ping search engines for sitemap submission')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.pingXmlSitemap(function(err) {
            if (err) throw err;
        });
    });
	


program
    .command('oembed <url>')
    .description('fetch and display oEmbed data for a given URL')
    .action(function(url) {
        var akasha = loadAkasha();
        var config = require(path.join(process.cwd(), '/config.js'));
        akasha.config(config);
        akasha.oEmbedData(url, function(err, result) {
            if (err) throw err;
			else util.log(util.inspect(result));
        });
    });

program
    .command('metadata <fileName>')
    .description('Print the metadata for a document')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.readDocumentEntry(fileName, function(err, docEntry) {
        	if (err) {
        		util.log(err);
        	} else {
        		util.log(util.inspect(docEntry.frontmatter.yaml));
        	}
        });
        
    });

program
    .command('findtemplate <fileName>')
    .description('find a template')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.findTemplateAsync(fileName, function(err, info) {
        	if (err) util.log(err);
        	else util.log(util.inspect(info));
        });
    });

program
    .command('findpartial <fileName>')
    .description('find a partial')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.findPartialAsync(fileName, function(err, info) {
        	if (err) util.log(err);
        	else util.log(util.inspect(info));
        });
    });

program
    .command('finddocument <fileName>')
    .description('find a document')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.findDocumentAsync(fileName, function(err, info) {
        	if (err) util.log(err);
        	else util.log(util.inspect(info));
        });
    });

program
    .command('findasset <fileName>')
    .description('find an asset')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.findAssetAsync(fileName, function(err, info) {
        	if (err) util.log(err);
        	else util.log(util.inspect(info));
        });
    });

program
    .command('deploy')
    .description('Deploy the akashacms site using configuration file')
    // .option('-f, --force', 'force')
    .action(function(options) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        var logger = akasha.getLogger('deploy');
        if (config.deploy_ssh2sync) {
            var ssh2sync = require('ssh2sync');
            ssh2sync.upload(config.root_out,
                            config.deploy_ssh2sync.root_remote,
                            config.deploy_ssh2sync.force,
                            config.deploy_ssh2sync.auth);
        }
        else if (config.deploy_rsync) {
        	var rsync = akasha.deployViaRsync();
        	rsync.stdout.on('data', function(data) {
        		logger.info(data.toString());
        	});
        	rsync.stderr.on('data', function(data) {
        		logger.info('ERROR '+ data.toString());
        	});
        	rsync.on('close', function(code) {
        		logger.info('RSYNC FINISHED with code='+ code);
        	});
        } // else .. other kinds of deployment scenarios
    });
    
program
    .command('serve')
    .description('start the editing server')
    .action(function() {
        var akasha = loadAkasha();
        // var staticSrv  = require('node-static');
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
		akasha.gatherDir(config.root_docs, function(err, data) {
			if (err) {
				util.log('ERROR '+ err);
			} else {
			    akasha.runEditServer();
			}
		});
    });
    
program
    .command('preview')
    .description('simple preview of built site')
    .action(function() {
        var akasha = loadAkasha();
        // var staticSrv  = require('node-static');
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.runPreviewServer();
    });
    
program
    .command('fixup <fileName>')
    .description('Fix various unwanted characters')
    .action(function(fileName) {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        akasha.readDocumentEntry(fileName, function(err, entry) {
        	if (err) throw err;
        	else {        	
				var text = fs.readFileSync(entry.fullpath, "utf-8");
				fs.writeFileSync(entry.fullpath+'-new',
					text.replace('\320', '--'),
					"utf-8");
            }
        });
        
    });

program
	.command('indexChain <fileName>')
	.description("List the chain of index.html's for a file")
	.action(function(fileName) {
	
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
		akasha.gatherDir(config.root_docs, function(err, data) {
			if (err) {
				util.log('ERROR '+ err);
			} else {
        		var chain = akasha.indexChain(fileName);
        		util.log(util.inspect(chain));
        	}
        });
	});

program
    .command('listfiles')
    .description('List the files in this site')
    .action(function() {
	
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
		akasha.gatherDir(config.root_docs, function(err, data) {
			if (err) {
				util.log('ERROR '+ err);
			} else {
				akasha.eachDocument(function(entry) {
					util.log(entry.fullpath);
				});
			}
		});
    });
    
program
    .command('config')
    .description('Show configuration parameters of the current site')
    .action(function() {
        var akasha = loadAkasha();
        var config = require(path.join(__dirname, '/config.js'));
        akasha.config(config);
        
        console.log('dirname: '+ process.cwd());
        console.log('output directory: '+ config.root_out);
        console.log('');
        console.log('documents directories:');
        for (var i = 0; i < config.root_docs.length; i++) {
            console.log('\t'+ config.root_docs[i]);
        }
        console.log('');
        console.log('assets directories:');
        for (i = 0; i < config.root_assets.length; i++) {
            console.log('\t'+ config.root_assets[i]);
        }
        console.log('');
        console.log('partials directories:');
        for (i = 0; i < config.root_partials.length; i++) {
            console.log('\t'+ config.root_partials[i]);
        }
        console.log('');
        console.log('layouts directories:');
        for (i = 0; i < config.root_layouts.length; i++) {
            console.log('\t'+ config.root_layouts[i]);
        }
        console.log('');
        console.log('plugins:');
        for (i = 0; i < config.plugins.length; i++) {
            console.log('\t'+ config.plugins[i].name);
        }
        console.log('');
        console.log('data: '+ util.inspect(config.data));
    });

// program
//    .command('*')
//    .description('deploy the given env')
//    .action(function(env){
//        console.log('deploying "%s"', env);
//    });

program.parse(process.argv);
