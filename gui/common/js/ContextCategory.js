
function ContextCategory() {
    this._contextCategoryTable = {
        "driverid.*" : "Applications",
        "ecoenergy.*" : "Applications",
        "hdtrafficimage.*" : "Applications",
        "idm.*" : "Applications",
        "schedmaint.*" : "Applications",
        "system.Applications" : "Applications",
        "vdt.*" : "Applications",
        "warnguide.*" : "Applications",
        "contacts.*" : "Communication",
        "email.*" : "Communication",
        "mobile911.*" : "Communication",
        "phone.*" : "Communication",
        "sms.*" : "Communication",
        "system.Communication" : "Communication",
        "system.NotificationList" : "Communication",
        "system.NotificationListRetry" : "Communication",
        "system.NotifyDialog" : "Communication",
        "aharadio.*" : "Entertainment",
        "amradio.*" : "Entertainment",
        "auxin.*" : "Entertainment",
        "btaudio.*" : "Entertainment",
        "cd.*" : "Entertainment",
        "dvd.*" : "Entertainment",
        "fmradio.*" : "Entertainment",
        "pandora.*" : "Entertainment",
        "satradio.*" : "Entertainment",
        "stitcher.*" : "Entertainment",
        "system.Entertainment" : "Entertainment",
        "system.SourceReconnect" : "Entertainment",
        "system.SourceReconnectFailed" : "Entertainment",
        "tv.*" : "Entertainment",
        "usbaudio.*" : "Entertainment",
        "dab.*" : "Entertainment",
        "audiosettings.*" : "Settings",
        "backupparking.*" : "Other",
        "btpairing.*" : "Settings",
        "diag.*" : "Other",
        "emnavi.*" : "Navigation",
        "favorites.*" : "Favorites",
        "fmradio.TADialog" : "Other",
        "fmradio.TADialogAudio" : "Other",
        "netmgmt.*" : "Settings",
        "syssettings.*" : "Settings",
        "system.*" : "Other",
        "sysupdate.*" : "Settings",
        "tutorial.*" : "Other",
        "vehsettings.*" : "Settings",
        "syssettings.CommunicationSettings" : "Communication",              //The following contexts are "communication settings contexts"
        "syssettings.ContactsSortOrder" : "Communication",
        "syssettings.Mobile911" : "Communication",
        "syssettings.CommunicationSettingsReset" : "Communication",
        "syssettings.CommunicationSettingsResetProg" : "Communication",
        "syssettings.CommunicationSettingsResetError" : "Communication",
        "syssettings.PresetMessages" : "Communication",
        "syssettings.ComposeMessage" : "Communication",
    };  // end this._contextCategoryTable

    this._contextCategorySbIcons = {
        "Applications" : "IcnSbnApps.png",
        "Bluetooth" : "IcnSbnBt.png",
        "Communication" : "IcnSbnComm.png",
        "Entertainment" : "IcnSbnEnt.png",
        "Favorites" : "IcnSbnFavorite.png",
        "Maintenance" : "IcnSbnMaint.png",
        "Navigation" : "IcnSbnMap.png",
        "Settings" : "IcnSbnSettings.png",
        "Other" : ""
    };  // end this._contextCategorySbIcons
}

/*
 * Utility function to get the context category (domain) for a given application/context
 * @param uiaId   Application ID
 * @param ctxtId  Context ID
 * @returns Domain string value (e.g. "Applications", "Communication", "Entertainment", "Other")
 */
ContextCategory.prototype.getContextCategory = function(uiaId, ctxtId) {
    var category = "Other";
    
    if (uiaId && ctxtId) {
        // Look up the group
        category = this._contextCategoryTable[uiaId + "." + ctxtId];
        if (!category) {
            // Nothing found -- try again with uiaId + wildcard
            category = this._contextCategoryTable[uiaId + ".*"];
        }

        // Still nothing?
        if (!category) {
            // Conclude it's not anything we know about
            category = "Other";
        }
    }
    
    return category;
};

/*
 * Utility function to get the status bar icon for a given context category (domain)
 * @param domain  Domain string value (e.g. "Applications", "Communication", "Entertainment", "Other")
 * @returns Icon image file name, or null if none found
 */
ContextCategory.prototype.getContextCategorySbIcon = function(domain) {
    var iconFname = null;
    
    if (domain) {
        // Look up the icon path
        iconFname = this._contextCategorySbIcons[domain];
    }
    
    return iconFname;
};
