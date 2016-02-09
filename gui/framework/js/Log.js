/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Filename: Log.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 06.13.2012
 __________________________________________________________________________

 Description: IHU GUI System App

 Revisions:
 v0.1 (13-June-2012)    Initial Setup of Log.js Created .debug, .info, .warn, .error, and .fatal
                        Log functions can accept multiple arguments after the required args, in the same fashion as console.log
                        log.fatal does not accept multiple arguments because Error takes only 1 string arg
 v0.2 (13-June-2012)    Added logDefaults.js file and functionality. setLogLevel, squelch, solo
 v0.3 (14-June-2012)    If no default is set, log level defaults to "info". Added restoreDefaultLevels
                        Moved all log line logic into _log function
 v0.4 (15-June-2012)    Log can now find line numbers/filenames using the Error Object. Removed these params from log calls
 v0.5 (19-June-2012)    Added this.addSrcFile() function to automate module names in log lines. _log, debug, info, etc no longer
                        take source as an argument
 v0.6 (3-Sept-2012)     Log lines are formatted for Serial console if guiConfig.pcLogging is false -aganesar
 v0.7 (24-Oct-2012)     Log now concats all arguments when PC Logging is false. Message arrays are now passed directly to _log
                        function for better performance. An Object will now display properly if it is the first arg in a log line.
 v0.8 (05-Dec-2012)     Fixed bug where any file name with a number would report its log line coming from "undefined"
 __________________________________________________________________________

 */

/*
 * =========================
 * Constructor
 * =========================
 * Log is used by all modules and applications in the Gui Framework to log debug messages. Log will send messages 
 * both to the browser's default console and to the lower layer console. This file differs from Debug.js in that
 * Debug.js is meant to handle all actions of the right-side debug panel present in the DOM.
 * Log.js will also eventually end up on the Target (Debug.js will not).
 */
function Log()
{
    //private constants
    
    this._FATAL     = 5; // (Number) numerical value to compare log levels
    this._ERROR     = 4; // (Number) numerical value to compare log levels
    this._WARN      = 3; // (Number) numerical value to compare log levels
    this._INFO      = 2; // (Number) numerical value to compare log levels
    this._DEBUG     = 1; // (Number) numerical value to compare log levels
    // IMPORTANT: log level constants must start at 1 (for lowest). If additional levels are added, do not start at 0.
    
    this._logLevels = null; // (Object) Used to store lowest log level each app is allowed to report
    this._moduleTable = new Object() // (Object) Stores fileName/moduleName pairs (see this.addSrcFile)
    this._fileLineNumberRegex = new RegExp('[a-z0-9_]+\.js:[0-9]+', 'gi'); // Regex to match filenames and line numbers from a stack
    
    // If logging in target hardware create an instance of JCILogger plugin
    if (!guiConfig.pcLogging)
    {
        if (window["JCILogger"])
        {
            this.jciLogger = new JCILogger(); // (Object) Used to store instance of JCILogger plugin when logging in target hardware
        }
        else
        {
            console.warn("PC logging is off, but JCILogger is not available. Consider turning PC logging back on.");
        }
    }

    // handle all errors which are not caught in try-catch
    window.onerror = function(msg, url, linenumber) {
        log.error('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
        return true;
    }

    // Initialize log levels to default values defined in logDefaults.js
    this.restoreDefaultLevels();
    
    //Note: this is the only file that must call this line in its constructor. Everywhere else this line
    //      should be in the global space, so that it is file specific, not Object specific
    this.addSrcFile("Log.js", "framework");
}

/*******************
 * Private Methods * 
 *******************/

/*
 * Checks if the source has permission to report this log level. If so, finds the 
 * fileName and lineNumber from the Error Object, then reports to the console.
 *
 * @tparam  Number  level       the numerical equivalent of the log level being called
 * @tparam  String  source      the uiaId of the app (or "framework" or "common") that the message came from
 * @tparam  Array  msgArray     An array of items to display in the log (array can be any combination of Object, Strings, etc)
 */
Log.prototype._log = function(level, msgArray)
{
    //checking for the __global__ log level and its existence
    if (this._logLevels["__global__"] && (level < this._logLevels['__global__']))
    {
        // log does not pass global "gate"
        return;
    }
    
    // get the line number of the call using the Error Object and some string trickery
    var stack = new Error().stack;
    var fileArr = stack.match(this._fileLineNumberRegex);
    var split = fileArr[2].split(":"); // because of the way log lines come through this file, we always want the 3rd array item
    var fileName = split[0];
    var lineNumber = split[1];
    
    var source = this._moduleTable[fileName];
    
    if (!source)
    {
        source = "undefined";
    }
    
    var permisLevel = this._DEBUG;
    
    // Note: permisLevel cannot be 0. Lowest level is 1.
    if (!permisLevel)
    {
        // Note: using console.warn here to avoid possible infinite loop
        console.warn("Log level not set for \"" + source + "\". Defaulting to info.");
        this._logLevels[source] = this._INFO;
        permisLevel = this._INFO;
    }
    
    // Check log permission level when PC logging.
    if (guiConfig.pcLogging && permisLevel > level)
    {
        return;
    }
    
    // _createPrefix needs the string version of the level
    var stringLevel;
    switch (level)
    {
        case this._FATAL:
            stringLevel = "FATAL";
            break;
        case this._ERROR:
            stringLevel = "ERROR";
            break;
        case this._WARN:
            stringLevel = "WARN";
            break;
        case this._INFO:
            stringLevel = "INFO"; 
            break;
        case this._DEBUG:
            stringLevel = "DEBUG";
            break;
        default:
            //do nothing
            break;
    }
    
    // _createPrefix will determine correct format for the message depending on guiConfig.pcLogging
    var prefix = this._createPrefix(stringLevel, source, fileName, lineNumber);
    var msg = null;
    
    if (guiConfig.pcLogging)
    {
        
        if (msgArray.length == 1 && typeof msgArray[0] == 'string')
        {
            // Only one string arg was sent, use direct function call for faster performance
            msg = prefix + ' ' + msgArray[0];
            
            switch(level)
            {
                case this._FATAL:
                    throw new Error(msg);
                    break;
                case this._ERROR:
                    console.error(msg);
                    break;
                case this._WARN:
                    console.warn(msg);
                    break;
                case this._INFO:
                    console.info(msg);
                    break;
                case this._DEBUG:
                    console.log(msg);
                    break;
                default:
                    // do nothing
                    break;
            }
        }
        else
        {
            if (typeof msgArray[0] == 'string')
            {
                // first arg is a string, so we can concat it to the prefix to get rid of the extra comma separator
                var extras = msgArray.slice(1);
                msg = [prefix + ' ' + msgArray[0]].concat(extras);
            }
            else
            {
                // create a new array from prefix and msgArray
                msg = [prefix].concat(msgArray);
            }
            
            // Call the appropriate console function
            switch(level)
            {
                case this._FATAL:
                    // The Native function 'Error' cannot take multiple args. Join the array into a string.
                    msg = msg.join(' ');
                    throw new Error(msg);
                    break;
                case this._ERROR:
                    console.error.apply(console, msg);
                    break;
                case this._WARN:
                    console.warn.apply(console, msg);
                    break;
                case this._INFO:
                    console.info.apply(console, msg);
                    break;
                case this._DEBUG:
                    console.log.apply(console, msg);
                    break;
                default:
                    // do nothing
                    break;
            }
        }       
    }
    else   
    {        
        // Logging in target hardware, use theJCILogger plugin for logging
        // Make sure to concat all arguments so the string is readable in the Serial log
        if (this.jciLogger)
        {
            // create a new array from prefix and msgArray
            msg = [prefix].concat(msgArray);

            // join all array elements into a single string with spaces between each element
            msg = msg.join(' ');
            
            this.jciLogger.JCILog(msg);
        }
    }
}

/*
 * Creates and returns a log message based on the passed parameters.
 * Time will be given in GMT ISO format
 * @tparam  String  level       "fatal", "warn", "debug", "info", or "error"
 * @tparam  String  source      the uiaId of the app (or "framework" or "common") that the message came from
 * @return  String  prefix      The prefix for the message to be printed to the log
 */
Log.prototype._createPrefix = function(level, source, sourceFile, sourceLine)
{
    if (!source)
    {
        // if the uiaId is undefined, set a string "undefined"
        source = 'undefinedSource';
    }
    var msg = new String();
    var date = new Date();
    var time = date.toISOString(); // (String)
    
    // Pull only the time portion of the ISO string
    time = time.slice(11, 23);
    
    // If the sourceLine is null, set it to a blank
    if (sourceLine != null)
    {
        sourceLine = '[' + sourceLine + ']';
    }
    else
    {
        sourceLine = "";
    }
    
    // create the message
    if (guiConfig.pcLogging)
    {
        msg = time + ' ' + level + ' ' + source + ' ' + sourceFile + sourceLine;
    }
    else
    {
        //TODO: Adding level, source file and line until JCILogger supports them natively. Remove later  
        msg = source + ' ' + level + ' ' +  sourceFile + sourceLine;        
    }
    
    return msg;
}

/*******************
 * Public Methods * 
 *******************/

/*
 * Logs a "debug" level message to the console.
 * Time will be given in GMT ISO format
 * @tparam  String  text        The descriptive message to display.
 * @tparam  Object  ...         Additional Object or Strings can be added to the text message
 */
Log.prototype.debug = function(text)
{
    // create a true array from extras
    var msgArray = Array.prototype.slice.call(arguments);

    this._log(this._DEBUG, msgArray);
}


/*
 * Logs a "info" level message to the console.
 * Time will be given in GMT ISO format
 * @tparam  String  text        The descriptive message to display.
 * @tparam  Object  ...         Additional Object or Strings can be added to the text message
 */
Log.prototype.info = function(text)
{
    // create a true array from extras
    var msgArray = Array.prototype.slice.call(arguments);

    this._log(this._INFO, msgArray);
}


/*
 * Logs a "warn" level message to the console.
 * Time will be given in GMT ISO format
 * @tparam  String  text        The descriptive message to display.
 * @tparam  Object  ...         Additional Object or Strings can be added to the text message
 */
Log.prototype.warn = function(text)
{
    // create a true array from extras
    var msgArray = Array.prototype.slice.call(arguments);

    this._log(this._WARN, msgArray);
}

/*
 * Logs a "error" level message to the console.
 * Time will be given in GMT ISO format
 * @tparam  String  text        The descriptive message to display.
 * @tparam  Object  ...         Additional Object or Strings can be added to the text message
 */
Log.prototype.error = function(text)
{
    // create a true array from extras
    var msgArray = Array.prototype.slice.call(arguments);

    this._log(this._ERROR, msgArray);
}


/*
 * Logs a "fatal" level message to the console.
 * Time will be given in GMT ISO format
 * @tparam  String  text        The descriptive message to display.
 * Note: This function cannot take multiple arguments.
 */
Log.prototype.fatal = function(text)
{
    // create a true array from extras
    var msgArray = Array.prototype.slice.call(arguments);

    this._log(this._FATAL, msgArray);
}

/*
 * The following methods can be called to modify log levels 
 */

/*
 * Dynamically sets the log level for the app (or other source). See logDefaults.js for more info.
 * @tparam  String  source  the uiaId of the app or name of the module to set a log level for
 * @tparam  String  level   One of "error", "warn", "debug", "info", or "fatal"
 */
Log.prototype.setLogLevel = function(source, level)
{
    switch(level)
    {
        case "fatal":
            this._logLevels[source] = this._FATAL;
            break;
        case "error":
            this._logLevels[source] = this._ERROR;
            break;
        case "warn":
            this._logLevels[source] = this._WARN;
            break;
        case "info":
            this._logLevels[source] = this._INFO;
            break;
        case "debug":
            this._logLevels[source] = this._DEBUG;
            break;
        default:
            this.warn("Cannot set log level to invalid value: " + this._logLevels[key]);
            return;
            break;
    }
}

/*
 * Squelches (or "mutes") all log lines from a source except fatal errors.
 * Calling this function is equivalent to log.setLogLevel(uiaId,”fatal”);
 * @tparam  String  source  The uiaId of the app or name of the module to squelch
 */
Log.prototype.squelch = function(source)
{
    this._logLevels[source] = this._FATAL;
}

/*
 * Squelches (or "mutes") all sources other than the supplied source.
 * Calling this function is equivalent to log.setLogLevel(uiaId,”fatal”);
 * @tparam  String  source  The uiaId of the app or name of the module to squelch
 */
Log.prototype.solo = function(source)
{
    for (var key in this._logLevels)
    {
        if (key != source)
        {
            this._logLevels[key] = this._FATAL;
        }
    }
}

/*
 * Sets all log level permissions back to the default values found in logDefaults.js
 */
Log.prototype.restoreDefaultLevels = function()
{
    // store a local var of logDefaults for quick access (see logDefaults.js)
    var defaults = logDefaults;
    this._logLevels = new Object();
    
    // Perform a deep object copy. We do not want to alter logDefaults
    // Convert string keys to numerical values that we can compare with >= or <=
    for (var key in defaults)
    {
        switch(defaults[key])
        {
            case "fatal":
                this._logLevels[key] = this._FATAL;
                break;
            case "error":
                this._logLevels[key] = this._ERROR;
                break;
            case "warn":
                this._logLevels[key] = this._WARN;
                break;
            case "info":
                this._logLevels[key] = this._INFO;
                break;
            case "debug":
                this._logLevels[key] = this._DEBUG;
                break;
            default:
                this.warn("Value \"" + this._logLevels[key] + "\" found in logDefaults file is not a valid at key: " + key);
                break;
        }
    }
}

/*
 * Adds an entry in Log's _moduleTable for the given fileName
 * This entry will be used to look up the module name when printing a log line
 * This function should be called in the global space, at the top of every file, before
 * any other calls to log are made.
 * @tparam  String  fileName    the name of the file to add an entry for
 * @tparam  String  sourceModule    the name of the module that the file belongs to (e.g. framework)
 */
Log.prototype.addSrcFile = function(fileName, sourceModule)
{
    this._moduleTable[fileName] = sourceModule;
}

/*
 * Formats and prints message and stack properties of a JavaScript Error object to the log using the ERROR log level.
 * @tparam Error err The Error object to write to the log.
 */
Log.prototype.writeError = function(err)
{
    if (err && err.message && err.stack)
    {
        this.error("Error.message: \"" + err.message + "\"");
        this.error("Error.stack:");
        var lines = err.stack.split('\n');
        for (var i = 0; i < lines.length; ++i)
        {
            this.error("  " + lines[i]);
        }
    }
}

// Global log object. This file needs to instantiate itself so that it is
// immediately accessable to other files that are loaded.
var log = new Log();
