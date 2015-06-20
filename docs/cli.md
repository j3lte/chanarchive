## Output chanarchive

```

              _                                         _      _               
             | |                                       | |    (_)              
        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ 
       / ___)|  _ \ (____ ||  _ \ (____ | / ___) / ___)|  _ \ | || | | || ___ |
      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \ V / | ____|
       \____)|_| |_|\_____||_| |_|\_____||_|     \____)|_| |_||_|  \_/  |_____)
                                                                                 
                                                                Version : 0.4.3
                                                                By      : @j3lte


 Chan archiver : imageboard downloader

 Run in the directory where you want the archive to be downloaded.

 Usage : chanarchive [OPTIONS] <URL> [<URL2> <URL3> ... ]

 > You can also use a shortcode instead of url: chan/board/thread
 > E.g.: chanarchive 8chan/b/9000

 Current supported imageboard urls are

  4CHAN   :: http://boards.4chan.org/<BOARD>/thread/<THREAD>
  7CHAN*  :: http://7chan.org/<BOARD>/res/<THREAD>.html
  8CHAN   :: https://8ch.net/<BOARD>/res/<THREAD>.html
  420CHAN :: http://boards.420chan.org/<BOARD>/res/<THREAD>.php

* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may
  break when the website decides to change the design.

 If you experience issues, report them here: https://github.com/j3lte/chanarchive/issues

Options:
  -o, --original-filenames  Write original filenames instead of the timestamp filenames (does not always work)
  -e, --ext                 Only use the following extensions (seperated by slashes; eg: gif/jpeg/webm)       
  -w, --watch               Watch for new files.                                                              
  -i, --interval            Watching interval in seconds.                                                       [default: 10]
  -p, --proxy               When using local proxy (*see above) to parse, set port to listen serve local proxy  [default: 8088]
  -t, --threads             Num of concurrent downloads (max 10).                                               [default: 10]
  -d, --debug               Verbose debug output                                                              
  -h, --help                Shows this help screen                                                            
  -u, --update              Checks if there is an update for chanarchive                                      

```
