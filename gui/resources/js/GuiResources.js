/*
 Copyright 2013 by Johnson Controls
 __________________________________________________________________________

 Filename: GuiResources.js
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: awoodhc
 Date: 09.20.2013
 __________________________________________________________________________

 Description: Manifest file which lists the App Dictionaries managed by
 GUI RESOURCES component.
 __________________________________________________________________________

 */

/*
 * Constructor
 */
function GuiResources()
{

}

/*
 * List of dictionary files managed in the GUI_RESOURCES Component.
 * Any Application whose dictionaries are managed by GUI_RESOURCES should
 * be added to this list.
 */
GuiResources.prototype.DICTIONARY_LIST = {
    "aharadio" : true,
    "amradio" : true,
    "audiosettings" : true,
    "auxin" : true,
    "backupparking" : true,
    "btaudio" : true,
    "btpairing" : true,
    "cd" : true,
    "common" : true,
    "contacts" : true,
    "dab": true,
    "diag" : true,
    "driverid" : true,
    "dvd" : true,
    "ecoenergy" : true,
    "email" : true,
    "emnavi" : true,
    "favorites" : true,
    "fmradio" : true,
    "hdtrafficimage" : true,
    "idm" : true,
    "mobile911" : true,
    "netmgmt": true,
    "pandora": true,
    "phone": true,
    "satradio": true,
    "schedmaint": true,
    "sms": true,
    "stitcher": true,
    "syssettings": true,
    "system": true,
    "sysupdate": true,
    "tutorial": true,
    "tv": true,
    "usbaudio": true,
    "vdt": true,
    "vehsettings": true,
    "warnguide": true,
    "carplay": true,
    "screenrep": false,
    "siri": true,
    "xmdata": true,
    "xmaudio": true
};

// Global object. This file needs to instantiate itself so that it is
// immediately accessable to other files that are loaded.
guiResources = new GuiResources();