/*
 * This file is used to give GUI a hook into developer_mode.sh on the Target hardware.
 * developer_mode_GuiConfig.js normally NOT read by the GUI. It is only read by index.html 
 * if it exists in a specfic location on the file system. 
 * Therefore any function calls made here will ONLY take effect if the file is copied to the right
 * location by developer_mode.sh
 */
guiConfig._setDeveloperMode(true);
