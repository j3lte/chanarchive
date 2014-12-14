/*
 ----- chanarchive - version 0.3.5 -----
Last build date : 2014-12-14
Source : https://github.com/j3lte/chanarchive
*/
"use strict";function a(a){a.useOriginalFileNames(f.o),a.setMaxThreads(f.threads),f.watch&&a.setWatch(1e3*f.interval),f.ext&&a.setExtensions(f.ext),a.on("parse",function(){console.log(" ["+c.cyan(a.name)+"] "+c.green(a.queue.length)+" new files to download")}),a.on("end",function(){console.log(" ["+c.cyan(a.name)+"] %s",c.green(" Download finished for: "+a.url)),h&&h.stop();var b=d.findIndex(j,function(b){return b.name===a.name});b>=0&&j.splice(b,1)}),a.on("file:error",function(b){console.log(c.red(" ["+c.cyan(a.name)+"] File error")),console.log(b)}),f.debug&&(a.on("file:start",function(b){console.log(" ["+c.cyan(a.name)+"] File start : %s, size: %s bytes",c.green(b.url),c.green(b.size))}),a.on("file:check",function(b){console.log(" ["+c.cyan(a.name)+"] File check : %s, md5: %s",c.green(b.fileName),c.green(b.md5sum))})),a.on("file:end",function(b){b.existed?console.log(" ["+c.cyan(a.name)+"] File : %s skipped, %s already exists",c.green(b.url),c.green(b.fileName)):b.completed&&console.log(" ["+c.cyan(a.name)+"] File : %s saved as %s",c.green(b.url),c.green(b.fileName)),f.debug&&console.log(" ["+c.cyan(a.name)+"] Queue/Current/Finished: %s/%s/%s",c.green(a.queue.length),c.green(a.a),c.green(a.fin.length))}),a.on("error",function(b){console.log(" ["+c.cyan(a.name)+"] "+c.red(" Error: "+b.message)),h&&h.stop()}),require("http").globalAgent.maxSockets=require("https").globalAgent.maxSockets=Math.max(f.threads,10),a.download()}var b=require("optimist"),c=require("chalk"),d=require("lodash"),e=require("path").resolve("./")+"/",f,g,h,i=0,j=[],k=require("./lib/chanarchive"),l=require("./lib/chantypes"),m=require("./lib/proxy/chanproxy"),n=["","              _                                         _      _               ","             | |                                       | |    (_)              ","        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ ","       / ___)|  _ \\ (____ ||  _ \\ (____ | / ___) / ___)|  _ \\ | || | | || ___ |","      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \\ V / | ____|","       \\____)|_| |_|\\_____||_| |_|\\_____||_|     \\____)|_| |_||_|  \\_/  |_____)","                                                                                 ","                                                                Version : "+c.cyan(require("./package").version),"                                                                By      : "+c.cyan("@j3lte"),""].join("\n");console.log(n),f=b.usage([""," "+c.green("Chan archiver"),""," Run in the directory where you want the archive to be downloaded.",""," Usage: "+c.bold.cyan("chanarchive [OPTIONS] <URL> [<URL2> <URL3> ... ]"),""," Current supported urls are","","  4CHAN   :: http://boards.4chan.org/"+c.cyan("<BOARD>")+"/thread/"+c.cyan("<THREAD>"),"  7CHAN * :: http://7chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  8CHAN   :: https://8chan.co/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  420CHAN :: http://boards.420chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".php","","* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may","  break when the website decides to change the design.",""," If you experience issues, report them here: "+c.green("https://github.com/j3lte/chanarchive/issues")].join("\n"))["boolean"]("o").alias("o","original-filenames").describe("o","write original filenames instead of the timestamp filenames (does not always work)").alias("e","ext").describe("e","only use the following extensions (seperated by slashes; eg: gif/jpeg/webm)").alias("w","watch").describe("w","watch for new files.")["boolean"]("w").alias("i","interval").describe("i","watching interval in seconds.")["default"]("i",10).alias("p","proxy").describe("p","when using local proxy (*see above) to parse, set port to listen serve local proxy")["default"]("p",8088).alias("t","threads").describe("t","Num of concurrent downloads (max 10).")["default"]("t",10).alias("d","debug").describe("d","Verbose debug output")["boolean"]("d").alias("v","version").describe("v","prints current version").argv,g=f._,f.version&&(console.error(require("./package").version),process.exit(0)),0===f._.length&&(console.log(b.help()),process.exit(0)),f.debug&&console.log("Using current folder to save: "+e+"\n"),d.forEach(g,function(b){0!==b.indexOf("http")?console.log(c.red("\n\nUnsupported url : "+b)):l.get(b,function(d){if(d)if(d.useProxy&&void 0===h)h=new m(d.useProxy),h.port=f.p,d.proxyPort=f.p,h.start(function(){var c=new k({chan:d,url:b,folder:e});j.push(c),a(c)});else{var g=new k({chan:d,url:b,folder:e});j.push(g),a(g)}else console.log(c.red("\n\nUnsupported url : "+b))})}),process.on("SIGINT",function(){return d.each(j,function(a){a.stop()}),h&&h.stop(),console.log("\nCTRL+C. Chan archiver exit."),process.exit()});