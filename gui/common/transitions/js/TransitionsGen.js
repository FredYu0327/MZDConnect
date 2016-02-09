// GENERATED CODE -- DO NOT EDIT!

log.addSrcFile("TransitionsGen.js", "common");
//log.addSrcFile("TransitionsGen.js", "TransitionsGen");
//log.setLogLevel("TransitionsGen", "debug");

function TransitionsGen(mgrObj) {
    if (utility.toType(mgrObj) !== "object")
    {
        log.warn("TransitionsGen constructor called without manager object argument!");
    }

    // Save the manager object (hand-maintained code) for later calls
    this._mgrObj = mgrObj;

    // Initialize caller data saved for callbacks
    this._prevTemplate = null;
    this._currTemplate = null;
    this._commonTransitionData = null;

    this._TEMPLATE_CATEGORIES_TABLE = {
        "ClockSettings2Tmplt" : "Detail with UMP",
        "Dialog3Tmplt" : "Dialog",
        "InCall2Tmplt" : "Detail with UMP",
        "KeyboardTmplt" : "Keyboard",
        "Messaging2Tmplt" : "Detail with UMP",
        "ScrollDetailTmplt" : "Detail with Back",
        "Tuner4Tmplt" : "Tuner",
        "TestTmplt" : "Diagnostics",
        "EcoFlowTmplt" : "Detail with UMP",
        "EcoStatusTmplt" : "Detail with UMP",
        "FuelConsumptionTmplt" : "Detail with UMP",
        "EmNaviTmplt" : "Navigation",
        "EmNaviBlackTmplt" : "NaviBlack",
        "CompassTmplt" : "Detail with Back",
        "CoordinatesTmplt" : "Detail with Back",
        "TrafficTmplt" : "Detail with Back",
        "MainMenuTmplt" : "Home",
        "OffScreenTmplt" : "Display Off",
        "dvdMenuTmplt" : "DVD / TV",
    };  // end this._TEMPLATE_CATEGORIES_TABLE

    this._TRANSITION_TABLE = {
        "Backup / Parking.Backup / Parking" : "FastCrossfade",
        "Backup / Parking.DVD / TV" : "FastCrossfade",
        "Backup / Parking.DVD / TV Screen Settings" : "FastCrossfade",
        "Backup / Parking.Detail with Back" : "FastCrossfade",
        "Backup / Parking.Detail with UMP" : "FastCrossfade",
        "Backup / Parking.Diagnostics" : "Crossfade",
        "Backup / Parking.DialPad" : "FastCrossfade",
        "Backup / Parking.Dialog" : "FastCrossfade",
        "Backup / Parking.Display Off" : "FastCrossfade",
        "Backup / Parking.Gap2 Ending" : "FastCrossfade",
        "Backup / Parking.Home" : "FastCrossfade",
        "Backup / Parking.Keyboard" : "FastCrossfade",
        "Backup / Parking.List" : "FastCrossfade",
        "Backup / Parking.NaviBlack" : "FastCrossfade",
        "Backup / Parking.Navigation" : "NA",
        "Backup / Parking.Startup / Ending" : "FastCrossfade",
        "Backup / Parking.Tabbed List" : "FastCrossfade",
        "Backup / Parking.Tuner" : "FastCrossfade",
        "DVD / TV Screen Settings.Backup / Parking" : "FastCrossfade",
        "DVD / TV Screen Settings.DVD / TV" : "SB Slide + Crossfade + UMP Arrive",
        "DVD / TV Screen Settings.DVD / TV Screen Settings" : "NA",
        "DVD / TV Screen Settings.Detail with Back" : "Crossfade + Back Arrive",
        "DVD / TV Screen Settings.Detail with UMP" : "Crossfade + UMP Arrive",
        "DVD / TV Screen Settings.Diagnostics" : "Snap",
        "DVD / TV Screen Settings.DialPad" : "Crossfade + Back Arrive",
        "DVD / TV Screen Settings.Dialog" : "Crossfade",
        "DVD / TV Screen Settings.Display Off" : "Crossfade",
        "DVD / TV Screen Settings.Gap2 Ending" : "Crossfade",
        "DVD / TV Screen Settings.Home" : "Crossfade",
        "DVD / TV Screen Settings.Keyboard" : "Crossfade",
        "DVD / TV Screen Settings.List" : "Crossfade + Back Arrive",
        "DVD / TV Screen Settings.NaviBlack" : "Crossfade",
        "DVD / TV Screen Settings.Navigation" : "NA",
        "DVD / TV Screen Settings.Startup / Ending" : "Crossfade",
        "DVD / TV Screen Settings.Tabbed List" : "Crossfade + Back Arrive",
        "DVD / TV Screen Settings.Tuner" : "Crossfade",
        "DVD / TV.Backup / Parking" : "UMP Depart + Crossfade",
        "DVD / TV.DVD / TV" : "UMP Depart + SB Slide + Crossfade + UMP Arrive",
        "DVD / TV.DVD / TV Screen Settings" : "Snap",
        "DVD / TV.Detail with Back" : "UMP Depart + Crossfade",
        "DVD / TV.Detail with UMP" : "UMP Depart + Crossfade + UMP Arrive",
        "DVD / TV.Diagnostics" : "Snap",
        "DVD / TV.DialPad" : "UMP Depart + Crossfade + Back Arrive",
        "DVD / TV.Dialog" : "Crossfade",
        "DVD / TV.Display Off" : "UMP Depart + Crossfade",
        "DVD / TV.Gap2 Ending" : "Crossfade",
        "DVD / TV.Home" : "Crossfade",
        "DVD / TV.Keyboard" : "UMP Depart + Crossfade",
        "DVD / TV.List" : "UMP Depart + Crossfade + Back Arrive",
        "DVD / TV.NaviBlack" : "Crossfade",
        "DVD / TV.Navigation" : "NA",
        "DVD / TV.Startup / Ending" : "Crossfade",
        "DVD / TV.Tabbed List" : "UMP Depart + Crossfade + Back Arrive",
        "DVD / TV.Tuner" : "UMP Depart + Crossfade",
        "Detail with Back.Backup / Parking" : "FastCrossfade",
        "Detail with Back.DVD / TV" : "Back Depart + SB Slide + Crossfade + UMP Arrive",
        "Detail with Back.DVD / TV Screen Settings" : "Back Depart + SB Slide + Crossfade",
        "Detail with Back.Detail with Back" : "Crossfade",
        "Detail with Back.Detail with UMP" : "Back Depart + Crossfade + UMP Arrive",
        "Detail with Back.Diagnostics" : "Snap",
        "Detail with Back.DialPad" : "Crossfade",
        "Detail with Back.Dialog" : "Fadeover",
        "Detail with Back.Display Off" : "Back Depart + Crossfade",
        "Detail with Back.Gap2 Ending" : "Crossfade",
        "Detail with Back.Home" : "Back Depart + Crossfade",
        "Detail with Back.Keyboard" : "Back Depart + Crossfade",
        "Detail with Back.List" : "Crossfade",
        "Detail with Back.NaviBlack" : "Back Depart + Crossfade",
        "Detail with Back.Navigation" : "NA",
        "Detail with Back.Startup / Ending" : "Crossfade",
        "Detail with Back.Tabbed List" : "Crossfade",
        "Detail with Back.Tuner" : "Back Depart + Crossfade",
        "Detail with UMP.Backup / Parking" : "FastCrossfade",
        "Detail with UMP.DVD / TV" : "UMP Depart + SB Slide + Crossfade + UMP Arrive",
        "Detail with UMP.DVD / TV Screen Settings" : "UMP Depart + SB Slide + Crossfade",
        "Detail with UMP.Detail with Back" : "UMP Depart + Crossfade",
        "Detail with UMP.Detail with UMP" : "UMP Depart + Crossfade + UMP Arrive OR Snap",
        "Detail with UMP.Diagnostics" : "Snap",
        "Detail with UMP.DialPad" : "UMP Depart + Crossfade + Back Arrive",
        "Detail with UMP.Dialog" : "Fadeover",
        "Detail with UMP.Display Off" : "UMP Depart + Crossfade",
        "Detail with UMP.Gap2 Ending" : "Crossfade",
        "Detail with UMP.Home" : "UMP Depart + Crossfade",
        "Detail with UMP.Keyboard" : "UMP Depart + Crossfade",
        "Detail with UMP.List" : "UMP Depart + Crossfade + Back Arrive",
        "Detail with UMP.NaviBlack" : "UMP Depart + Crossfade",
        "Detail with UMP.Navigation" : "NA",
        "Detail with UMP.Startup / Ending" : "Crossfade",
        "Detail with UMP.Tabbed List" : "UMP Depart + Crossfade + Back Arrive",
        "Detail with UMP.Tuner" : "UMP Depart + Crossfade",
        "Diagnostics.Backup / Parking" : "FastCrossfade",
        "Diagnostics.DVD / TV" : "Snap",
        "Diagnostics.DVD / TV Screen Settings" : "Snap",
        "Diagnostics.Detail with Back" : "Snap",
        "Diagnostics.Detail with UMP" : "Snap",
        "Diagnostics.Diagnostics" : "NA",
        "Diagnostics.DialPad" : "Snap",
        "Diagnostics.Dialog" : "Snap",
        "Diagnostics.Display Off" : "Snap",
        "Diagnostics.Gap2 Ending" : "Snap",
        "Diagnostics.Home" : "Snap",
        "Diagnostics.Keyboard" : "Snap",
        "Diagnostics.List" : "Snap",
        "Diagnostics.NaviBlack" : "Crossfade",
        "Diagnostics.Navigation" : "NA",
        "Diagnostics.Startup / Ending" : "Snap",
        "Diagnostics.Tabbed List" : "Snap",
        "Diagnostics.Tuner" : "Snap",
        "DialPad.Backup / Parking" : "FastCrossfade",
        "DialPad.DVD / TV" : "Back Depart + SB Slide + Crossfade + UMP Arrive",
        "DialPad.DVD / TV Screen Settings" : "Back Depart + SB Slide + Crossfade",
        "DialPad.Detail with Back" : "Crossfade",
        "DialPad.Detail with UMP" : "Back Depart + Crossfade + UMP Arrive",
        "DialPad.Diagnostics" : "Snap",
        "DialPad.DialPad" : "NA",
        "DialPad.Dialog" : "Fadeover",
        "DialPad.Display Off" : "Back Depart + Crossfade",
        "DialPad.Gap2 Ending" : "Crossfade",
        "DialPad.Home" : "Back Depart + Crossfade",
        "DialPad.Keyboard" : "Back Depart + Crossfade",
        "DialPad.List" : "Crossfade",
        "DialPad.NaviBlack" : "Crossfade",
        "DialPad.Navigation" : "NA",
        "DialPad.Startup / Ending" : "Crossfade",
        "DialPad.Tabbed List" : "Crossfade",
        "DialPad.Tuner" : "Back Depart + Crossfade",
        "Dialog.Backup / Parking" : "FastCrossfade",
        "Dialog.DVD / TV" : "SB Slide + Crossfade + UMP Arrive",
        "Dialog.DVD / TV Screen Settings" : "SB Slide + Crossfade",
        "Dialog.Detail with Back" : "Crossfade + Back Arrive",
        "Dialog.Detail with UMP" : "Crossfade + UMP Arrive",
        "Dialog.Diagnostics" : "Snap",
        "Dialog.DialPad" : "Crossfade + Back Arrive",
        "Dialog.Dialog" : "Crossfade",
        "Dialog.Display Off" : "Crossfade",
        "Dialog.Gap2 Ending" : "Crossfade",
        "Dialog.Home" : "Crossfade",
        "Dialog.Keyboard" : "Crossfade",
        "Dialog.List" : "Crossfade + Back Arrive",
        "Dialog.NaviBlack" : "Crossfade",
        "Dialog.Navigation" : "NA",
        "Dialog.Startup / Ending" : "Crossfade",
        "Dialog.Tabbed List" : "Crossfade + Back Arrive",
        "Dialog.Tuner" : "Crossfade",
        "Display Off.Backup / Parking" : "FastCrossfade",
        "Display Off.DVD / TV" : "Snap",
        "Display Off.DVD / TV Screen Settings" : "Snap",
        "Display Off.Detail with Back" : "Snap",
        "Display Off.Detail with UMP" : "Snap",
        "Display Off.Diagnostics" : "Snap",
        "Display Off.DialPad" : "Snap",
        "Display Off.Dialog" : "Snap",
        "Display Off.Display Off" : "NA",
        "Display Off.Gap2 Ending" : "Crossfade",
        "Display Off.Home" : "Snap",
        "Display Off.Keyboard" : "Snap",
        "Display Off.List" : "Snap",
        "Display Off.NaviBlack" : "Crossfade",
        "Display Off.Navigation" : "NA",
        "Display Off.Startup / Ending" : "Crossfade",
        "Display Off.Tabbed List" : "Snap",
        "Display Off.Tuner" : "Snap",
        "Gap2 Ending.Backup / Parking" : "FastCrossfade",
        "Gap2 Ending.DVD / TV" : "NA",
        "Gap2 Ending.DVD / TV Screen Settings" : "NA",
        "Gap2 Ending.Detail with Back" : "NA",
        "Gap2 Ending.Detail with UMP" : "NA",
        "Gap2 Ending.Diagnostics" : "Snap",
        "Gap2 Ending.DialPad" : "NA",
        "Gap2 Ending.Dialog" : "Crossfade",
        "Gap2 Ending.Display Off" : "NA",
        "Gap2 Ending.Gap2 Ending" : "Crossfade",
        "Gap2 Ending.Home" : "NA",
        "Gap2 Ending.Keyboard" : "NA",
        "Gap2 Ending.List" : "NA",
        "Gap2 Ending.NaviBlack" : "NA",
        "Gap2 Ending.Navigation" : "NA",
        "Gap2 Ending.Startup / Ending" : "Crossfade",
        "Gap2 Ending.Tabbed List" : "NA",
        "Gap2 Ending.Tuner" : "NA",
        "Home.Backup / Parking" : "FastCrossfade",
        "Home.DVD / TV" : "Explode + SB Slide + Crossfade + UMP Arrive",
        "Home.DVD / TV Screen Settings" : "NA",
        "Home.Detail with Back" : "Explode + Crossfade + Back Arrive",
        "Home.Detail with UMP" : "Explode + Crossfade + UMP Arrive",
        "Home.Diagnostics" : "Snap",
        "Home.DialPad" : "Explode + Crossfade + Back Arrive",
        "Home.Dialog" : "Fadeover",
        "Home.Display Off" : "Snap",
        "Home.Gap2 Ending" : "Crossfade",
        "Home.Home" : "NA",
        "Home.Keyboard" : "Explode + Crossfade",
        "Home.List" : "Explode + Crossfade + Back Arrive",
        "Home.NaviBlack" : "Explode + Crossfade",
        "Home.Navigation" : "NA",
        "Home.Startup / Ending" : "Crossfade",
        "Home.Tabbed List" : "Explode + Crossfade + Back Arrive",
        "Home.Tuner" : "Explode + Crossfade",
        "Keyboard.Backup / Parking" : "FastCrossfade",
        "Keyboard.DVD / TV" : "SB Slide + Crossfade + UMP Arrive",
        "Keyboard.DVD / TV Screen Settings" : "SB Slide + Crossfade",
        "Keyboard.Detail with Back" : "Crossfade + Back Arrive",
        "Keyboard.Detail with UMP" : "Crossfade + UMP Arrive",
        "Keyboard.Diagnostics" : "Snap",
        "Keyboard.DialPad" : "Crossfade + Back Arrive",
        "Keyboard.Dialog" : "Fadeover",
        "Keyboard.Display Off" : "Crossfade",
        "Keyboard.Gap2 Ending" : "Crossfade",
        "Keyboard.Home" : "Crossfade",
        "Keyboard.Keyboard" : "Crossfade",
        "Keyboard.List" : "Crossfade + Back Arrive",
        "Keyboard.NaviBlack" : "Crossfade",
        "Keyboard.Navigation" : "NA",
        "Keyboard.Startup / Ending" : "Crossfade",
        "Keyboard.Tabbed List" : "Crossfade + Back Arrive",
        "Keyboard.Tuner" : "NA",
        "List.Backup / Parking" : "FastCrossfade",
        "List.DVD / TV" : "Back Depart + SB Slide + Crossfade + UMP Arrive",
        "List.DVD / TV Screen Settings" : "Back Depart + SB Slide + Crossfade",
        "List.Detail with Back" : "Crossfade",
        "List.Detail with UMP" : "Back Depart + Crossfade + UMP Arrive",
        "List.Diagnostics" : "Snap",
        "List.DialPad" : "Crossfade",
        "List.Dialog" : "Fadeover",
        "List.Display Off" : "Back Depart + Crossfade",
        "List.Gap2 Ending" : "Crossfade",
        "List.Home" : "Back Depart + Crossfade",
        "List.Keyboard" : "Back Depart + Crossfade",
        "List.List" : "Crossfade OR Slide",
        "List.NaviBlack" : "Back Depart + Crossfade",
        "List.Navigation" : "NA",
        "List.Startup / Ending" : "Crossfade",
        "List.Tabbed List" : "Crossfade OR Slide",
        "List.Tuner" : "Back Depart + Crossfade",
        "NaviBlack.Backup / Parking" : "FastCrossfade",
        "NaviBlack.DVD / TV" : "NA",
        "NaviBlack.DVD / TV Screen Settings" : "NA",
        "NaviBlack.Detail with Back" : "Crossfade + Back Arrive",
        "NaviBlack.Detail with UMP" : "Crossfade + UMP Arrive",
        "NaviBlack.Diagnostics" : "Snap",
        "NaviBlack.DialPad" : "Crossfade + Back Arrive",
        "NaviBlack.Dialog" : "Crossfade",
        "NaviBlack.Display Off" : "Crossfade",
        "NaviBlack.Gap2 Ending" : "Crossfade",
        "NaviBlack.Home" : "Crossfade",
        "NaviBlack.Keyboard" : "Crossfade",
        "NaviBlack.List" : "Crossfade + Back Arrive",
        "NaviBlack.NaviBlack" : "NA",
        "NaviBlack.Navigation" : "Crossfade",
        "NaviBlack.Startup / Ending" : "Crossfade",
        "NaviBlack.Tabbed List" : "Crossfade + Back Arrive",
        "NaviBlack.Tuner" : "NA",
        "Navigation.Backup / Parking" : "FastCrossfade",
        "Navigation.DVD / TV" : "Snap",
        "Navigation.DVD / TV Screen Settings" : "Snap",
        "Navigation.Detail with Back" : "Crossfade + Back Arrive",
        "Navigation.Detail with UMP" : "Crossfade + UMP Arrive",
        "Navigation.Diagnostics" : "Snap",
        "Navigation.DialPad" : "Crossfade + Back Arrive",
        "Navigation.Dialog" : "Crossfade",
        "Navigation.Display Off" : "Crossfade",
        "Navigation.Gap2 Ending" : "Crossfade",
        "Navigation.Home" : "Crossfade",
        "Navigation.Keyboard" : "Crossfade",
        "Navigation.List" : "Crossfade + Back Arrive",
        "Navigation.NaviBlack" : "NA",
        "Navigation.Navigation" : "NA",
        "Navigation.Startup / Ending" : "Crossfade",
        "Navigation.Tabbed List" : "Crossfade + Back Arrive",
        "Navigation.Tuner" : "NA",
        "None.Backup / Parking" : "FastCrossfade",
        "None.DVD / TV" : "Snap",
        "None.DVD / TV Screen Settings" : "Snap",
        "None.Detail with Back" : "Snap",
        "None.Detail with UMP" : "Snap",
        "None.Diagnostics" : "Snap",
        "None.DialPad" : "Snap",
        "None.Dialog" : "Snap",
        "None.Display Off" : "Snap",
        "None.Gap2 Ending" : "Snap",
        "None.Home" : "Snap",
        "None.Keyboard" : "Snap",
        "None.List" : "Snap",
        "None.NaviBlack" : "Snap",
        "None.Navigation" : "Snap",
        "None.Startup / Ending" : "Snap",
        "None.Tabbed List" : "Snap",
        "None.Tuner" : "Snap",
        "Startup / Ending.Backup / Parking" : "FastCrossfade",
        "Startup / Ending.DVD / TV" : "NA",
        "Startup / Ending.DVD / TV Screen Settings" : "NA",
        "Startup / Ending.Detail with Back" : "NA",
        "Startup / Ending.Detail with UMP" : "NA",
        "Startup / Ending.Diagnostics" : "Snap",
        "Startup / Ending.DialPad" : "NA",
        "Startup / Ending.Dialog" : "Crossfade",
        "Startup / Ending.Display Off" : "NA",
        "Startup / Ending.Gap2 Ending" : "NA",
        "Startup / Ending.Home" : "NA",
        "Startup / Ending.Keyboard" : "NA",
        "Startup / Ending.List" : "NA",
        "Startup / Ending.NaviBlack" : "NA",
        "Startup / Ending.Navigation" : "NA",
        "Startup / Ending.Startup / Ending" : "Snap",
        "Startup / Ending.Tabbed List" : "NA",
        "Startup / Ending.Tuner" : "NA",
        "Tabbed List.Backup / Parking" : "FastCrossfade",
        "Tabbed List.DVD / TV" : "Back Depart + SB Slide + Crossfade + UMP Arrive",
        "Tabbed List.DVD / TV Screen Settings" : "Back Depart + SB Slide + Crossfade",
        "Tabbed List.Detail with Back" : "Crossfade",
        "Tabbed List.Detail with UMP" : "Back Depart + Crossfade + UMP Arrive",
        "Tabbed List.Diagnostics" : "Snap",
        "Tabbed List.DialPad" : "Crossfade",
        "Tabbed List.Dialog" : "Fadeover",
        "Tabbed List.Display Off" : "Back Depart + Crossfade",
        "Tabbed List.Gap2 Ending" : "Crossfade",
        "Tabbed List.Home" : "Back Depart + Crossfade",
        "Tabbed List.Keyboard" : "Back Depart + Crossfade",
        "Tabbed List.List" : "Crossfade OR Slide",
        "Tabbed List.NaviBlack" : "Back Depart + Crossfade",
        "Tabbed List.Navigation" : "NA",
        "Tabbed List.Startup / Ending" : "Crossfade",
        "Tabbed List.Tabbed List" : "Snap",
        "Tabbed List.Tuner" : "Back Depart + Crossfade",
        "Tuner.Backup / Parking" : "FastCrossfade",
        "Tuner.DVD / TV" : "SB Slide + Crossfade + UMP Arrive",
        "Tuner.DVD / TV Screen Settings" : "SB Slide + Crossfade",
        "Tuner.Detail with Back" : "Crossfade + Back Arrive",
        "Tuner.Detail with UMP" : "Crossfade + UMP Arrive",
        "Tuner.Diagnostics" : "Snap",
        "Tuner.DialPad" : "Crossfade + Back Arrive",
        "Tuner.Dialog" : "Fadeover",
        "Tuner.Display Off" : "Crossfade",
        "Tuner.Gap2 Ending" : "Crossfade",
        "Tuner.Home" : "Crossfade",
        "Tuner.Keyboard" : "Crossfade",
        "Tuner.List" : "Crossfade + Back Arrive",
        "Tuner.NaviBlack" : "Crossfade",
        "Tuner.Navigation" : "NA",
        "Tuner.Startup / Ending" : "Crossfade",
        "Tuner.Tabbed List" : "Crossfade + Back Arrive",
        "Tuner.Tuner" : "NA",
    };  // end this._TRANSITION_TABLE

    this._TRANSITION_EXCEPTIONS_TABLE = {
        "testdialpad.DialPadd..system.HomeScreen" : "Back Depart + Crossfade",
        "favorites.SelectFavoriteToMove..favorites.SelectPosition" : "Snap",
    };  // end this._TRANSITION_EXCEPTIONS_TABLE

    this._TRANSITION_FUNCTIONS = {
        "Back Depart + Crossfade" : { "functionName" : "_ApplyTransition_BackDepart_Crossfade", "duration_ms" : 600 },
        "Back Depart + SB Slide + Crossfade" : { "functionName" : "_ApplyTransition_BackDepart_SBSlide_Crossfade", "duration_ms" : 600 },
        "Back Depart + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_BackDepart_Crossfade_UMPArrive", "duration_ms" : 600 },
        "Back Depart + SB Slide + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_BackDepart_SBSlide_Crossfade_UMPArrive", "duration_ms" : 600 },
        "Crossfade" : { "functionName" : "_ApplyTransition_Crossfade", "duration_ms" : 600 },
        "SB Slide + Crossfade" : { "functionName" : "_ApplyTransition_SBSlide_Crossfade", "duration_ms" : 600 },
        "Crossfade + Back Arrive" : { "functionName" : "_ApplyTransition_Crossfade_BackArrive", "duration_ms" : 600 },
        "Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_Crossfade_UMPArrive", "duration_ms" : 600 },
        "SB Slide + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_SBSlide_Crossfade_UMPArrive", "duration_ms" : 600 },
        "Explode + Crossfade" : { "functionName" : "_ApplyTransition_Explode_Crossfade", "duration_ms" : 600 },
        "Explode + Crossfade + Back Arrive" : { "functionName" : "_ApplyTransition_Explode_Crossfade_BackArrive", "duration_ms" : 600 },
        "Explode + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_Explode_Crossfade_UMPArrive", "duration_ms" : 600 },
        "Explode + SB Slide + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_Explode_SBSlide_Crossfade_UMPArrive", "duration_ms" : 600 },
        "Fadeover" : { "functionName" : "_ApplyTransition_Fadeover", "duration_ms" : 200 },
        "FastCrossfade" : { "functionName" : "_ApplyTransition_FastCrossfade", "duration_ms" : 400 },
        "Slide Left YY" : { "functionName" : "_ApplyTransition_SlideLeft_PrevLeft_CurrLeft", "duration_ms" : 400 },
        "Slide Left NY" : { "functionName" : "_ApplyTransition_SlideLeft_PrevNoLeft_CurrLeft", "duration_ms" : 400 },
        "Slide Left YN" : { "functionName" : "_ApplyTransition_SlideLeft_PrevLeft_CurrNoLeft", "duration_ms" : 400 },
        "Slide Left NN" : { "functionName" : "_ApplyTransition_SlideLeft_PrevNoLeft_CurrNoLeft", "duration_ms" : 400 },
        "Slide Right YY" : { "functionName" : "_ApplyTransition_SlideRight_PrevLeft_CurrLeft", "duration_ms" : 400 },
        "Slide Right NY" : { "functionName" : "_ApplyTransition_SlideRight_PrevNoLeft_CurrLeft", "duration_ms" : 400 },
        "Slide Right YN" : { "functionName" : "_ApplyTransition_SlideRight_PrevLeft_CurrNoLeft", "duration_ms" : 400 },
        "Slide Right NN" : { "functionName" : "_ApplyTransition_SlideRight_PrevNoLeft_CurrNoLeft", "duration_ms" : 400 },
        "Snap" : { "functionName" : "_ApplyTransition_Snap", "duration_ms" : 0 },
        "UMP Depart + Crossfade" : { "functionName" : "_ApplyTransition_UMPDepart_Crossfade", "duration_ms" : 400 },
        "UMP Depart + SB Slide + Crossfade" : { "functionName" : "_ApplyTransition_UMPDepart_SBSlide_Crossfade", "duration_ms" : 400 },
        "UMP Depart + Crossfade + Back Arrive" : { "functionName" : "_ApplyTransition_UMPDepart_Crossfade_BackArrive", "duration_ms" : 400 },
        "UMP Depart + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_UMPDepart_Crossfade_UMPArrive", "duration_ms" : 500 },
        "UMP Depart + SB Slide + Crossfade + UMP Arrive" : { "functionName" : "_ApplyTransition_UMPDepart_SBSlide_Crossfade_UMPArrive", "duration_ms" : 500 },
    };  // end this._TRANSITION_FUNCTIONS
}

TransitionsGen.prototype.getTemplateCategoriesTable = function() {
    return this._TEMPLATE_CATEGORIES_TABLE;
};

TransitionsGen.prototype.getTransitionTable = function() {
    return this._TRANSITION_TABLE;
};

TransitionsGen.prototype.getTransitionExceptionsTable = function() {
    return this._TRANSITION_EXCEPTIONS_TABLE;
};

TransitionsGen.prototype.getTransitionFunctionsTable = function() {
    return this._TRANSITION_FUNCTIONS;
};

TransitionsGen.prototype.getTemplateCategory = function(template) {
    var category = null;
    
    if (utility.toType(template) === "object") {
        var templateName = template.templateName;
        var contextInfo = template.contextInfo;
        
        log.debug("getTemplateCategory(): templateName = " + templateName + ", contextInfo", contextInfo);

        if ((templateName === "DialPad2Tmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getDialPad2Category) === "function")) {
            category = this._mgrObj._getDialPad2Category(template);
        } else if ((templateName === "List2Tmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getList2Category) === "function")) {
            category = this._mgrObj._getList2Category(template);
        } else if ((templateName === "NoCtrlTmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getNoCtrlCategory) === "function")) {
            category = this._mgrObj._getNoCtrlCategory(template);
        } else if ((templateName === "NowPlaying4Tmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getNowPlaying4Category) === "function")) {
            category = this._mgrObj._getNowPlaying4Category(template);
        } else if ((templateName === "ScreenSettings2Tmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getScreenSettings2Category) === "function")) {
            category = this._mgrObj._getScreenSettings2Category(template);
        } else if ((templateName === "IdmTmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getIdmCategory) === "function")) {
            category = this._mgrObj._getIdmCategory(template);
        } else if ((templateName === "EcoEffectTmplt") &&
                (utility.toType(this._mgrObj) === "object") &&
                (utility.toType(this._mgrObj._getEcoEffectCategory) === "function")) {
            category = this._mgrObj._getEcoEffectCategory(template);
        } else {
            category = this._TEMPLATE_CATEGORIES_TABLE[templateName];
        }
    }

    if (!category) {
        category = "None";
    }    
    
    return category;
};

TransitionsGen.prototype.getTransitionFunction = function(transitionName,
                                                          prevTemplate,
                                                          currTemplate,
                                                          cmnTransData) {
    var transitionFunction = null;
    var initClass = null;

    // Resolve special-case transition names, based on templates & common transition data    
    if ((transitionName === "Crossfade OR Slide") &&
            (utility.toType(this._mgrObj) === "object") &&
            (utility.toType(this._mgrObj._getListToListTransition) === "function")) {
        transitionName = this._mgrObj._getListToListTransition(prevTemplate, currTemplate, cmnTransData);
    } else if ((transitionName === "UMP Depart + Crossfade + UMP Arrive OR Snap") &&
            (utility.toType(this._mgrObj) === "object") &&
            (utility.toType(this._mgrObj._getDetailToDetailTransition) === "function")) {
        transitionName = this._mgrObj._getDetailToDetailTransition(prevTemplate, currTemplate, cmnTransData);
    }

    if (!transitionName) {
        log.warn("getTransitionFunction(): no transition name found, defaulting to Crossfade");
        transitionName = "Crossfade";
    }

    // Look up the transition function & duration corresponding to the named transition,
    // now that ambiguities have been resolved
    transitionElements = this._mgrObj._getBoundTransitionFunction(transitionName);

    // Determine the init class to apply to the current template before the transition starts
    transitionElements.initClass = this._mgrObj._getInitClassForTransition(transitionName);

    return transitionElements;
};


TransitionsGen.prototype._ApplyTransition_BackDepart_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_BackDepart_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_BackDepart_SBSlide_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_BackDepart_SBSlide_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "slide", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_BackDepart_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_BackDepart_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_BackDepart_SBSlide_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_BackDepart_SBSlide_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "slide", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SBSlide_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SBSlide_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "slide", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Crossfade_BackArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Crossfade_BackArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SBSlide_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SBSlide_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "slide", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Explode_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Explode_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Explode_Crossfade_BackArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Explode_Crossfade_BackArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Explode_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Explode_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Explode_SBSlide_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Explode_SBSlide_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_600";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_600";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_300_300";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_300_300");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(300, 300, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(300, 300, "slide", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Fadeover =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Fadeover(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_200";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_200";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_0_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_200";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_0_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_200";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_noOpOut_0_200");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_0_200");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 200, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 200, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_FastCrossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_FastCrossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_200";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_200";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_200");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 200, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideLeft_PrevLeft_CurrLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideLeft_PrevLeft_CurrLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutLeftTmpltWithStatusLeftBtn_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInRightTmpltWithStatusLeftBtn_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideLeft_PrevNoLeft_CurrLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideLeft_PrevNoLeft_CurrLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutLeftTmpltWithStatus_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInRightTmpltWithStatusLeftBtn_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideLeft_PrevLeft_CurrNoLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideLeft_PrevLeft_CurrNoLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutLeftTmpltWithStatusLeftBtn_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInRightTmpltWithStatus_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideLeft_PrevNoLeft_CurrNoLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideLeft_PrevNoLeft_CurrNoLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutLeftTmpltWithStatus_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInRightTmpltWithStatus_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideRight_PrevLeft_CurrLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideRight_PrevLeft_CurrLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutRightTmpltWithStatusLeftBtn_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInLeftTmpltWithStatusLeftBtn_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideRight_PrevNoLeft_CurrLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideRight_PrevNoLeft_CurrLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutRightTmpltWithStatus_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInLeftTmpltWithStatusLeftBtn_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideRight_PrevLeft_CurrNoLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideRight_PrevLeft_CurrNoLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutRightTmpltWithStatusLeftBtn_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInLeftTmpltWithStatus_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_SlideRight_PrevNoLeft_CurrNoLeft =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_SlideRight_PrevNoLeft_CurrNoLeft(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_0_400";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_0_400";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_slideOutRightTmpltWithStatus_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_slideInLeftTmpltWithStatus_0_400");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_Snap =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_Snap(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.snapFlag = true;
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    this._currTemplate.divElt.style.opacity = 1;

    // Invoke a timer to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByTimer(0);
}

TransitionsGen.prototype._ApplyTransition_UMPDepart_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_UMPDepart_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    // Slide the prevUMP
    if (prevUMPCtrl) {
        // Call special UMP function to initiate slide (delay/duration/direction)
        prevUMPCtrl.transitionSlide(0, 400, "down");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "fade", true);
    }

    // Invoke a timer to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByTimer(400);
}

TransitionsGen.prototype._ApplyTransition_UMPDepart_SBSlide_Crossfade =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_UMPDepart_SBSlide_Crossfade(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_400";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_400");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    // Slide the prevUMP
    if (prevUMPCtrl) {
        // Call special UMP function to initiate slide (delay/duration/direction)
        prevUMPCtrl.transitionSlide(0, 400, "down");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 400, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "slide", true);
    }

    // Invoke a timer to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByTimer(400);
}

TransitionsGen.prototype._ApplyTransition_UMPDepart_Crossfade_BackArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_UMPDepart_Crossfade_BackArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_400";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_400";
    globalCtrlsCfg.leftButtonIn = "Transitions_slideLeftBtnIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_slideLeftBtnOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_slideRightChromeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_slideRightChromeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    // Slide the prevUMP
    if (prevUMPCtrl) {
        // Call special UMP function to initiate slide (delay/duration/direction)
        prevUMPCtrl.transitionSlide(0, 100, "down");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "fade", true);
    }

    // Set an event listener to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByEventListener(this._currTemplate.divElt);
}

TransitionsGen.prototype._ApplyTransition_UMPDepart_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_UMPDepart_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_500";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_500";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    // Slide the prevUMP
    if (prevUMPCtrl) {
        // Call special UMP function to initiate slide (delay/duration/direction)
        prevUMPCtrl.transitionSlide(0, 100, "down");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(400, 100, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "fade", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "fade", true);
    }

    // Invoke a timer to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByTimer(500);
}

TransitionsGen.prototype._ApplyTransition_UMPDepart_SBSlide_Crossfade_UMPArrive =
        function(prevTemplate, currTemplate, cmnTransData) {
    log.debug("_ApplyTransition_UMPDepart_SBSlide_Crossfade_UMPArrive(prevTemplate, currTemplate, cmnTransData) called: ",
              prevTemplate, currTemplate, cmnTransData);

    // Save data for post-transition callbacks
    this._prevTemplate = prevTemplate;
    this._currTemplate = currTemplate;
    this._commonTransitionData = cmnTransData;

    var globalCtrlsCfg = new Object();
    globalCtrlsCfg.commonTransitionData = this._commonTransitionData;
    globalCtrlsCfg.bckgrndIn = "Transitions_fadeIn_0_500";
    globalCtrlsCfg.bckgrndOut = "Transitions_fadeOut_0_500";
    globalCtrlsCfg.leftButtonIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.leftButtonOut = "Transitions_fadeOut_0_300";
    globalCtrlsCfg.rightChromeIn = "Transitions_fadeIn_200_200";
    globalCtrlsCfg.rightChromeOut = "Transitions_fadeOut_0_300";
    this._mgrObj._doGlobalControlsTransition(globalCtrlsCfg);

    // Apply CSS animation classes to templates
    var prevUMPCtrl = null;
    if (this._prevTemplate) {
        if (utility.toType(this._prevTemplate["getUmpCtrl"]) === "function") {
            prevUMPCtrl = this._prevTemplate.getUmpCtrl();
        }
        if (this._prevTemplate.properties.isDialog &&
                this._prevTemplate.properties.snapshotTmpltDivElt && (!this._currTemplate.properties.isDialog)) {
            this._prevTemplate.properties.snapshotTmpltDivElt.classList.add("Transitions_dialog_bkgrnd_fadeOut_0_200");
        }
        this._prevTemplate.divElt.classList.add("Transitions_fadeOut_0_300");
    }
    var currUMPCtrl = null;
    if (this._currTemplate) {
        if (utility.toType(this._currTemplate["getUmpCtrl"]) === "function") {
            currUMPCtrl = this._currTemplate.getUmpCtrl();
        }
        this._currTemplate.divElt.classList.add("Transitions_fadeIn_200_200");
    }

    // Slide the prevUMP
    if (prevUMPCtrl) {
        // Call special UMP function to initiate slide (delay/duration/direction)
        prevUMPCtrl.transitionSlide(0, 100, "down");
    }

    // Slide the currUMP
    if (currUMPCtrl) {
        // Set the initial UMP retract state
        currUMPCtrl.transitionSlide(0, 0, "down");

        // Call special UMP function to initiate slide (delay/duration/direction)
        currUMPCtrl.transitionSlide(400, 100, "up");
    }

    log.debug("statusBarVisible = " + this._commonTransitionData.statusBarVisible + ", statusBar.isVisible = " + framework.common.statusBar.isVisible());

    // Slide the status bar out (if needed)
    if (this._commonTransitionData.statusBarVisible == false &&
            (framework.common.statusBar.isVisible() == true)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(0, 300, "slide", false);
    }

    // Slide the status bar in (if needed)
    if (this._commonTransitionData.statusBarVisible == true &&
            (framework.common.statusBar.isVisible() == false)) {
        // Call special status bar function to initiate slide (delay/duration/direction)
        framework.common.statusBar.transitionVisible(200, 200, "slide", true);
    }

    // Invoke a timer to clean up asynchronously after the transition ends
    this._mgrObj._setCleanupByTimer(500);
}



// END GENERATED CODE
