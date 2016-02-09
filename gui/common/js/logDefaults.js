//@author awoodhc
//@date v0.1 13-June-2012

/* An app's default log level is the lowest level log line it is allowed to report.
 * Log level priority is as follows (in order of highest to lowest)
 * 
 * fatal
 * error
 * warn
 * info
 * debug
 * 
 * i.e. setting "system" to "error" in this file will cause 
 * systemApp to only report "error" and "fatal" log lines
 */
var logDefaults = {
    "__global__": "debug", // global log gate must be turned down before any levels below will be checked
    
    //Apps ordered alpha-numeric by uiaId    
    "backupcam" : "debug",
    
    "contacts" : "debug",
    
    "emnavi" : "debug",
    
    "pandora" : "debug",
    "phone" : "debug",
    
    "screenrep" : "debug",
    "syssettings" : "debug",
    "system" : "debug",
    "radio" : "debug",
    
    "usbaudio" : "debug",
    
    //Other sources
    "framework" : "debug",
    "common" : "debug"

};
