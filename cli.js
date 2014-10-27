/*! chanarchive - v0.3.3 - 2014-10-27 */"use strict";function a(){f.useOriginalFileNames(d.o),f.setMaxThreads(d.threads),d.watch&&f.setWatch(1e3*d.interval),d.ext&&f.setExtensions(d.ext),f.on("parse",function(){console.log(" "+c.green(f.queue.length)+" new files to download")}),f.on("end",function(){console.log(" "+c.green("Download finished.")),g&&g.stop()}),f.on("file:error",function(a){console.log("file error"),console.log(a)}),f.on("file:end",function(a){a.existed?console.log(" %s skipped, %s already exists",c.green(a.url),c.green(a.fileName)):a.completed&&console.log(" %s saved as %s",c.green(a.url),c.green(a.fileName))}),f.on("error",function(a){console.log(" "+c.red("Error: "+a.message)),g&&g.stop()}),require("http").globalAgent.maxSockets=require("https").globalAgent.maxSockets=Math.max(d.threads,10),f.download()}var b=require("optimist"),c=require("chalk"),d,e,f,g,h=require("./lib/chanarchive"),i=require("./lib/chantypes"),j=require("./lib/proxy/chanproxy"),k=["","              _                                         _      _               ","             | |                                       | |    (_)              ","        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ ","       / ___)|  _ \\ (____ ||  _ \\ (____ | / ___) / ___)|  _ \\ | || | | || ___ |","      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \\ V / | ____|","       \\____)|_| |_|\\_____||_| |_|\\_____||_|     \\____)|_| |_||_|  \\_/  |_____)","                                                                                 ","                                                                Version : "+c.cyan(require("./package").version),""].join("\n");console.log(k),d=b.usage([""," "+c.green("Chan archiver"),""," Run in the directory where you want the archive to be downloaded.",""," Usage: chanarchive [OPTIONS] <URL>",""," Current supported urls are","","  4CHAN   :: http://boards.4chan.org/"+c.cyan("<BOARD>")+"/thread/"+c.cyan("<THREAD>"),"  7CHAN * :: http://7chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  8CHAN   :: https://8chan.co/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".html","  420CHAN :: http://boards.420chan.org/"+c.cyan("<BOARD>")+"/res/"+c.cyan("<THREAD>")+".php","","* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may","  break when the website decides to change the design. If you have problems, report them on my Github page:","  https://github.com/j3lte/chanarchive/issues"].join("\n")).boolean("o").alias("o","original-filenames").describe("o","write original filenames instead of the timestamp filenames (does not always work)").alias("e","ext").describe("e","only use the following extensions (seperated by slashes; eg: gif/jpeg/webm)").alias("w","watch").describe("w","watch for new files.").boolean("w").alias("i","interval").describe("i","watching interval in seconds.").default("i",10).alias("p","proxy").describe("p","when using local proxy (*see above) to parse, set port to listen serve local proxy").default("p",8088).alias("v","version").alias("t","threads").describe("t","Num of concurrent downloads.").default("t",10).describe("v","prints current version").argv,e=d._[0],d.version&&(console.error(require("./package").version),process.exit(0)),(1!==d._.length||0!==e.indexOf("http"))&&(console.log(b.help()),process.exit(0)),i.get(e,function(i){i?i.useProxy?(g=new j(i.useProxy),g.port=d.p,i.proxyPort=d.p,g.start(function(){f=new h(i,e),a()})):(f=new h(i,e),a()):(console.log(b.help()),console.log(c.red("\n\nUnsupported url")),process.exit())}),process.on("SIGINT",function(){return f.stop(),console.log("\nCTRL+C. Chan archiver exit."),process.exit()});