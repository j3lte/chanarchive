/*! chanarchive - v0.3.4 - 2014-12-14 */"use strict";function a(){g.useOriginalFileNames(e.o),g.setMaxThreads(e.threads),e.watch&&g.setWatch(1e3*e.interval),e.ext&&g.setExtensions(e.ext),g.on("parse",function(){console.log(" "+c.green(g.queue.length)+" new files to download")}),g.on("end",function(){console.log(" %s",c.green("Download finished.")),h&&h.stop()}),g.on("file:error",function(a){console.log(c.red(" File error")),console.log(a)}),e.debug&&(g.on("file:start",function(a){console.log(" File start : %s, size: %s bytes",c.green(a.url),c.green(a.size))}),g.on("file:check",function(a){console.log(" File check : %s, md5: %s",c.green(a.fileName),c.green(a.md5sum))})),g.on("file:end",function(a){a.existed?console.log(" File : %s skipped, %s already exists",c.green(a.url),c.green(a.fileName)):a.completed&&console.log(" File : %s saved as %s",c.green(a.url),c.green(a.fileName)),e.debug&&console.log(" Queue/Current/Finished: %s/%s/%s",c.green(g.queue.length),c.green(g.a),c.green(g.fin.length))}),g.on("error",function(a){console.log(" "+c.red("Error: "+a.message)),h&&h.stop()}),require("http").globalAgent.maxSockets=require("https").globalAgent.maxSockets=Math.max(e.threads,10),g.download()}var b=require("optimist"),c=require("chalk"),d=require("path").resolve("./")+"/",e,f,g,h,i=require("./lib/chanarchive"),j=require("./lib/chantypes"),k=require("./lib/proxy/chanproxy"),l=["","              _                                         _      _               ","             | |                                       | |    (_)              ","        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ ","       / ___)|  _ \\ (____ ||  _ \\ (____ | / ___) / ___)|  _ \\ | || | | || ___ |","      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \\ V / | ____|","       \\____)|_| |_|\\_____||_| |_|\\_____||_|     \\____)|_| |_||_|  \\_/  |_____)","                                                                                 ","                                                                Version : "+c.cyan(require("./package").version),""].join("\n");console.log(l),e=b.usage([""," "+c.green("Chan archiver"),""," Run in the directory where you want the archive to be downloaded.",""," Usage: chanarchive [OPTIONS] <URL>",""," Current supported urls are","","  4CHAN   :: http://boards.4chan.org/"+c.cyan("<BOARD>")+"/thread/"+c.cyan("<THREAD>"),"  7CHAN * :: http://7chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  8CHAN   :: https://8chan.co/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  420CHAN :: http://boards.420chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".php","","* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may","  break when the website decides to change the design. If you have problems, report them on my Github page:","  https://github.com/j3lte/chanarchive/issues"].join("\n"))["boolean"]("o").alias("o","original-filenames").describe("o","write original filenames instead of the timestamp filenames (does not always work)").alias("e","ext").describe("e","only use the following extensions (seperated by slashes; eg: gif/jpeg/webm)").alias("w","watch").describe("w","watch for new files.")["boolean"]("w").alias("i","interval").describe("i","watching interval in seconds.")["default"]("i",10).alias("p","proxy").describe("p","when using local proxy (*see above) to parse, set port to listen serve local proxy")["default"]("p",8088).alias("t","threads").describe("t","Num of concurrent downloads.")["default"]("t",10).alias("d","debug").describe("d","Output verbose debug output")["boolean"]("d").alias("v","version").describe("v","prints current version").argv,f=e._[0],e.version&&(console.error(require("./package").version),process.exit(0)),(1!==e._.length||0!==f.indexOf("http"))&&(console.log(b.help()),process.exit(0)),e.debug&&console.log("Using current folder to save: "+d+"\n"),j.get(f,function(j){j?j.useProxy?(h=new k(j.useProxy),h.port=e.p,j.proxyPort=e.p,h.start(function(){g=new i(j,f,d),a()})):(g=new i(j,f,d),a()):(console.log(b.help()),console.log(c.red("\n\nUnsupported url")),process.exit())}),process.on("SIGINT",function(){return g.stop(),console.log("\nCTRL+C. Chan archiver exit."),process.exit()});