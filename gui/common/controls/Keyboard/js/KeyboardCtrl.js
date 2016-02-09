/*
 Copyright 2012 by Johnson Controls
 __________________________________________________________________________

 Project: JCI-IHU
 Language: EN
 Author: avorotp, ahanisk
 __________________________________________________________________________

 Description: IHU GUI Keyboard Control
 Revisions:
 v0.1 (25-Jul-2012) - Initial layout
 v1.0 (17-Oct-2012) - Studio Layout with multicontroller support - ahanisk
 v1.1 (05-Nov-2012) - Added the 17 EU languages and the 2 associated layouts - ahanisk
 v1.2 (12-Nov_2012) - Added AtSpeed behavior - ahanisk
 __________________________________________________________________________

 */

log.addSrcFile("KeyboardCtrl.js", "common");

/*
 * =========================
 * Constructor
 * =========================
 * Keyboard control is a virtual keyboard that allows entering of alphabetic, numeric input and other symbols in a
 * field that can later be used
 */

function KeyboardCtrl(uiaId, parentDiv, ctrlId, properties)
{

    /*This is the constructor of the KeyboardCtrl Component
     Create, set dimensions and assign default name*/

    //@formatter:off
    this.properties = {
        okBtnCallback : null,
        cancelBtnCallback : null,
        value : null,               // (string)
        locale : null,           // (string) - language code
        appData : null,
        isPassword : false,
        placeholderText : null,
        placeholderTextId : null,
        placeholderSubMap : null,
        maxChars : 0,
        maxBytes : 0,
        uniqueLayout : null
    };
    //@formatter:on
    for (var i in properties)
    {
        this.properties[i] = properties[i];
    }

    // set control's properties
    this.id = ctrlId;               // control's id
    this.parentDiv = parentDiv;     // control's immediate parent DOM element
    this.uiaId = uiaId;             // uiaId of the owning app
    log.debug("Keyboard Control constructor called from " + this.uiaId + "with locale " + this.properties.locale);

    // control DOM elements
    this.divElt = null;             // (HTML Element) reference to the top level div of this control
    this._input = null;             // (HTML Element) reference to the input field container
    this._btns;                     // ([][] of HTMLElements) Keeps track of currently shown buttons (with listeners)
    this._btnBackspace;             // (HTML Element) reference to the backspace button
    this._btnShift;                 // (HTML Element) reference to the shift button
    this._layoutSwitch;             // (HTML Element) reference to the layout switch button
    this._ok;                       // (HTML Element) reference to the OK button
    this._cancel;                   // (HTML Element) reference to the cancel button
    this._globe;                    // (HTML Element) reference to the globe button
    this._spacebar;                 // (HTML Element) reference to the spacebar
    this._modKey;                   // (HTML Element) reference to the mod key for Kana
    this._deleteIntervalId = null;  // (Integer) reference to the delete button timer
    this._deleteInterval = 150;     // (Integer) Number of milliseconds that elapse before another character is deleted when *holding* the Delete key.
    this._startDeleteIntervalId = null;  // (Integer) reference to the timer that starts the quick-delete
    this._startDeleteInterval = 500;     // (Integer) Number of milliseconds that elapse before the first character is deleted when *holding* the Delete key.

    // for custom textbox
    this._inputSpan = null;         // (HTML Element) reference to the span which contains the text for the input field.
    this._caret = null;             // (HTML Element) reference to the text cursor.
    this._debugCaret = null;        // (HTML Element) reference to the text cursor that will show in the suggestion div.
    this._leftCover = null;         // (HTML Element) reference to the div covering the far left side of the input field to cover overflow text.
    this._leftFade = null;          // (HTML Element) reference to the div fading on the far left side of the input field to cover overflow text.
    this._rightCover = null;        // (HTML Element) reference to the div covering the far right side of the input field to cover overflow text.
    this._rightFade = null;         // (HTML Element) reference to the div fading on the far right side of the input field to cover overflow text.

    this._suggestionRowWrapper = null;      // (HTML Element) reference to the character converter container, including arrow buttons
    this._suggestionBackgroundDiv = null;   // (HTML Element) reference to the container that sits between the arrows
    this._suggestionWrapper = null;         // (HTML Element) reference to the container for the suggestion divs that fill the character converter used to scroll the group of suggestions
    this._suggestionDivs = null;            // (HTML Element[]) reference to the suggestion divs that fill the character converter
    this._suggestionWidths = new Array();   // (Number[]) Hold widths of the sugguestion spans for proper scrolling
    this._suggestionOffset;                 // (Number) the number of pixels the suggestion row is from the left side of the left arrow
    this._firstVisibleSuggestion = 0;       // (Number) representes the index of the suggestion span which is the left-most visible
    this._maxSuggOffset;                    // (Number) The maximum value for this._suggestion offset can be without showing past the end of the suggestions.. updated in _resizeSuggestions()
    this._visibleSuggWidth;                 // (Number) Related to this._maxSuggOffset.. holds the width in pixels of the area between the suggestion arrows
    this._visibleSuggCount;                 // (Number) The number of suggestions visible in this._suggestionRowWrapper
    this._numSuggestions = 0;               // (Number) the length of the array of suggestions IN the lookup table

    this._btnWidth = 72;                    // (Number) Stores the width of the current layout's buttons in pixels. Used to determine which button to focus when bumping down from cursor location.
    this._btnMargin = 5;                    // (Number) Stores the width of the current layout's button margin (right) in pixels. Used to determine which button to focus when bumping down from cursor location.
    this._inputDivLeft = 16;                // (Number) Stores the left offset of the input field in pixels. Updated in _cssRefresh(). Used in determining correct cursor position.
    this._inputDivXPadding = 26;            // (Number) fadeLeft.width + coverLeft.width - 4 (for some overlap)
    this._suggDivXPadding = 8;              // (Number) left padding for suggestion divs, used in debug cursor postitioning
    this._maxCaretOffset = null;            // (Number) Maximum caret offest in pixels, absolute positioning
    this._minCaretOffset = null;            // (Number) Minimum caret offset in pixels, absolute positioning
    this._spanOffset = this._inputDivXPadding;      // (Number) The current left offset of this._inputSpan
    this._highlightSpanOffset = this._spanOffset;   // (Number) The current left offset of the highlight span fo rthe converter
    this._hasPlaceholder = false;           // (Boolean) True if input field is currently populated with placeholder text
    this._caretPos = 0;                     // (Integer) Index of the cursor position within the input text
    this._candidateZeroCaretPos = 0;        // (Integer) Index of the cursor position within the _candidateZero String
    this._caretOffset;                      // (Integer) Left offset of this._caret
    this._characterSizes = new Array();     // (Integer) Array of character widths. Used in cursor positioning
    this._characterSizes[0] = 0;            // (Integer) The first index of _characterSizes is always zero, since the cursor can be placed before the first character.
    this._inputStr = '';                    // (String) Current string input by the user
    this._prevExistingText;                 // (String) Text to fill the input with upon initialization
    this._focusedKey = null;                // (HTML Element) reference to the currently focused key
    this._currentLayout;                    // (String) Indicates which layout of the chosen language is visible. (e.g. 'lettersSmall')
    this._atSpeed = false;                  // (Boolean) Flag for Speed restriction behavior
    this._isJaJpConversionLoaded = false;   // (Boolean) Indicates if the conversion file for ja_JP_ABC has been loaded
    this._isMnTwConversionLoaded = false;   // (Boolean) Indicates if the conversion file for mn_TW has been loaded
    this._isZhCnConversionLoaded = false;   // (Boolean) Indicates if the conversion file for zh_CN has been loaded
    this._isZhTwConversionLoaded = false;   // (Boolean) Indicates if the conversion file for zh_TW has been loaded
    this._isCnHkConversionLoaded = false;   // (Boolean) Indicates if the conversion file for cn_HK has been loaded
    this._highlightedStr = '';              // (String) Contains the as much of this._candidateZero that will display within character limit
    this._candidateZero = '';               // (String) Contains the current candidate for character conversion
    this._highlightedSpan = null;           // (HTML Element) Contains this._highlightedStr
    this._highlightPos = {start: -1, end: -1};      // (Numbers) Integers describing the start and end of the highlight in terms of caret positions
    this._lastHighlightedKey = {row: -1, end: -1};  // (Object) This keeps the highlight position of the last key highlighted before focus was placed on the character converter.
    this._lastEnteredKey = {row: -1, end: -1};      // (Object) This keeps the highlight position of the last key entered before a suggestion was accepted in the character converter.
    this._conversionLang = false;           // (Boolean) Indicates if a character converter is used in the current keyboard langauge
    this._suppressConvUpdate = false;       // (Boolean) if true, the suggestions will not update when a button is pressed or a character is deleted
    this._noInsert = false;                 // (Boolean) Indicates if character insertion is enabled.
    this._predEngine = null;
    this._systemLangRtl = false;            // (Boolean) Indicates if System Language is "ar_SA" (Arabic) or "he_IL_ABC" (Hebrew). Or some other rtl language they decide to add in the future
    this._isRtlLang = false;                // (Boolean) Indicates if Keyboard Language is "ar_SA" (Arabic) or "he_IL_ABC" (Hebrew). Or some other rtl language they decide to add in the future
    this._specialLayout = false;            // (Boolean) Indicates a special layout where the globe key is disabled (cannot change language)
    this._byteCount = 0;                    // (Number) The number of bytes the input string would take up as a UTF-8 encoded string
    this._byteBuffer = 0;                   // (Number) Size (bytes) of buffer for the byte limit. Conversion cannot begin when the byte count has cut into the buffer.
    this._initialise = false;               // Indicates if keyboard is opening with input string

    this._selectMode = null;                // (Boolean) True if Touch is currently active... not sure if needed
    this._downKey = null;                   // (HTML Element) Reference to the item that was originally pressed.
    this._inputKeyPressed = false;          //(Boolean) True if input box is pressed and resets to false when input box is released or mouse out is done

    /*
     * this object is used to keep track of the focus position as well as the keyboard layout
     */
    this._cssStyle = 'fiveTen';             // (String) Holds current Keyboard layout: 'fiveTen', 'sixTen', 'sixTwelve', 'suggFiveTen', 'suggSevenTen', 'suggSevenEleven'
    this._prevCssStyle = null;              // (String) Holds previous Keybaord layout
    this._focusData =
    {
        columns: 10,
        rows: 5,
        focusDuplicates: [[0, 8], [], [8, 9], [8, 9], [2, 7, 8, 9], [], [], []],
        shiftedRow: 2,
        row: 0,
        col: 0
    };                                      // (Object) Holds data for the focus position
    this._prevFocus = null;                 // (Object) Holds previous focus data.
    this._editMode = false;                 // (Boolean) Indicates if the keyboard is in Edit Mode (cursor has focus, multicontroller behavior chagnes slightly)

    // keyboard handlers
    this._btnDownCallback = this._btnDownHandler.bind(this);
    this._btnUpCallback = this._btnUpHandler.bind(this);
    this._btnOverCallback = this._btnOverHandler.bind(this);
    this._btnOutCallback = this._btnOutHandler.bind(this);
    // input handlers
    this._inputDownCallback = this._inputDownHandler.bind(this);
    this._inputUpCallback = this._inputUpHandler.bind(this);
    this._inputOverCallback = this._inputOverHandler.bind(this);
    this._inputOutCallback = this._inputOutHandler.bind(this);

    this._combiner = {
        'か': 'が', 'が': 'か',
        'き': 'ぎ', 'ぎ': 'き',
        'く': 'ぐ', 'ぐ': 'く',
        'け': 'げ', 'げ': 'け',
        'こ': 'ご', 'ご': 'こ',
        'さ': 'ざ', 'ざ': 'さ',
        'し': 'じ', 'じ': 'し',
        'す': 'ず', 'ず': 'す',
        'せ': 'ぜ', 'ぜ': 'せ',
        'そ': 'ぞ', 'ぞ': 'そ',
        'た': 'だ', 'だ': 'た',
        'ち': 'ぢ', 'ぢ': 'ち',
        'つ': 'っ', 'っ': 'づ', 'づ': 'つ',
        'て': 'で', 'で': 'て',
        'と': 'ど', 'ど': 'と',
        'は': 'ば', 'ば': 'ぱ', 'ぱ': 'は',
        'ひ': 'び', 'び': 'ぴ', 'ぴ': 'ひ',
        'ふ': 'ぶ', 'ぶ': 'ぷ', 'ぷ': 'ふ',
        'へ': 'べ', 'べ': 'ぺ', 'ぺ': 'へ',
        'ほ': 'ぼ', 'ぼ': 'ぽ', 'ぽ': 'ほ',   //I think the following 25 rows are Katakana characters
        'カ': 'ガ', 'ガ': 'カ',
        'キ': 'ギ', 'ギ': 'キ',
        'ク': 'グ', 'グ':  'ク',
        'ケ': 'ゲ', 'ゲ': 'ケ',
        'コ': 'ゴ', 'ゴ':  'コ',
        'サ': 'ザ', 'ザ': 'サ',
        'シ': 'ジ', 'ジ': 'シ',
        'ス': 'ズ', 'ズ': 'ス',
        'セ': 'ゼ', 'ゼ': 'セ',
        'ソ': 'ゾ', 'ゾ': 'ソ',
        'タ': 'ダ', 'ダ':  'タ',
        'チ': 'ヂ', 'ヂ': 'チ',
        'ツ': 'ッ', 'ッ': 'ヅ', 'ヅ': 'ツ',
        'テ': 'デ', 'デ': 'テ',
        'ト': 'ド', 'ド':  'ト',
        'ハ': 'バ', 'バ': 'パ', 'パ': 'ハ',
        'ヒ': 'ビ', 'ビ': 'ピ', 'ピ': 'ヒ',
        'フ': 'ブ', 'ブ': 'プ', 'プ': 'フ',
        'ヘ': 'ベ', 'ベ': 'ペ', 'ペ': 'ヘ',
        'ホ': 'ボ', 'ボ': 'ポ', 'ポ': 'ホ',
        'ウ': 'ヴ', 'ヴ': 'ヷ', 'ヷ': 'ウ',
        'ヰ': 'ヸ', 'ヸ': 'ヰ',
        'ヱ': 'ヹ', 'ヹ': 'ヱ',
        'ヲ': 'ヺ', 'ヺ': 'ヲ',
        'ヽ': 'ヾ', 'ヾ': 'ヽ',
        'あ': 'ぁ', 'ぁ': 'あ',
        'い': 'ぃ', 'ぃ': 'い',
        'う': 'ぅ', 'ぅ': 'ゔ', 'ゔ': 'う',
        'え': 'ぇ', 'ぇ': 'え',
        'お': 'ぉ', 'ぉ': 'お',
        'や': 'ゃ', 'ゃ': 'や',
        'ゆ': 'ゅ', 'ゅ': 'ゆ',
        'よ': 'ょ', 'ょ': 'よ',
        'わ': 'ゎ', 'ゎ': 'わ',
        'ア': 'ァ', 'ァ': 'ア',
        'イ': 'ィ', 'ィ': 'イ',
        'ウ': 'ゥ', 'ゥ': 'ウ',
        'エ': 'ェ', 'ェ': 'エ',
        'オ': 'ォ', 'ォ': 'オ',
        'ヤ': 'ャ', 'ャ': 'ヤ',
        'ユ': 'ュ', 'ュ': 'ユ',
        'ヨ': 'ョ', 'ョ': 'ヨ',
        'ワ': 'ヮ', 'ヮ': 'ワ',
    };

    this._thaiCombiners = ['◌​ุ', '◌​ึ', '◌​ำ', '◌​ั', '◌​ี', '◌​้', '◌​่', '◌​ิ', '◌​ื',
                            '◌​ู', '◌​ํ', '◌​๊',  '◌​็', '◌​๋', '◌​ฺ', '◌​์'];

    // @SW00156927 - workaround replacing ㄧ (u+3127) with ー (u+30FC)
	this._bopomofoCharMap = {
		"ㄅ" : "1",
		"ㄆ" : "Q",
		"ㄇ" : "A",
		"ㄈ" : "Z",
		"ㄉ" : "2",
		"ㄊ" : "W",
		"ㄋ" : "S",
		"ㄌ" : "X",
		"ㄎ" : "D",
		"ㄍ" : "E",
		"ㄏ" : "C",
		"ㄐ" : "R",
		"ㄑ" : "F",
		"ㄒ" : "V",
		"ㄓ" : "5",
		"ㄔ" : "T",
		"ㄕ" : "G",
		"ㄖ" : "B",
		"ㄗ" : "Y",
		"ㄘ" : "H",
		"ㄙ" : "N",
		"ー" : "U",
		"ㄨ" : "J",
		"ㄩ" : "M",
		"ㄚ" : "8",
		"ㄛ" : "I",
		"ㄜ" : "K",
		"ㄝ" : ",",
		"ㄞ" : "9",
		"ㄟ" : "O",
		"ㄠ" : "L",
		"ㄡ" : ".",
		"ㄢ" : "0",
		"ㄣ" : "P",
		"ㄤ" : ";",
		"ㄥ" : "/",
		"ㄦ" : "-",
		"ˊ" : "6",
		"ˇ" : "3",
		"ˋ" : "4",
		"˙" : "7"
	};
    /*
     * This structure holds the information for all keyboard layouts.
     * Within each layout there are 2-6 pieces of information
     * @name        Always Required
     *              String - the name of the layout. This is used in the logic to decide which
     *              layout to switch to when the shift or layout-switch btns are pressed.
     * @buttons     Always Required
     *              String[][] - the text and order of the buttons displayed in the layout.
     * @startRow    Required only if default highlight position isnt the top left key
     *              Integer - the default highlight row index for the layout.
     *              (Row 0 refers to the row containing the input and backspace button).
     * @startCol    Required only if default highlight position isnt the top left key
     *              Integer - the default highlight column index for the layout.
     * @layoutText  Required only if the text is not '1qw'
     *              String - the text displayed in the layout switch key for this layout
     * @shiftText   Required only if text is not '↑'
     *              String - the text displayed in the shift key for this layout
     */
    this._layouts = {
        'en_US' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '\"' ],
                [ '*', '@', '&', '#',  '_', '$', '€', '{', '[', ']',  '}', '' ],
                [ '<', '>', '~',  '`', '%', '^', '—', ':', ';']
            ], layoutText: 'QWE'}
        ],

        'es_MX' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espacio", buttons:[
                [ '@', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '/' ],
                [ '',  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ñ' ],
                [ '',  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '' ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?' ],
                [ '',  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ñ' ],
                [ '',  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '' ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '!', '\'', '#', '$', '%', '&', '_', '(', ')', '^', '\\' ],
                [ '?', '¿', '¬',  '€', '',  '',  '',  '',  '{', '}', '*', '|' ],
                [ '!',  '¡', 'ß', '₱', '',  '',  '',  '',  ';', ':', '`',  '´' ],
                [ '',  '<', '>',  '',  '¢', '',  ',', '.', '-' ]
            ], layoutText: '1az'}
        ],

        'fr_CN' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espace", buttons:[
                [ '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '{' ],
                [ '+', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '}' ],
                [ '|', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '<', '>' ],
                [ '?', 'z', 'x', 'c', 'v', 'b', 'n', 'm',  '.' ]
            ], startRow: 2, startCol: 1, layoutText: 'à/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'μ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '§' ],
                [ '$', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '£' ],
                [ '¢', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '[', ']' ],
                [ '^', 'Z', 'X', 'C', 'V', 'B', 'N', 'M',  '' ]
            ], startRow: 2, startCol: 1, layoutText: 'à/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '€', '!', '%', '#', '\'', '(', '&', '=', '-', '@',  ')', '_' ],
                [ 'à', 'À', 'â', 'Â', 'è',  'È', 'é', 'É', 'ê', 'Ê',  'ë', 'Ë' ],
                [ 'ô', 'Ô', 'ù', 'Ù', 'û',  'Û', 'ü', 'Ü', '?', '\\', '/', '+' ],
                [ 'î', 'Î', 'ï', 'Ï', 'ç',  'Ç', ',', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '1az'}
        ],

        'en_UK' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '\"' ],
                [ '*', '@', '&', '#',  '_', '$', '€', '{', '[', ']',  '}', '' ],
                [ '<', '>', '~',  '`', '%', '^', '—', ':', ';']
            ], layoutText: 'QWE'}
        ],

        'da_DK' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mellemrum", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', '' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'æ', 'ø', '' ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Æ', 'Ø', '' ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '§',  '!', '\'', '#', '',  '%', '&', '/', '(', ')', '=', '?' ],
                [ '\\', '@', '€',  '$', '',  '',  '{', '[', ']', '}', '+', '|' ],
                [ '',   '',  '',   '',  '',  '',  '',  '',  ';', ':', '_', '*' ],
                [ '<',  '>', '',   '',  '',  '',  ',', '.', '-']
            ]}
        ],

        'de_DE' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "leertaste", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', '+' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', '#' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: '@-€'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', '*' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', '\'' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '@-€', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '',  '!', '\'', '§', '$', '%', '&', '/', '(', ')', '=', '?' ],
                [ '@', '',  '',   '€', '',  '',  '',  '{', '[', ']', '}', '\\' ],
                [ '',  '',  '',   '',  '',  '',  '',  '',  '',  '',  '',  '' ],
                [ '<', '>', '',   '',  '',  '',  '', '-', '_' ]
            ], startRow: 1, startCol: 1, layoutText: '1az'}
        ],

        'es_ES' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espacio", buttons:[
                [ '@', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '/' ],
                [ '',  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ñ' ],
                [ '',  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '' ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?' ],
                [ '',  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ñ' ],
                [ '',  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', '' ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '!', '\'', '#', '$', '%', '&', '_', '(', ')', '^', '\\' ],
                [ '',  '',  '¬',  '€', '',  '',  '',  '',  '{', '}', '*', '|' ],
                [ '',  '',  'ß',  '',  '',  '',  '',  '',  ';', ':', '`',  '´' ],
                [ '',  '<', '>',  '',  '¢', '',  ',', '.', '-' ]
            ]}
        ],

        'fr_FR' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espace", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ '',  'a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '' ],
                [ '',  'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', '' ],
                [ '',  'w', 'x', 'c', 'v', 'b', 'n', '',  '' ]
            ], startRow: 2, startCol: 1, layoutText: 'à/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ '',  'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '' ],
                [ '',  'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', '' ],
                [ '',  'W', 'X', 'C', 'V', 'B', 'N', '',  '' ]
            ], startRow: 2, startCol: 1, layoutText: 'à/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '€', '!', '%', '#', '\'', '(', '&', '=', '-', '@', ')', '_' ],
                [ 'à', 'À', 'â', 'Â', 'è',  'È', 'é', 'É', 'ê', 'Ê', 'ë', 'Ë' ],
                [ 'ô', 'Ô', 'ù', 'Ù', 'û',  'Û', 'ü', 'Ü', '?', '.', '/', '+' ],
                [ 'î', 'Î', 'ï', 'Ï', 'ç',  'Ç', ',', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '1az'}
        ],

        'fi_FI' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "väli", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', '' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', '' ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 0, layoutText: 'Ø/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', '' ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 0, layoutText: 'Ø/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '§', '!', '\'', '#', '',  '%', '&', '/', '(', ')', '=',  '?' ],
                [ 'ß', '@', '€',  '$', 'Þ', 'þ', '',  '',  'œ', 'Œ', '\\', '/' ],
                [ 'ə', 'Ə', 'đ',  'Đ', 'ø', 'Ø', 'æ', 'Æ', ';', ':', '_',  '' ],
                [ 'ʒ', 'Ʒ', 'ŋ',  'Ŋ', 'μ', 'ĸ', ',', '.', '-' ]
            ]}
        ],

        'it_IT' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spazio", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '\'', 'ì' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'è',  '+' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ò', 'à',  'ù' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'é', '*' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ç', '°', '§' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!',  '\'', '£', '$', '%', '&', '/', '(', ')', '=', '', '' ],
                [ '@',  '',   '€', '',  '',  '',  '{', '[', ']', '}', '', '' ],
                [ '\\', '|',  '#', '',  '',  '',  '',  '',  '',  '',  '', '' ],
                [ '<',  '>',  '',  '',  '',  '',  '',  '-', '_' ]
            ], layoutText: '1az'}
        ],

        'pt_PT' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espaço", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ô', 'ú' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'õ', 'ó' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', 'é', 'á' ],
                [ 'í', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ã' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Ô', 'Ú' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Õ', 'Ó' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', 'É', 'Á' ],
                [ 'Í', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ã' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '#', '$', '%', '&', '/', '(', ')', '=', 'Ü', 'ü' ],
                [ '@', '§',  '€', '{', '[', ']', '}', '+', '*', 'ê', 'â', 'à' ],
                [ '',  '',   '',  '',  '',  '',  '',  '?', '_', 'Ê', 'Â', 'À' ],
                [ '<', '>',  '',  '',  ';', ':', ',', '.', '-' ]
            ]}
        ],

        'pt_BR' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "space", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ô', 'ú' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'õ', 'ó' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', 'é', 'á' ],
                [ 'í', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ã' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Ô', 'Ú' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Õ', 'Ó' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç', 'É', 'Á' ],
                [ 'Í', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ã' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '@', '#', '$', '%', '\'', '&', '*', '(', ')', 'Ü', 'ü' ],
                [ '', '€', '¢', '¬', '_', '-', '+', '=', '§', 'ê', 'â', 'à' ],
                [ '',  '',   '',  '',  '',  '{',  '[',  ']', '}', 'Ê', 'Â', 'À' ],
                [ '', '<', '>',  ';',  ':',  ',', '.', '?', '/' ]
            ], layoutText: '1qw'}
        ],

        'nl_NL' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spatie", buttons:[
                [ '@', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '/' ],
                [ '',  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '' ],
                [ '',  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '',  '' ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '§', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?' ],
                [ '',  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '' ],
                [ '',  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '',  '' ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 1, layoutText: '%&!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '',  '!', '\'', '#', '$', '%', '&', '_', '(', ')', '',  '\\' ],
                [ '',  '',  '',   '€', '',  '',  '',  '',  '{', '}', '*', '|' ],
                [ '',  '',  'ß',  '',  '',  '',  '',  '',  ';', ':', '',  '' ],
                [ '<', '>', '',   '¢', '',  '',  ',', '.', '-' ]
            ], startRow: 1, startCol: 1}
        ],

        'ru_RU' : [
            {name:'lettersSmall', style:'sixTen', spaceText: "Пробел", buttons:[
                [ 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з' ],
                [ 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л' ],
                [ 'д', 'ж', 'э', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь' ],
                [ 'б', 'ю', 'є', 'ґ', 'i', 'ï', 'ё' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'sixTen', buttons:[
                [ 'Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З' ],
                [ 'Х', 'Ъ', 'Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л' ],
                [ 'Д', 'Ж', 'Э', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь' ],
                [ 'Б', 'Ю', 'Є', 'Ґ', 'Ï', 'I', 'Ё' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTen', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '*' ],
                [ '@', '&', '#', '$',  '€', '',  '',  '',  '',  ''  ],
                [ '',  '',  '',  '',   '',  '',  '' ]
            ], layoutText: 'ABC'}
        ],

        'sv_SE' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "utrymme", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', '' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', '_' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: '@€§'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Å', '*' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', '-' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '@€§', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '#', '§', '%', '&', '/', '(', ')', '=', '',  '' ],
                [ '', '',   '@', '£', '$', '€', '',  '{', '[', ']', '}', '\\' ],
                [ '',  '',  '',   '',  '',  '',  '',  '',  '',  '',  '',  '' ],
                [ '<', '>', '',   '',  '',  '',  '',  '',  '' ]
            ]}
        ],

        'no_NO' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mellomrom", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '\\' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'å', '' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ø', 'æ', '' ],
                [ '',  'y', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 0, layoutText: '$-:'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Å', '' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ø', 'Æ', '' ],
                [ '',  'Y', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 0, layoutText: '$-:', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '#', '§', '%', '&', '*', '(', ')', '=', '',  '/' ],
                [ '',  '@',  '',  '$', '',  '',  '{', '[', ']', '}', '',  '' ],
                [ '',  '',   '€', '',  '',  '',  '',  '',  ';', ':', '_', '' ],
                [ '<', '>',  '',  '',  '',  '',  ',', '.', '-' ]
            ]}
        ],

        'cs_CS' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mezera", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '!' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ú', 'ˇ' ],
                [ '',  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ů', '' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: 'č/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '!' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ú', 'ˇ' ],
                [ '',  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ů', '' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: 'č/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ 'ě', 'š', 'č', 'ř', 'ž', 'ý', 'á', 'í', 'é', 'ď', 'ň', 'ó' ],
                [ 'Ě', 'Š', 'Č', 'Ř', 'Ž', 'Ý', 'Á', 'Í', 'É', 'Ď', 'Ň', 'Ó' ],
                [ '¨', 'ť', 'ú', 'ů', '/', '(', ')', '+', '=', '-', '_', '' ],
                [ 'Ť', 'Ú', 'Ů', '$', '€', '%', '&', '@', '' ]
            ]}
        ],

        'sk_SK' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "medzera", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '%', '!' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ú', 'ä' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ô', 'ˇ', 'ň' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: 'č@€'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '=', '+' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ú', 'Ä' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ô', '*', 'Ň' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', '?', ':' ]
            ], startRow: 2, startCol: 0, layoutText: 'č@€', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ ';',  'ľ', 'š', 'č', 'ť', 'ž', 'ý', 'á', 'í', 'é', 'ď', 'ĺ' ],
                [ '',   'Ľ', 'Š', 'Č', 'Ť', 'Ž', 'Ý', 'Á', 'Í', 'É', 'Ď', 'Ĺ' ],
                [ '\\', '|', '€', '[', ']', 'đ', 'Đ', 'ł', 'Ł', 'ó', 'Ó', '/' ],
                [ '(',  ')', '&', '@', '',  '',  '',  '-', '_' ]
            ]}
        ],

        'hu_HU' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "szóköz", buttons:[
                [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ö', 'ü' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ő', 'ú' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'é', 'á', 'ű' ],
                [ 'í', 'y', 'x', 'c', 'v', 'b', 'n', 'm', 'ó' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Ö', 'Ü' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ő', 'Ú' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'É', 'Á', 'Ű' ],
                [ 'Í', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'Ó' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '§',  '\'', '-', '+', '!', '%', '/', '=', '(', ')', '',  '' ],
                [ '\\', '|',  '',  '',  '',  '',  '',  '',  '',  '',  '÷', '×' ],
                [ '<',  '>',  '#', '[', ']', '',  '',  ';', ':', '*', '$', '€' ],
                [ '&',  '@',  '{', '}', '?', ',', '.', '-', '_' ]
            ]}
        ],

        'tr_TR' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "alan", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i', '' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç' ]
            ], startRow: 2, startCol: 0, layoutText: '@:€'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ', '' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç' ]
            ], startRow: 2, startCol: 0, layoutText: '@:€', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ 'é', '!', '\'', '-', '+', '%', '&', '/', '(', ')', '=', '' ],
                [ '<', '>', '_',  '#', '$', '',  '',  '{', '[', ']', '}', '\\' ],
                [ '@', '',  '€',  '',  '',  '',  '',  '',  '',  ';', ',', '' ],
                [ '',  '',  '',   '',  '',  '',  '',  ':', '.' ]
            ]}
        ],

        'pl_PL' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spacja", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ń', 'ć' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ż', 'ś' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ł', 'ą', 'ó' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', 'ę', 'ź' ]
            ], startRow: 2, startCol: 0, layoutText: '@:?'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Ń', 'Ć' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ż', 'Ś' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ł', 'Ą', 'Ó' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'Ę', 'Ź' ]
            ], startRow: 2, startCol: 0, layoutText: '@:?', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!',  '\'', '#', '$', '%', '&', '/', '(', ')', '=', '?', '+'  ],
                [ '\\', '|',  '',  '',  '',  '',  '€', '',  '',  '',  '÷', '×' ],
                [ '',   'đ',  'Đ', '[', ']', '',  '',  '',  ';', ':', '_', '*' ],
                [ '<',  '>',  '',  '@', '{', '}', ',', '.', '-' ]
            ]}
        ],

        'zh_CN' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'Q',  'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A',  'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ '\'', 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], shiftText: '#+=', layoutText: '123', defaultState: true},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '*' ],
                [ '',  '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '#+=', layoutText: 'abc'},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']',  '{', '}',   '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~',   '<', '>', '€', '£', '^', '•' ],
                [ '',  '.',  ',', '¥', '?', '!', '',  '' ]
            ], shiftText: '123', layoutText: 'abc'}
        ],

        'zh_TW' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'Q',  'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A',  'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ '\'', 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], shiftText: '#+=', layoutText: '123', defaultState: true},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '"' ],
                [ '',  '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '#+=', layoutText: 'abc'},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']',  '{', '}',   '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~',   '<', '>', '€', '£', '^', '•' ],
                [ '',  '.',  ',', '¥', '?', '!', '',  '' ]
            ], shiftText: '123', layoutText: 'abc'}
        ],

        'cn_HK' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'Q',  'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A',  'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ '\'', 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], shiftText: '#+=', layoutText: '123', defaultState: true},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '"' ],
                [ '',  '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '#+=', layoutText: 'abc'},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']',  '{', '}',   '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~',   '<', '>', '€', '£', '^', '•' ],
                [ '',  '.',  ',', '¥', '?', '!', '',  '' ]
            ], shiftText: '123', layoutText: 'abc'}
        ],

        'ja_JP_ABC' : [
            {name:'kana_letters', style:'suggSevenTen', spaceText: "スペース", buttons:[
                [ 'あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ' ],
                [ 'い', 'き', 'し', 'ち', 'に', 'ひ', 'み', '', 'り', 'を' ],
                [ 'う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', 'ん' ],
                [ 'え', 'け', 'せ', 'て', 'ね', 'へ', 'め', '', 'れ', 'ー' ],
                [ 'お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ' ]
            ], layoutText: '123', defaultState: true},
            {name:'kana_caps', buttons:[]},
            {name:'kana_symbols', style:'suggSevenTen', buttons:[
                [ '1', '2',  '3', '4', '5',  '6', '7', '8', '9', '0' ],
                [ '_', '\\', ';', '|', '<',  '>', '¥', '^',  '"', '\'' ],
                [ '[', ']',  '{', '}', '#',  '%', '-', '*', '+', '=' ],
                [ '',  '/',  ':', '@', '(',  ')', '$', '',  '「', '」',  ],
                [ '',  '。',  '、', '?', '!', '&', '.', ',', '`' ]
            ], layoutText: 'あいう'}
        ],

        'mn_TW' : [
            {name:'taiw_letters', style:'suggSevenEleven', spaceText: "空間", buttons:[
                [ 'ㄅ', 'ㄉ', 'ˇ', 'ˋ', 'ㄓ', 'ˊ', '˙', 'ㄚ', 'ㄞ', 'ㄢ', 'ㄦ' ],
                [ 'ㄆ', 'ㄊ', 'ㄍ', 'ㄐ', 'ㄔ', 'ㄗ', 'ー', 'ㄛ', 'ㄟ', 'ㄣ' ],
                [ 'ㄇ', 'ㄋ', 'ㄎ', 'ㄑ', 'ㄕ', 'ㄘ', 'ㄨ', 'ㄜ', 'ㄠ', 'ㄤ' ],
                [ 'ㄈ', 'ㄌ', 'ㄏ', 'ㄒ', 'ㄖ', 'ㄙ', 'ㄩ', 'ㄝ', 'ㄡ', 'ㄥ' ],
                [ '', '', '', '', '', '', '', '', '' ]
            ], layoutText: '符號', defaultState: true},
            {name:'taiw_caps', buttons:[]},
            {name:'taiw_symbols', style:'suggSevenEleven', buttons:[
                [ '1', '2',  '3', '4', '5',  '6', '7', '8', '9', '0', '' ],
                [ '!', '@', '#', '&', '*',  '(', ')',  '_', '|', '/' ],
                [ '+', '-',  '=', '{', '}', ';', ':', '\'', '<', '>' ],
                [ ',',  '.',  '?', '[', ']',  '', '', '', '', '' ],
                [ '',  '',  '', '', '', '', '', '', '' ]
            ], layoutText: '注音'}
        ],

        'ar_SA' : [
            {name:'arabic_letters', style:'sixTen', spaceText: "مسافة", buttons:[
                [ 'ض' ,'ص' ,'ث' ,'ق' ,'ف' ,'غ' ,'ع' ,'ه' ,'خ' ,'ح' ],
                [ 'ج' ,'د' ,'ش' ,'س' ,'ي' ,'ب' ,'ل' ,'ا' ,'ت' ,'ن' ],
                [ 'م' ,'ك' ,'ط' ,'ئ'  ,'ء' ,'ؤ' ,'ر' ,'ى' ,'ة' ,'و' ],
                [ 'ز'  ,'ظ',  '',  '',  '',  '',  '' ]
            ], startCol: 10, shiftText: '', layoutText: '123', defaultState: true},
            {name:'arabic_caps', buttons:[]},
            {name:'arabic_symbols', style:'sixTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ 'أ' ,'إ'  ,'ذ',  ':', '.', ',', ';', '-', '(', ')' ],
                [ '?', '!', '%', '@', '&', '#', '_', '=', '+', '' ],
                [ '',  '',  '',  '',  '',  '',  '' ]
            ], shiftText: '', layoutText: 'ا ب ج'}  //These are the arabic letters for ABC.. not QWE. the layout is QWE style.
        ],

        'bg_BG' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "Интервал", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '',  ''  ],
                [ 'ы', 'у', 'е', 'и', 'ш', 'щ', 'к', 'с', 'д', 'з', 'ц', '§' ],
                [ 'ь', 'я', 'а', 'о', 'ж', 'г', 'т', 'н', 'в', 'м', 'ч', 'ю' ],
                [ 'й', 'б', 'э', 'ф', 'х', 'п', 'р', 'л', 'ъ' ]
            ], startRow: 2, startCol: 0, layoutText: '!@€'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '',  ''  ],
                [ 'Ы', 'У', 'Е', 'И', 'Ш', 'Щ', 'К', 'С', 'Д', 'З', 'Ц', '§' ],
                [ 'Ь', 'Я', 'А', 'О', 'Ж', 'Г', 'Т', 'Н', 'В', 'М', 'Ч', 'Ю' ],
                [ 'Й', 'Б', 'Э', 'Ф', 'Х', 'П', 'Р', 'Л', 'Ъ' ]
            ], startRow: 2, startCol: 0, layoutText: '!@€', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '?', '+', '%', '=', ':', '/',  '_', '', '|', 'ˇ', '~' ],
                [ '',  '(', '[', ']', ')', '-', '\'', '`', '', '',  '',  ''  ],
                [ '@', '&', '#', '$',  '€', '',  '',  '',  '', '',  '',  ''  ],
                [ '',  '',  '',  '',   '',  '',  ',', '.', '' ]
            ], layoutText: 'ABC'}
        ],

        'el_GR_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ' ],
                [ 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ' ],
                [ 'υ', 'φ', 'χ', 'ψ', 'ω', '',  '' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ' ],
                [ 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ' ],
                [ 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω', '',  '' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!' ],
                [ '*', '@', '&', '#',  '_', '$',  '€' ],
            ], layoutText: 'ABC'}
        ],

        'et_EE' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "tühik", buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ''  ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ü', 'õ' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', ''  ],
                [ '',  'z', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 0, layoutText: 'ž/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '',  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ''  ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ü', 'Õ' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', ''  ],
                [ '',  'Z', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 0, layoutText: 'ž/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '',  '!', '\'', '#', '', '%', '&', '/', '(', ')', '=',  '?' ],
                [ '*', '@', '€',  '$', '', '',  '{', '[', ']', '}', '\\', '/' ],
                [ 'Š',  'š', '',   '',  '', '',  '',  '',  ';', ':', '_',  '+' ],
                [ '',  'Ž', 'ž',  '',  '', '',  ',', '.', '-' ]
            ], startRow: 2, startCol: 0}
        ],

        'he_IL_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "רווח", buttons:[
                [ 'י', 'ט', 'ח', 'ז', 'ו', 'ה', 'ד', 'ג', 'ב', 'א' ],
                [ 'ק', 'צ', 'פ', 'ע', 'ס', 'נ', 'מ', 'ל', 'כ' ],
                [ '',  'ן', 'ם', 'ך', 'ת', 'ש', 'ר']
            ], startCol: 10, layoutText: '123', defaultState: true},
            {name:'lettersCaps', buttons:[]},
            {name:'symbols1', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7',  '8', '9', '0' ],
                [ '/', '.', ',', '\'', '-', '(', 'ף', 'ץ', '' ],
                [ ')', '?', '!', '_', '@', '&', '#' ]
            ], layoutText: 'אבג'}
        ],

        'hr_HR' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "razmak", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '',  '' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'š', 'đ' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'č', 'ć', 'ž' ],
                [ '',  'y', 'x', 'c', 'v', 'b', 'n', 'm', '' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Š', 'Ð' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Č', 'Ć', 'Ž' ],
                [ '',  'Y', 'X', 'C', 'V', 'B', 'N', 'M', '' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!',  '\'', '#', '$', '%', '&', '/', '(', ')', '=', '?', '+' ],
                [ '\\', '|',  '',  '',  '',  '',  '',  '',  '',  '',  '÷', '×' ],
                [ '',   '',   '',  '[', ']', '',  '',  '',  ';', ':', '_', '*' ],
                [ '@',  '{',  '}', '§', '<', '>', ',', '.', '-' ]
            ]}
        ],

        'lt_LT' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "tarpas", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ļ', 'ū' ],
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ą', 'ž' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ų', 'ė', 'ę' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'č', 'š' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Ļ', 'Ū' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ą', 'Ž' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ų', 'Ė', 'Ę' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Č', 'Š' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '@', '#', '$', '%', '\'', '&', '*', '(', ')', '-',  '+' ],
                [ '',  '',  '€', '',  '',  '',   '',  '',  '{', '}', '[',  ']' ],
                [ '',  'ß', '',  '',  '',  '',   '',  '',  ';', ':', '\\', '|' ],
                [ '<', '>', '',  '',  '',  '_',  ',', '.', '?' ]
            ]}
        ],

        'lv_LV' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "atstarpe", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'f', 'ķ' ],
                [ 'ū', 'g', 'j', 'r', 'm', 'v', 'n', 'z', 'ē', 'č', 'ž', 'h' ],
                [ '',  'š', 'u', 's', 'i', 'l', 'd', 'a', 't', 'e', 'c', ''  ],
                [ 'ģ', 'ņ', 'b', 'ī', 'k', 'p', 'o', 'ā', 'ļ' ]
            ], startRow: 2, startCol: 0, layoutText: 'ŗ/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'F', 'Ķ' ],
                [ 'Ū', 'G', 'J', 'R', 'M', 'V', 'N', 'Z', 'Ē', 'Č', 'Ž', 'H' ],
                [ '',  'Š', 'U', 'S', 'I', 'L', 'D', 'A', 'T', 'E', 'C', ''  ],
                [ 'Ģ', 'Ņ', 'B', 'Ī', 'K', 'P', 'O', 'Ā', 'Ļ' ]
            ], startRow: 2, startCol: 0, layoutText: 'ŗ/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '@',  '#', '$', '%', '\\', '&', '*', '(', ')', '-', '=' ],
                [ 'q', '\'', '€', 'ŗ', 'w', 'y',  '',  '_', '{', '}', '[', ']' ],
                [ 'Q', '',   '',  'Ŗ', 'W', 'Y',  '<', '>', ';', ':', '?', ''  ],
                [ 'x', 'X',  '',  '',  'õ', 'Õ',  ',', '.', '/' ]
            ], layoutText: '1ūg'}
        ],

        'ms_MY' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '' ],
                [ '*', '@', '&', '#',  '_', '$', '€', '{', '[', ']',  '}', '' ],
                [ '<', '>', '',  '',   '%', '^', '—', '',  '']
            ], layoutText: 'QWE'}
        ],

        'ro_RO' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spaţiu", buttons:[
                [ 'â', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ă', 'î' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'ţ', '-' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'Â', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ă', 'Î' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'Ţ', '_' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '',  '!', '\'', '#', '$', '%', '&', '/',  '(', ')', '=', '*' ],
                [ '',  '',  '€',  '',  '',  '',  '',  '',   '',  '',  '{', '}' ],
                [ '',  '',  '',   '',  '',  '',  '',  '\\', '|', '[', ']', 'ß' ],
                [ '÷', '×', '',   '',  '',  '',  '<', '>',  '@' ]
            ],  startRow: 1, startCol: 1}
        ],

        'sr_RS' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "razmak", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '',  'ž' ],
                [ 'q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'š', 'đ' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'č', 'ć', '-' ],
                [ 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '',  'Ž' ],
                [ 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Š', 'Ð' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Č', 'Ć', '_' ],
                [ 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ';', ':' ]
            ], startRow: 2, startCol: 0, layoutText: '%/!', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!',  '\'', '#', '$', '%', '&', '/', '(', ')', '=', '?', '*' ],
                [ '\\', '|',  '€', '',  '',  '',  '',  '',  '',  '',  '÷', '×' ],
                [ '',   '',   '',  '[', ']', '',  '',  'ł', 'Ł', '',  '',  'ß'  ],
                [ '<',  '>',  '',  '',  '@', '{', '}', '',  '' ]
            ]}
        ],

        'th_TH' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "เว้นวรรค", buttons:[
                [ 'ๅ', '-', 'ภ',  'ถ', '◌​ุ', '◌​ึ', 'ค', 'ต', 'จ', 'ข', 'ช', 'ฃ' ],
                [ 'ๆ', 'ไ', '◌​ำ', 'พ', 'ะ', '◌​ั', '◌​ี', 'ร', 'น', 'ย', 'บ', 'ล' ],
                [ 'ฟ', 'ห', 'ก',  'ด', 'เ',  '◌​้', '◌​่', 'า', 'ส', 'ว', 'ง', 'ผ' ],
                [ 'ป', 'แ', 'อ',  '◌​ิ', '◌​ื', 'ท', 'ม',  'ใ', 'ฝ' ]
            ], startRow: 2, layoutText: '@,$', defaultState: true},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '◌​ู', 'ฅ' ],
                [ '/', '-', 'ฎ', 'ฑ', 'ธ', '◌​ํ', '◌​๊',  'ณ', 'ฯ', 'ญ', 'ฐ', ',' ],
                [ 'ฤ', 'ฆ', 'ฏ', 'โ', 'ฌ', '◌​็', '◌​๋',  'ษ',  'ศ', 'ซ', '.', '(' ],
                [ ')', 'ฉ', 'ฮ', '◌​ฺ', '◌​์', '?', 'ฒ',  'ฬ', 'ฦ' ]
            ], layoutText: '@,$'},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '<', '>', '!', '#', '$', '*', '%', '{', '[', ']', '}', '\\' ],
                [ '@', '_', '€', '฿', '',  '',  '',  '',  '',  '',  '',  '' ],
                [ '',  '',  '',  '',  '',  '',  '',  '',  '',  ';', ',', '' ],
                [ '',  '',  '',  '',  '',  '',  '',  ':', '.' ]
            ], layoutText: 'ๅ-ภ'}
        ],

        'id_ID' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "spasi", buttons:[
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '' ],
                [ '*', '@', '&', '#',  '_', '$', '€', '{', '[', ']',  '}', '' ],
                [ '<', '>', '',  '',   '%', '^', '—', '',  '']
            ], layoutText: 'QWE'}
        ],

        'en_US_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ],
                [ 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ],
                [ 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1',  '2', '3', '4',  '5', '6', '7', '8', '9', '0', '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '"' ],
                [ '*',  '@', '&', '#',  '_', '$', '€', '{', '[', ']', '}', '' ],
                [ '<', '>', ';', ':', '%', '^', '—', '~', '`' ]
            ], layoutText: 'ABC'}
        ],

        'hex' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE', defaultState: true},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE'},
            {name:'symbols1', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE'}
        ],

        'numeric' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '', '', '', '', '', '', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE', defaultState: true},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '', '', '', '', '', '', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE'},
            {name:'symbols1', style:'fiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '', '', '', '', '', '', '', '', '' ],
                [ '', '', '', '', '', '', '' ]
            ], layoutText: 'QWE'}
        ],
        'wpa' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
                [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ],
                [ 'z', 'x', 'c', 'v', 'b', 'n', 'm' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P' ],
                [ 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L' ],
                [ 'Z', 'X', 'C', 'V', 'B', 'N', 'M' ]
            ], layoutText: '123', defaultState: true},  //TODO: move default state to lowercase SW00126576
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4',  '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '\"' ],
                [ '*', '@', '&', '#',  '_', '$', '€', '{', '[', ']',  '}', '' ],
                [ '<', '>', '~',  '`',   '%', '^', '—', ':', ';']
            ], layoutText: 'QWE'}
        ],

        'en_AU_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ],
                [ 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ],
                [ 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1',  '2', '3', '4',  '5', '6', '7', '8', '9', '0', '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '"' ],
                [ '*',  '@', '&', '#',  '_', '$', '€', '{', '[', ']', '}', '' ],
                [ '<', '>', ';', ':', '%', '^', '—', '~', '`' ]
            ], layoutText: 'ABC'}
        ],

        'en_UK_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ],
                [ 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ],
                [ 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1',  '2', '3', '4',  '5', '6', '7', '8', '9', '0', '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '"' ],
                [ '*',  '@', '&', '#',  '_', '$', '€', '{', '[', ']', '}', '' ],
                [ '<', '>', ';', ':', '%', '^', '—', '~', '`' ]
            ], layoutText: 'ABC'}
        ],

        'ms_MY_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "space", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ],
                [ 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ],
                [ 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '' ],
                [ '*', '@', '&', '#', '_', '$', '€', '{', '[', ']', '}', '' ],
                [ '<', '>', ':', ';', '%', '^', '—', '~', '']
            ], layoutText: 'ABC'}
        ],

        'id_ID_ABC' : [
            {name:'lettersSmall', style:'fiveTen', spaceText: "spasi", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j' ],
                [ 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's' ],
                [ 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'fiveTen', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [ 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',  '+', '=' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '\\', '|', '' ],
                [ '*', '@', '&', '#', '_', '$', '€', '{', '[', ']', '}', '' ],
                [ '<', '>', '',  '', '%', '^', '—', '', '']
            ], layoutText: 'ABC'}
        ],

        'zh_CN_ABC' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [  '\'', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], shiftText: '[]}', layoutText: '123'},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '*' ],
                [ '', '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '#+=', layoutText: 'ABC', defaultState: true},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']', '{', '}', '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~', '<', '>', '€', '£', '^', '•' ],
                [ '', '.', ',', '￥', '?', '!', '', '' ]
            ], shiftText: '123', layoutText: 'ABC'}
        ],

        'zh_TW_ABC' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [  '\'', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], shiftText: '[]}', layoutText: '123', defaultState: true},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '"' ],
                [ '', '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '[]}', layoutText: 'ABC'},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']', '{', '}', '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~', '<', '>', '€', '£', '^', '•' ],
                [ '', '.', ',', '￥', '?', '!', '', '' ]
            ], shiftText: '123', layoutText: 'ABC'}
        ],

        'cn_HK_ABC' : [
            {name:'letters', style:'suggFiveTen', spaceText: "空格", buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J' ],
                [ 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S' ],
                [  '\'', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
            ], shiftText: '[]{', layoutText: '123', defaultState: true},
            {name:'special1', style:'suggFiveTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '@', '/', ':', ';', '(', ')', '「', '」', '"' ],
                [ '', '。', ',', '、', '?', '!', '',  '' ]
            ], shiftText: '[]{', layoutText: '1AB'},
            {name:'special2', style:'suggFiveTen', buttons:[
                [ '[', ']', '{', '}', '#', '%', '-', '*', '+', '=' ],
                [ '_', '\\', '|', '~', '<', '>', '€', '£', '^', '•' ],
                [ '', '.', ',', '￥', '?', '!', '', '' ]
            ], shiftText: '123', layoutText: '1AB'}
        ],

        'es_MX_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espacio", buttons:[
                [ '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '' ],
                [ '', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', '' ],
                [ '', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'á', 'ç', 'é', '' ],
                [ '', 'í', 'ó', 'ú', 'ü', '', '', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: '~12'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '' ],
                [ '', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', '' ],
                [ '', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Á', 'Ç', 'É', '' ],
                [ '', 'Í', 'Ó', 'Ú', 'Ü', '', '', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: '~12', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '§' ],
                [ '?', '¿', '&', '€', '/', '\\',  '(',  ')',  '{', '}', '*', '|' ],
                [ '!',  '¡', 'ß', '₱', '%', '^', '#', '_', '¬', '-', '`',  '´' ],
                [ '@',  '<', '>', '$', '¢', '\'', '', '', '']
            ], layoutText: 'ABC'}
        ],

        'fr_CN_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espace", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ '', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', '' ],
                [ '', 'w', 'x', 'y', 'z', 'à', 'â', 'ç', 'è', 'é', 'ê', '' ],
                [ 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü', '' ]
            ], layoutText: '~12'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ '', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', '' ],
                [ '', 'W', 'X', 'Y', 'Z', 'À', 'Â', 'Ç', 'È', 'É', 'Ê', '' ],
                [ 'Ë', 'Î', 'Ï', 'Ô', 'Œ', 'Ù', 'Û', 'Ü', '' ]
            ], layoutText: '~12', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '§' ],
                [ '?', '+', '&', '=', '[', ']', '(', ')', '{', '}', '"', '|' ],
                [ '!', 'µ', '£', '€', '%', '^', '#', '_', ';', ':', '\\',  '/' ],
                [ '@', '<', '>', '$', '¢', '\'', ',', '.', '-']
            ], layoutText: 'ABC'}
        ],

        'pt_PT_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espaço", buttons:[
                [ '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '' ],
                [ '', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', '' ],
                [ '', 'u', 'v', 'w', 'x', 'y', 'z', 'à', 'á', 'â', 'ã', '' ],
                [ 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü']
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '' ],
                [ '', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', '' ],
                [ '', 'U', 'V', 'W', 'X', 'Y', 'Z', 'À', 'Á', 'Â', 'Ã', '' ],
                [ 'Ç', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú', 'Ü']
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ '!', '\'', '#', '$', '%', '&', '/', '(', ')', '=', '', '' ],
                [ '@', '§', '€', '{', '[', ']', '}', '?', '_', '+', '*', '' ],
                [ '<', '>', '', '', ';', ':', ',', '.', '-']
            ], layoutText: 'ABC'}
        ],

        'pt_BR_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "space", buttons:[
                [ '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '' ],
                [ '', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', '' ],
                [ '', 'u', 'v', 'w', 'x', 'y', 'z', 'à', 'á', 'â', 'ã', '' ],
                [ 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü']
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '' ],
                [ '', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', '' ],
                [ '', 'U', 'V', 'W', 'X', 'Y', 'Z', 'À', 'Á', 'Â', 'Ã', '' ],
                [ 'Ç', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú', 'Ü']
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ '!', '@', '#', '$', '%', '\'', '&', '*', '(', ')', '_', '+' ],
                [ '', '', '€', '¢', '¬', '{', '[', ']', '}', '-', '=', '§' ],
                [ '', '<', '>', ';', ':', ',', '.', '?', '/' ]
            ], layoutText: 'ABC'}
        ],

        'de_DE_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "leertaste", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ''],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x' ],
                [ '', 'y', 'z', 'ä', 'ö', 'ü', 'ß', ',', '.' ]
            ], startRow: 2, layoutText: '!\'§'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ''],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X' ],
                [ '', 'Y', 'Z', 'Ä', 'Ö', 'Ü', 'ß', ';', ':' ]
            ], startRow: 2, layoutText: '!\'§', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '', '!', '\'', '§', '$', '%', '&', '/', '(', ')', '=', '?' ],
                [ '*', '+', '#', '€', '', '', '', '{', '[', ']', '}', '\\' ],
                [ '', '', '', '', '', '', '', '', '', '', '', ''],
                [ '@', '<', '>', '', '', '', '', '-', '_' ]
            ], startRow: 1, startCol: 1, layoutText: '1AB'}
        ],

        'it_IT_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spazio", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x' ],
                [ 'y', 'z', 'à', 'è', 'é', 'ì', 'ò', 'ù', '' ]
            ], startRow: 2, layoutText: '!\'£'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X' ],
                [ 'Y', 'Z', '', '', '', '', '', '', '' ]
            ], startRow: 2, layoutText: '!\'£', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '£', '$', '%', '&', '/', '(', ')', '=', '', '§' ],
                [ '@', '?', '€', '', '', '', '{', '[', ']', '}', '*', '' ],
                [ '\\', '|', '', '', '', '', '#', '_', ':', ';', '', '' ],
                [ '<', '>', 'ç', '°', '+', '\'', ',', '.', '-']
            ], layoutText: '1AB'}
        ],

        'nl_NL_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spatie", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x' ],
                [ '', 'y', 'z', 'ä', 'ë', 'ï', 'ö', 'ü', '' ],
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X' ],
                [ '', 'Y', 'Z', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü', '' ],
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '', '!', '\'', '#', '$', '%', '&', '_', '(', ')', '\\', '§' ],
                [ '', '', '', '€', '', '', '', '', '{', '}', '*', '|' ],
                [ '', '', 'ß', '', '', '', '', '', ';', ':', '', '' ],
                [ '@', '<', '>', '¢', '/', '?', ',', '.', '-' ]
            ], startRow: 1, startCol: 1, layoutText: '1AB'}
        ],

        'cs_CS_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mezera", buttons:[
                [ 'a', 'á', 'b', 'c', 'č', 'd', 'ď', 'e', 'é', 'ě', 'f', 'g' ],
                [ 'h', 'i', 'í', 'j', 'k', 'l', 'm', 'n', 'ň', 'o', 'ó', 'p' ],
                [ '', 'q', 'r', 'ř', 's', 'š', 't', 'ť', 'u', 'ú', 'ů', '' ],
                [ 'v', 'w', 'x', 'y', 'ý', 'z', 'ž', ',', '.' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G' ],
                [ 'H', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P' ],
                [ '', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', '' ],
                [ 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž', ';', ':' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ '[', ']', '', '', '', '', '', '', '', '', '', '' ],
                [ '¨', 'ˇ', '?', '!', '/', '(', ')', '+', '=', '-', '_', '' ],
                [ '@', '#', '~', '$', '€', '%', '&', '', '' ]
            ], layoutText: 'AÁB'}
        ],

        'sk_SK_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "medzera", buttons:[
                [ 'a', 'á', 'ä', 'b', 'c', 'č', 'd', 'ď', 'e', 'é', 'f', 'g' ],
                [ 'h', 'i', 'í', 'j', 'k', 'l', 'ĺ', 'ľ', 'm', 'n', 'ň', 'o' ],
                [ 'ó', 'ô', 'p', 'q', 'r', 'ŕ', 's', 'š', 't', 'ť', 'u', 'ú' ],
                [ 'v', 'w', 'x', 'y', 'ý', 'z', 'ž', ',', '.' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'A', 'Á', 'Ä', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'F', 'G' ],
                [ 'H', 'I', 'Í', 'J', 'K', 'L', 'Ĺ', 'Ľ', 'M', 'N', 'Ň', 'O' ],
                [ 'Ó', 'Ô', 'P', 'Q', 'R', 'Ŕ', 'S', 'Š', 'T', 'Ť', 'U', 'Ú' ],
                [ 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž', ';', ':' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ '?', '+', '=', '*', '[', ']', '(', ')', '{', '}', '"', '|' ],
                [ '!', 'ˇ', '€', '[', ']', 'đ', 'Đ', 'ł', 'Ł', '#', '\\', '/' ],
                [ '@', '<', '>', '&', '%', '', '', '-', '_' ]
            ], layoutText: 'AÁÄ'}
        ],

        'pl_PL_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spacja", buttons:[
                [ '', 'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g', '' ],
                [ '', 'h', 'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o', '' ],
                [ '', 'ó', 'p', 'q', 'r', 's', 'ś', 't', 'u', 'v', 'w', '' ],
                [ '', 'x', 'y', 'z', 'ź', 'ż', '', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', '' ],
                [ '', 'H', 'I', 'J', 'K', 'L', 'Ł', 'M', 'N', 'Ń', 'O', '' ],
                [ '', 'Ó', 'P', 'Q', 'R', 'S', 'Ś', 'T', 'U', 'V', 'W', '' ],
                [ '', 'X', 'Y', 'Z', 'Ź', 'Ż', '', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '?', '+' ],
                [ '\\', '|', '#', '$', '%', '&', '€', '(', ')', '=', '÷', '×' ],
                [ '', 'đ', 'Đ', '[', ']', '!', '\'', '/', '', '', '_', '*' ],
                [ '<', '>', '', '@', '{', '}', '', '', '-' ]
            ], layoutText: 'AĄB'}
        ],

        'et_EE_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "tühik", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ 'm', 'n', 'o', 'p', 'q', 'r', 's', 'š', 'z', 'ž', 't', 'u' ],
                [ 'v', 'w', 'õ', 'ä', 'ö', 'ü', 'x', 'y', '' ]
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'Š', 'Z', 'Ž', 'T', 'U' ],
                [ 'V', 'W', 'Õ', 'Ä', 'Ö', 'Ü', 'X', 'Y', '' ]
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '', '!', '\'', '#', '', '%', '&', '/', '(', ')', '=', '?' ],
                [ '*', '@', '€', '$', '', '', '{', '[', ']', '}', '\\', '/' ],
                [ '', '', '', '', '', '', '', '', ';', ':', '_', '+' ],
                [ '', '', '', '', '', '', ',', '.', '-' ]
            ], startRow: 1, startCol: 1, layoutText: '1AB'}
        ],

        'lv_LV_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "atstarpe", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'ā', 'b', 'c', 'č', 'd', 'e', 'ē', 'f', 'g', 'ģ', 'h' ],
                [ 'i', 'ī', 'j', 'k', 'ķ', 'l', 'ļ', 'm', 'n', 'ņ', 'o', 'p' ],
                [ 'r', 's', 'š', 't', 'u', 'ū', 'v', 'z', 'ž' ]
            ], startRow: 2, layoutText: '!@#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'Ā', 'B', 'C', 'Č', 'D', 'E', 'Ē', 'F', 'G', 'Ģ', 'H' ],
                [ 'I', 'Ī', 'J', 'K', 'Ķ', 'L', 'Ļ', 'M', 'N', 'Ņ', 'O', 'P' ],
                [ 'R', 'S', 'Š', 'T', 'U', 'Ū', 'V', 'Z', 'Ž' ]
            ], startRow: 2, layoutText: '!@#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '@', '#', '$', '%', '/', '&', '*', '(', ')', '-', '=' ],
                [ 'q', '\'', '€', 'ŗ', 'w', 'y',  '',  '_', '{', '}', '[', ']' ],
                [ 'Q', '',   '',  'Ŗ', 'W', 'Y',  '<', '>', ';', ':', '?', ''  ],
                [ 'x', 'X',  '',  '',  'õ', 'Õ',  ',', '.', '/' ]
            ], layoutText: '1AĀ'}
        ],

        'hr_HR_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "razmak", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ 'a', 'b', 'c', 'č', 'ć', 'd', 'đ', 'e', 'f', 'g', 'h', 'i' ],
                [ 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 'š', 't', 'u' ],
                [ '', 'v', 'z', 'ž', 'q', 'w', 'x', 'y', '' ]
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ 'A', 'B', 'C', 'Č', 'Ć', 'D', 'Đ', 'E', 'F', 'G', 'H', 'I' ],
                [ 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Š', 'T', 'U' ],
                [ '', 'V', 'Z', 'Ž', 'Q', 'W', 'X', 'Y', '' ]
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '#', '$', '%', '&', '/', '(', ')', '=', '?', '+' ],
                [ '\\', '|', '', '', '', '', '', '', '', '', '÷', '×' ],
                [ '', '', '', '[', ']', '', '', '', ';', ':', '_', '*' ],
                [ '@', '{', '}', '§', '<', '>', ',', '.', '-']
            ], layoutText: '1AB'}
        ],

        'ro_RO_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "spaţiu", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'ă', 'â', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'î' ],
                [ 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 'ș', 't' ],
                [ 'ț', 'u', 'v', 'w', 'x', 'y', 'z', ',', '.' ]
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'Ă', 'Â', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'Î' ],
                [ 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'Ș', 'T' ],
                [ 'Ț', 'U', 'V', 'W', 'X', 'Y', 'Z', ';', ':' ]
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '', '!', '\'', '#', '$', '%', '&', '/', '(', ')', '=', '*' ],
                [ '', '', '€', '-', '+', '', '', '', '', '', '{', '}' ],
                [ '', '', '', '', '', '', '', '\\', '|', '[', ']', 'ß' ],
                [ '÷', '×', '', '', '_', '?', '<', '>', '@' ]
            ], startRow: 1, startCol: 1, layoutText: '1AĂ'}
        ],

        'sv_SE_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "utrymme", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x' ],
                [ 'y', 'z', 'å', 'ä', 'ö', 'é', '', ',', '.' ]
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X' ],
                [ 'Y', 'Z', 'Å', 'Ä', 'Ö', 'É', '', ';', ':' ]
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '\'', '#', '§', '%', '&', '/', '(', ')', '=', '', '?' ],
                [ '', '', '@', '£', '$', '€', '', '{', '[', ']', '}', '\\' ],
                [ '+', '*', '-', '_', '', '', '', '', '', '', '', '' ],
                [ '<', '>', '', '', '', '', '', '', '' ]
            ], layoutText: '1AB'}
        ],

        'da_DK_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mellemrum", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', '' ],
                [ 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', '' ],
                [ '', 'w', 'x', 'y', 'z', 'æ', 'ø', 'å', '' ]
            ], startRow: 2, layoutText: '§!\''},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', '' ],
                [ 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', '' ],
                [ '', 'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å', '' ]
            ], startRow: 2, layoutText: '§!\'', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '§', '!', '\'', '#', '', '%', '&', '/', '(', ')', '=', '?' ],
                [ '\\', '@', '€', '$', '', '', '{', '[', ']', '}', '+', '|' ],
                [ '', '', '', '', '', '', '', '', ';', ':', '_', '*' ],
                [ '<', '>', '', '', '', '', ',', '.', '-' ]
            ], layoutText: '1AB'}
        ],

        'no_NO_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "mellomrom", buttons:[
                [ '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '' ],
                [ '' ,'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', '' ],
                [ '', 'u', 'v', 'w', 'x', 'y', 'z', 'æ', 'ø', 'å', '', '' ],
                [ '', 'â', 'é', 'è', 'ê', 'ó','ò', 'ô', '' ]
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '' ],
                [ '' ,'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', '' ],
                [ '', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å', '', '' ],
                [ '', 'Â', 'É', 'È', 'Ê', 'Ó','Ò', 'Ô', '' ]
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '\\', '/' ],
                [ '!', '\'', '#', '§', '%', '&', '*', '(', ')', '=', '', '' ],
                [ '', '', '€', '$', '{', '[', ']', '}', ';', ':', '_', '' ],
                [ '@', '<', '>', '', '', '', ',', '.', '-' ]
            ], layoutText: 'ABC'}
        ],

        'es_ES_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espacio", buttons:[
                [ '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '' ],
                [ '', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', '' ],
                [ '', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'á', 'ç', 'é', '' ],
                [ '', 'í', 'ó', 'ú', 'ü', '', '', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: '~12'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', '' ],
                [ '', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', '' ],
                [ '', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Á', 'Ç', 'É', '' ],
                [ '', 'Í', 'Ó', 'Ú', 'Ü', '', '', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: '~12', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '§' ],
                [ '?', '¿', '&', '€', '/', '\\',  '(',  ')',  '{', '}', '*', '|' ],
                [ '!',  '¡', 'ß', '₱ ', '%', '^', '#', '_', '¬', '-', '`',  '´' ],
                [ '@',  '<', '>', '$', '¢', '\'', '', '', '']
            ], layoutText: 'ABC'}
        ],

        'fr_FR_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "espace", buttons:[
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l' ],
                [ '', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', '' ],
                [ '', 'w', 'x', 'y', 'z', 'à', 'â', 'ç', 'è', 'é', 'ê', '' ],
                [ 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü', '' ]
            ], layoutText: '~12'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L' ],
                [ '', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', '' ],
                [ '', 'W', 'X', 'Y', 'Z', 'À', 'Â', 'Ç', 'È', 'É', 'Ê', '' ],
                [ 'Ë', 'Î', 'Ï', 'Ô', 'Œ', 'Ù', 'Û', 'Ü', '' ]
            ], layoutText: '~12', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '§' ],
                [ '?', '+', '&', '=', '[', ']', '(', ')', '{', '}', '"', '|' ],
                [ '!', 'µ', '£', '€', '%', '^', '#', '_', ';', ':', '\\',  '/' ],
                [ '@', '<', '>', '$', '¢', '\'', ',', '.', '-']
            ], layoutText: 'ABC'}
        ],

        'fi_FI_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "väli", buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', '' ],
                [ 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', '' ],
                [ '', 'w', 'x', 'y', 'z', 'å', 'ä', 'ö', '' ]
            ], startRow: 2, layoutText: '§!\''},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', '' ],
                [ 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', '' ],
                [ '', 'W', 'X', 'Y', 'Z', 'Å', 'Ä', 'Ö', '' ]
            ], startRow: 2, layoutText: '§!\'', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '§', '!', '\'', '#', '',  '%', '&', '/', '(', ')', '=',  '?' ],
                [ 'ß', '@', '€',  '$', 'Þ', 'þ', '',  '',  'œ', 'Œ', '\\', '/' ],
                [ 'ə', 'Ə', 'đ',  'Đ', 'ø', 'Ø', 'æ', 'Æ', ';', ':', '_',  '' ],
                [ 'ʒ', 'Ʒ', 'ŋ',  'Ŋ', 'μ', 'ĸ', ',', '.', '-' ]
            ], layoutText: '1AB'}
        ],

        'ru_RU_ABC' : [
            {name:'lettersSmall', style:'sixTen', spaceText: "Пробел", buttons:[
                [ 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и' ],
                [ 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т' ],
                [ 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь' ],
                [ 'э', 'ю', 'я', 'ґ', 'є', 'i', 'ï' ]
            ], layoutText: '123'},
            {name:'lettersCaps', style:'sixTen', buttons:[
                [ 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И' ],
                [ 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т' ],
                [ 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь' ],
                [ 'Э', 'Ю', 'Я', 'Ґ', 'Є', 'I', 'Ï' ]
            ], layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ '/', '.', ',', '\'', '-', '(', ')', '?', '!', '*' ],
                [ '@', '&', '#', '$', '€', '', '', '', '', '' ],
                [ '', '', '', '', '', '', '']
            ], layoutText: 'АБВ'}
        ],

        'bg_BG_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "Интервал", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ 'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л' ],
                [ 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч' ],
                [ 'ш', 'щ', 'ъ', 'ь', 'ю', 'я', '', '', '' ]
            ], startRow: 2, layoutText: '!?+'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л' ],
                [ 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч' ],
                [ 'Ш', 'Щ', 'Ъ', 'Ь', 'Ю', 'Я', '', '', '' ],
            ], startRow: 2, layoutText: '!?+', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!', '?', '+', '%', '=', ':', '/',  '_', '', '|', 'V', '~' ],
                [ '',  '(', '[', ']', ')', '-', '\'', '`', '', '',  '', '' ],
                [ '@', '&', '#', '$',  '€', 'ы', 'э', 'Э', '§', '', '', '' ],
                [ '',  '',  '',  '',   '',  '',  ',', '.', '?' ]
            ], layoutText: '1АБ'}
        ],

        'sr_RS_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "razmak", buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '' ],
                [ 'а', 'b', 'c', 'č', 'ć', 'd', 'đ', 'e', 'f', 'g', 'h', 'i' ],
                [ 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 'š', 't', 'u' ],
                [ 'v', 'z', 'ž', 'q', 'w', 'x', 'y', ',', '.' ]
            ], startRow: 2, layoutText: '!\'#'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_', '' ],
                [ 'А', 'B', 'C', 'Č', 'Ć', 'D', 'Đ', 'E', 'F', 'G', 'H', 'I' ],
                [ 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'Š', 'T', 'U' ],
                [ 'V', 'Z', 'Ž', 'Q', 'W', 'X', 'Y', ';', ':' ]
            ], startRow: 2, layoutText: '!\'#', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '!',  '\'', '#', '$', '%', '&', '/', '(', ')', '=', '?', '*' ],
                [ '\\', '|',  '€', '',  '',  '',  '',  '',  '',  '',  '÷', '×' ],
                [ '',   '',   '',  '[', ']', '',  '',  'ł', 'Ł', '',  '',  'ß'  ],
                [ '<',  '>',  '',  '',  '@', '{', '}', '',  '' ]
            ], layoutText: '1AB'}
        ],

        'lt_LT_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "tarpas", buttons:[
                [ '', 'а', 'ą', 'b', 'c', 'č', 'd', 'e', 'ę', 'ė', 'f', '' ],
                [ '', 'g', 'h', 'i', 'į', 'y', 'j', 'k', 'l', 'm', 'n', '' ],
                [ '', 'o', 'p', 'r', 's', 'š', 't', 'u', 'ų', 'ū', 'v', '' ],
                [ '', 'z', 'ž', 'q', 'w', 'x', '', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'А', 'Ą', 'B', 'C', 'Č', 'D', 'E', 'Ę', 'Ė', 'F', '' ],
                [ '', 'G', 'H', 'I', 'Į', 'Y', 'J', 'K', 'L', 'M', 'N', '' ],
                [ '', 'O', 'P', 'R', 'S', 'Š', 'T', 'U', 'Ų', 'Ū', 'V', '' ],
                [ '', 'Z', 'Ž', 'Q', 'W', 'X', '', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '' ],
                [ '!', '@', '#', '$', '%', '\'', '&', '*', '(', ')', '-', '+' ],
                [ '', 'ß', '€', '', '', '', '{', '}', '[', ']', '\\', '|' ],
                [ '<', '>', '', '', '', '', '', '_', '?' ]
            ], layoutText: 'AĄB'}
        ],

        'tr_TR_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "alan", buttons:[
                [ '', 'а', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', '' ],
                [ '', 'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p', '' ],
                [ '', 'r', 's', 'ş', 't', 'u', 'ü', 'v', 'y', 'z', 'â', '' ],
                [ '', 'î', 'ô', 'û', 'q', 'w', 'x', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: 'é12'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'А', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', '' ],
                [ '', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', '' ],
                [ '', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z', 'Â', '' ],
                [ '', 'Î', 'Ô', 'Û', 'Q', 'W', 'X', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: 'é12', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ 'é', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ '<', '>', '_', '#', '$', '%', '&', '{', '[', ']', '}', '\\' ],
                [ '!', '*', '€', '-', '+', '/', '(', ')', '=', ';', ',', '' ],
                [ '@', '', '', '', '', '?', '\'', ':', '.' ]
            ], layoutText: 'ABC'}
        ],

        'hu_HU_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "szóköz", buttons:[
                [ '', 'a', 'á', 'b', 'c', 'd', 'e', 'é', 'f', 'g', 'h', '' ],
                [ '', 'i', 'í', 'j', 'k', 'l', 'm', 'n', 'o', 'ó', 'ö', '' ],
                [ '', 'ő', 'p', 'q', 'r', 's', 't', 'u', 'ú', 'ü', 'ű', '' ],
                [ '', 'v', 'w', 'x', 'y','z', '', ',', '.' ]
            ], startRow: 1, startCol: 1, layoutText: '123'},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '', 'A', 'Á', 'B', 'C', 'D', 'E', 'É', 'F', 'G', 'H', '' ],
                [ '', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'O', 'Ó', 'Ö', '' ],
                [ '', 'Ő', 'P', 'Q', 'R', 'S', 'T', 'U', 'Ú', 'Ü', 'Ű', '' ],
                [ '', 'V', 'W', 'X', 'Y','Z', '', ';', ':' ]
            ], startRow: 1, startCol: 1, layoutText: '123', defaultState: true},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '', '§' ],
                [ '\\', '|', '-', '+', '!', '%', '/', '=', '(', ')', '÷', '×' ],
                [ '<', '>', '#', '[', ']', '', '', '', '', '*', '$', '€' ],
                [ '&', '@', '{', '}', '?', '', '\'', '-', '_' ]
            ], layoutText: 'AÁB'}
        ],

        'ar_SA_ABC' : [
            {name:'arabic_letters', style:'sixTen', spaceText: "مسافة", buttons:[
                [ 'ر' ,'ذ' ,'د' ,'خ' ,'ح' ,'ج' ,'ث' ,'ت' ,'ب' ,'ا' ],
                [ 'ف' ,'غ' ,'ع' ,'ظ' ,'ط' ,'ض' ,'ص' ,'ش' ,'س' ,'ز' ],
                [ '', '', 'ي', 'و', 'ه', 'ن', 'م', 'ل', 'ك', 'ق' ],
                [ '', '', '', '', '', '', '' ]
            ], startCol: 10, shiftText: '', layoutText: '123', defaultState: true},
            {name:'arabic_caps', buttons:[]},
            {name:'arabic_symbols', style:'sixTen', buttons:[
                [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '0' ],
                [ 'أ' ,'إ' ,'', ':', '.', ',', ';', '-', '(', ')' ],
                [ '?', '!', '%', '@', '&', '#', '_', '=', '+', '' ],
                [ 'لا', 'ء', 'ى', 'ئ', 'ة', 'ؤ', '' ]
            ], shiftText: '', layoutText: 'ا ب ج'}
        ],

        'th_TH_ABC' : [
            {name:'lettersSmall', style:'sixTwelve', spaceText: "เว้นวรรค", buttons:[
                [ 'ก', 'ข', 'ค', 'ฆ', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ' ],
                [ 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ' ],
                [ 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ' ],
                [ 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ', 'ฃ', 'ฅ', '' ]
            ], shiftText: '', layoutText: '123', defaultState: true},
            {name:'lettersCaps', style:'sixTwelve', buttons:[
                [ '◌​็', '◌​ุ', '◌​้', '◌​๊', '◌​๋', '◌​์', '◌​ํ', 'ฯ', 'ะ', '◌​ั', 'า', 'ๅ' ],
                [ '◌​ำ', '◌​ิ', '◌​ี', '◌​ึ', '◌​ื', '◌​ฺ', '◌​ู',  'เ', 'แ', 'โ', 'ใ', 'ไ' ],
                [ 'ฤ', 'ฦ', '฿', 'ๆ', '◌​่', '', '', '', '', '', '', '' ],
                [ '', '', '', '', '', '', '', '', '' ]
            ], shiftText: '', layoutText: '123'},
            {name:'symbols1', style:'sixTwelve', buttons:[
                [ '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '' ],
                [ '<', '>', '!', '#', '$', '*', '%', '{', '[', ']', '}', '-' ],
                [ '@', '_', '€', '\\', '/', '(', ')', ',', '', ';', ',', '?' ],
                [ '', '', '', '', '', '', '', ':', '.' ]
            ], startRow: 1, startCol: 1, layoutText: 'กขค'}
        ],
    };

    // initialize
    this._init();
};

/*
 * =========================
 * Control's prototype properties
 * =========================
 */
KeyboardCtrl.prototype._MOUSEDOWNEVENT  = 'mousedown';
KeyboardCtrl.prototype._MOUSEUPEVENT    = 'mouseup';
KeyboardCtrl.prototype._MOUSEMOVEEVENT  = 'mousemove';
KeyboardCtrl.prototype._MOUSEOUTEVENT   = 'mouseout';
KeyboardCtrl.prototype._MOUSEOVEREVENT  = 'mouseover';
KeyboardCtrl.prototype._MOUSEENTEREVENT = 'mouseenter';
KeyboardCtrl.prototype._CLICKEVENT      = 'click';
KeyboardCtrl.prototype._VENDOR          = 'O';

KeyboardCtrl.prototype._init = function(languageChange)
{
    //set language properly...
    if (this.properties.locale != 'hex' &&
        this.properties.locale != 'numeric' &&
        this.properties.locale != 'wpa')
    {
        if (this.properties.locale != null)
        {
            log.warn(this.uiaId + " issue. The 'locale' property has been deprecated. KeyboardCtrl retrieves the language from Framework. See the SDD and the 'uniqueLayout' property");
        }
        this.properties.locale = framework.localize.getKeyboardLanguage();
        log.info(this.properties.locale + " was retrieved from framework.");
        switch(this.properties.locale)
        {
            case "ja_JP":
                this.properties.locale = "ja_JP_ABC";
                log.warn("Deprecated code ja_JP used for Japanese keyboard. It has been preserved for future use. Overriding it with updated code ja_JP_ABC" );
                break;
            case "he_IL":
                this.properties.locale = "he_IL_ABC";
                log.warn("Deprecated code he_IL used for Hebrew keyboard. It has been preserved for future use. Overriding it with updated code he_IL_ABC" );
                break;
            case "el_GR":
                this.properties.locale = "el_GR_ABC";
                log.warn("Deprecated code el_GR used for Greek keyboard. It has been preserved for future use. Overriding it with updated code el_GR_ABC" );
                break;
            case "abc":
                this.properties.locale = "en_US_ABC";
                log.warn("Deprecated code abc used for US English ABC keyboard. Overriding it with updated code en_US_ABC" );
                break;
            default:
                //No deprecated code used
        }
    }
    else
    {
        // these values are accepted for backwards compatibility
        this._specialLayout = true;
        log.info("Locale given by " + this.uiaId + " is: " + this.properties.locale);
    }

    if (this.properties.uniqueLayout == 'hex' ||
        this.properties.uniqueLayout == 'numeric' ||
        this.properties.uniqueLayout == 'wpa')
    {
        this._specialLayout = true;
        this.properties.locale = this.properties.uniqueLayout;
        log.info("uniqueLayout given by " + this.uiaId + " is: " + this.properties.locale);
    }
    else if (this.properties.uniqueLayout != null)
    {
        log.warn("Invalid value passed to 'uniqueLayout' from " + this.uiaId + ". Only 'hex', 'numeric' and 'wpa' are accepted.");
    }

    if (this._layouts[this.properties.locale] == null)
    {
        var _failCode = this.properties.locale;
        var _region = framework.localize.getRegion();
        switch (_region)
        {
            case 'Region_NorthAmerica':
                this.properties.locale = 'en_US';
                break;
            case 'Region_Europe':
                this.properties.locale = 'en_UK';
                break;
            case 'Region_4A':
                this.properties.locale = 'en_US';
                break;
            case 'Region_Japan':
                this.properties.locale = 'ja_JP_ABC';
                break;
            case 'Region_ChinaTaiwan':
                this.properties.locale = 'zh_CN';
                break;
            default:
                this.properties.locale = 'en_US';
                break;
        }
        log.warn(_failCode + " is not a valid locale. Defaulting to " + this.properties.locale);
    }

    if (this.properties.locale == 'ja_JP_ABC' || this.properties.locale == 'zh_CN' || this.properties.locale == 'zh_TW' || this.properties.locale == 'cn_HK' || this.properties.locale == 'mn_TW' || this.properties.locale == 'zh_CN_ABC' || this.properties.locale == 'zh_TW_ABC' || this.properties.locale == 'cn_HK_ABC' )
    {
        this._conversionLang = true;
    }
    else
    {
        this._conversionLang = false;
    }

    if (this.properties.locale == "he_IL_ABC" || this.properties.locale == "ar_SA" || this.properties.locale == "ar_SA_ABC")
    {
        this._isRtlLang = true;
    }
    if (framework.localize.getCurrentLanguage() == "he_IL" || framework.localize.getCurrentLanguage() == "ar_SA")
    {
        this._systemLangRtl = true;
    }


    //create HTML Elements...
    this._createStructure(languageChange);

    //set proper styling...
    this._cssRefresh();
    this._setLayoutShiftInnerText();

    if (this._conversionLang)
    {
        this._suggestionBackgroundDiv.style.left =  (this._leftArrow.clientWidth + 1) + 'px';
        this._visibleSuggWidth = this._suggestionRowWrapper.clientWidth - 2*(this._leftArrow.clientWidth + 1);
    }

    // place contextual clue, if applicable...
    if (this.properties.placeholderText)
    {
        this._setPlaceholder();
    }

    //place focus...
    this._setInitialFocusKey();

    this._byteBuffer = this._getMostBytes(this.properties.locale);
    if (this.properties.maxBytes > 0)
    {
        log.info("Max byte buffer set at: " + this._byteBuffer + " bytes.");
    }

    // call to _fillInputWithStr() will re-enable OK button if necessary
    this._setKeyEnabled(this._ok, false);

    // place previously existing string...
    this._fillInputWithStr(this._prevExistingText);
    this._isInsertValid();
};

KeyboardCtrl.prototype._createStructure = function(languageChange)
{
    /* CREATE ELEMENTS */
    // create btns array to for clean-up purposes upon closing the keyboard
    var largestLayout = 0, largestLayoutLength = 0;

    //With new abc keyboard layouts added, last layout is no more the largest layout. So, calculating which is actually the largest layout.
    for (var i = 0; i < this._layouts[this.properties.locale].length; i++)
    {
        if (this._layouts[this.properties.locale][i].buttons.length > largestLayoutLength)
        {
            largestLayoutLength = this._layouts[this.properties.locale][i].buttons.length;
            largestLayout = i;
        }
    }
    this._btns = new Array(this._layouts[this.properties.locale][largestLayout].buttons.length);
    for (var i=0; i<this._layouts[this.properties.locale][largestLayout].buttons.length; i++)
    {
        this._btns[i] = new Array();
    }

    if (this.divElt == null)
    {
        // create control's container
        this.divElt = document.createElement('div');
        this.divElt.id = this.id;
        this.divElt.className = 'KeyboardCtrl';

        // input
        this._input = document.createElement('div');
        this._input.className = 'inputDiv';
        this._input.id = 'textDiv';
        this._input.setAttribute('data-value', 'input');
        this._input.setAttribute('data-enabled', 'true');
        this._addListeners(this._input);

        // add default value
        if (this.properties.value)
        {
            this._prevExistingText = this.properties.value;
        }

        // input text wrapper
        this._inputSpan = document.createElement('span');
        this._inputSpan.className = 'inputSpan';
        this._inputSpan.id = 'inSpan';
        this._inputSpan.setAttribute('data-value', 'textSpan');
        this._input.appendChild(this._inputSpan);
        this._spanOffset = this._inputDivXPadding;

        // fade divs
        this._leftCover = document.createElement('div');
        this._leftCover.className = 'inputFade';
        this._leftCover.id = 'coverLeft';
        this._leftCover.setAttribute('data-value', 'fade');
        this._input.appendChild(this._leftCover);
        this._leftFade = document.createElement('div');
        this._leftFade.className = 'inputFade';
        this._leftFade.id = 'fadeLeft';
        this._leftFade.setAttribute('data-value', 'fade');
        this._input.appendChild(this._leftFade);

        this._rightCover = document.createElement('div');
        this._rightCover.className = 'inputFade';
        this._rightCover.id = 'coverRight';
        this._rightCover.setAttribute('data-value', 'fade');
        this._input.appendChild(this._rightCover);
        this._rightFade = document.createElement('div');
        this._rightFade.className = 'inputFade';
        this._rightFade.id = 'fadeRight';
        this._rightFade.setAttribute('data-value', 'fade');
        this._input.appendChild(this._rightFade);

        // input caret
        this._caretOffset = this._inputDivXPadding;
        this._caret = document.createElement('div');
        this._caret.className = 'caret';
        this._caret.id = 'caretDiv';
        this._caret.style.left = (this._caretOffset-1) + "px";
        this._caret.setAttribute('data-value', 'caret');
        this._caret.setAttribute('data-enabled', 'true');
        this._input.appendChild(this._caret);

        this._debugCaret = document.createElement('div');
        if (guiConfig.debugMode)
        {
            //debug caret in suggestion
            this._debugCaretOffset = this._suggDivXPadding;
            this._debugCaret.className = 'caret';
            this._debugCaret.id = 'debugCaretDiv';
            this._debugCaret.style.left = (this._debugCaretOffset-1) + "px";
            this._debugCaret.setAttribute('data-enabled', 'true');
        }

        this.divElt.appendChild(this._input);

        // Create "inputTouchActiveArea" - active touch area for input box.
        // handles touch events for input box.
        //Added as a fix for SW00137423
        this._inputTouchActiveArea = document.createElement('div');
        this._inputTouchActiveArea.className = "inputBoxTouchActiveArea";
        this.divElt.appendChild(this._inputTouchActiveArea);
        //input touch active area handlers
        this._inputTouchActiveArea.addEventListener(this._MOUSEDOWNEVENT, this._inputDownCallback, false);
        this._inputTouchActiveArea.addEventListener(this._MOUSEOUTEVENT, this._inputOutCallback, false);
        this._inputTouchActiveArea.addEventListener(this._MOUSEOVEREVENT, this._inputOverCallback, false);
    }

    /*
     * Should I only keep as many divs as I need? A minimun amount to fill the row, but if it goes off the screen,
     * just enough to slide in the next one(s) in. This would mean having as much width off the screen as the div
     * on the opposite end is wide.
     */
    this._suggestionRowWrapper = document.createElement('div');
    if (this._conversionLang)
    {
        // data for the current conversion
        this._highlightedSpan = document.createElement('span');
        this._highlightedSpan.className = 'highlightedSpan';
        this._highlightedSpan.id = 'highlightSpan';
        this._input.appendChild(this._highlightedSpan);

        this._highlightPos.start = -1;
        this._highlightPos.end = -1;

        this._loadConversionFile(false);

        // Row of suggested conversions
        this._suggestionRowWrapper.className = 'suggestionRowWrapper';

        var _leftArrow = document.createElement('div');
            _leftArrow.className = 'suggestionArrow';
            _leftArrow.id = 'arrowLeft';
            _leftArrow.setAttribute('data-enabled', 'true');
            this._addListeners(_leftArrow);
        this._suggestionRowWrapper.appendChild(_leftArrow);
        this._leftArrow = _leftArrow;

        var _rightArrow = document.createElement('div');
            _rightArrow.className = 'suggestionArrow';
            _rightArrow.id = 'arrowRight';
            _rightArrow.setAttribute('data-enabled', 'true');
            this._addListeners(_rightArrow);
        this._suggestionRowWrapper.appendChild(_rightArrow);
        this._rightArrow = _rightArrow;

        this._suggestionBackgroundDiv = document.createElement('div');
        this._suggestionBackgroundDiv.className = 'suggestionBgDiv';
        this._suggestionWrapper = document.createElement('span');
        this._suggestionWrapper.className = 'suggestionWrapper';
        if (guiConfig.debugMode)
        {
            this._suggestionWrapper.appendChild(this._debugCaret);
        }

        var numberOfDivs = 15;
        if (this.properties.locale == "ja_JP_ABC" || this.properties.locale == "mn_TW")
        {
            numberOfDivs = 12;
        }
        this._suggestionDivs = new Array();

        for (var i=0; i<numberOfDivs; i++)
        {
            var _suggestion = document.createElement('span');
            _suggestion.className = 'suggestionSpan';
            _suggestion.appendChild(document.createTextNode(''));
            _suggestion.setAttribute('data-value', '');
            _suggestion.setAttribute('data-enabled', 'false');
            _suggestion.id = 'suggestion' + i;
            this._addListeners(_suggestion);
            this._suggestionWrapper.appendChild(_suggestion);
            this._suggestionDivs.push(_suggestion);
            this._suggestionDivs[i].style.width = (this._leftArrow.clientWidth - 13) + "px";
            this._suggestionWidths.push(this._leftArrow.clientWidth - 13);
            if (guiConfig.debugMode)
            {
                this._suggestionDivs[i].style.textAlign = "left";
            }
        }

        //this._resizeSuggestions();
        this._suggestionBackgroundDiv.appendChild(this._suggestionWrapper);
        this._suggestionRowWrapper.appendChild(this._suggestionBackgroundDiv);
        this.divElt.appendChild(this._suggestionRowWrapper);
    }

    // .btnWrapper
    this._btnWrapper = document.createElement('div');
    this._btnWrapper.className = 'btnWrapper';
    if(this.properties.locale == 'th_TH' || this.properties.locale == 'th_TH_ABC')
    {
        //Setting Thai Language attribute
        this._btnWrapper.setAttribute('lang', 'th');
    }
    this._currentLayout = 'lettersSmall';

    /* CREATE BUTTONS
     * This is done by iterating through the layout option for creating the layouts.
     * Then for each layout the buttons property is iterated for creating the rows
     * and each row is filled with buttons.
     */
    var _row, _btn;
    for (var i=this._layouts[this.properties.locale].length - 1; i>=0; i--)
    {
        // create the layout
        var _layout = document.createElement('div');
        _layout.className = 'layout';
        _layout.id = this._layouts[this.properties.locale][i].name;

        //this is where the inital layout is set
        if (this._layouts[this.properties.locale][i].defaultState)
        {
            _layout.style.display = 'block';
            this._currentLayout = this._layouts[this.properties.locale][i].name;
        }
        else
        {
            _layout.style.display = 'none';
        }

        // iterate through the buttons rows
        for (var j=0; j<this._layouts[this.properties.locale][i].buttons.length; j++)
        {
            _row = document.createElement('div');
            _row.className = 'row';
            if ((this.properties.locale == 'ja_JP_ABC' || this.properties.locale == 'mn_TW') && j == this._layouts[this.properties.locale][i].buttons.length - 1)
            {
                _row.classList.add('shifted');
            }

            // iterate throug the actual buttons
            for (var k=0; k<this._layouts[this.properties.locale][i].buttons[j].length; k++)
            {
                // create the button
                _btn = document.createElement('div');
                if(this.properties.locale == 'mn_TW' && j > 0)
                {
                	_btn.classList.add('btnExtended', 'entry');
                }
                else
                {
                	_btn.classList.add('btn', 'entry');
                }
                _btn.setAttribute('data-enabled', 'true');

                // add disabled class for empty strings
                if(this._layouts[this.properties.locale][i].buttons[j][k].length == 0)
                {
                    this._setKeyEnabled(_btn, false);
                }

                _btn.appendChild(document.createTextNode(this._layouts[this.properties.locale][i].buttons[j][k]));
                _btn.setAttribute('data-value', this._layouts[this.properties.locale][i].buttons[j][k]);

                if (j == this._layouts[this.properties.locale][i].buttons.length - 1)
                {
                    _btn.classList.add('lastRow');
                }

                //This if/else is a bit confusing... i starts high then goes down to 0
                // Since the last layout is always the largest, I initially set this._btns to that layout,
                // then overwrite a subset so I don't have any issues accessing an index that is undefined
                if (this._layouts[this.properties.locale][i].defaultState)
                {
                    this._addListeners(_btn);
                    _row.appendChild(_btn);
                    this._btns[j][k] = _btn;
                }
                else if (i == this._layouts[this.properties.locale].length - 1)
                {
                    _row.appendChild(_btn);
                    this._btns[j][k] = _btn;
                }
                else
                {
                    _row.appendChild(_btn);
                }
            }
            _layout.appendChild(_row);
        }
        this._btnWrapper.appendChild(_layout);
    }

    /* CREATE CONTROLS
     * A new container is created containing the control buttons.
     * This includes the shift/caps key, layout switch, space, backspace
     * OK, and two punctuation keys (comma, point, semicolon)
     */
    var _controlsWrapper = document.createElement('div');
        _controlsWrapper.className = 'controlsWrapper';

    // shift
    if (this.properties.locale != 'ja_JP_ABC' && this.properties.locale != 'mn_TW')
    {
        _btn = document.createElement('div');
        _btn.classList.add('btn', 'control');
        // add disabled class for hex/numeric
        if(this.properties.locale == 'hex' || this.properties.locale == 'numeric')
        {
            this._setKeyEnabled(_btn, false);
        }
        _btn.id = 'btnShift';
        _btn.setAttribute('data-value', 'shift');
        _btn.setAttribute('data-enabled', 'true');
        this._addListeners(_btn);
        _controlsWrapper.appendChild(_btn);
        // keep reference to the shift button
        this._btnShift = _btn;

        if (this.properties.locale == 'ar_SA_ABC' || this.properties.locale == 'ar_SA' || this.properties.locale == 'he_IL_ABC')
        {
              this._setKeyEnabled(this._btnShift, false);
        }
    }

    // cancel
    _btn = document.createElement('div');
    _btn.classList.add('btn', 'control');
    _btn.id = 'btnCancel';
    _btn.setAttribute('data-value', 'cancel');
    _btn.setAttribute('data-enabled', 'true');
    this._addListeners(_btn);
    _controlsWrapper.appendChild(_btn);
    // keep reference to the layout switch button
    this._cancel = _btn;

    // globe button
    _btn = document.createElement('div');
    _btn.classList.add('btn', 'entry');
    _btn.setAttribute('data-enabled', 'true');
    _btn.id = 'btnGlobe';
    // add disabled class for hex/numeric
    if(this.properties.locale == 'hex' || this.properties.locale == 'numeric' || this.properties.locale == 'wpa')
    {
        this._setKeyEnabled(_btn, false);
    }
    _btn.setAttribute('data-value', 'globe');
    this._addListeners(_btn);
    _controlsWrapper.appendChild(_btn);
    // keep reference to the globe button
    this._globe = _btn;

    // layout switch
    _btn = document.createElement('div');
    _btn.classList.add('btn', 'control');
    _btn.setAttribute('data-enabled', 'true');
    // add disabled class for hex/numeric
    if(this.properties.locale == 'hex' || this.properties.locale == 'numeric')
    {
        this._setKeyEnabled(_btn, false);
    }
    _btn.id = 'btnLayoutSwitch';
    _btn.appendChild(document.createTextNode('123'));
    _btn.setAttribute('data-value', 'layout');
    this._addListeners(_btn);
    _controlsWrapper.appendChild(_btn);
    // keep reference to the layout switch button
    this._layoutSwitch = _btn;

    //Mod key
    if (this.properties.locale == 'ja_JP_ABC' || this.properties.locale == 'mn_TW')
    {
        _btn = document.createElement('div');
        _btn.classList.add('btn', 'entry');
        _btn.id = 'btnMod';
        _btn.setAttribute('data-value', 'mod');
        _btn.setAttribute('data-enabled', 'true');
        this._addListeners(_btn);
        _controlsWrapper.appendChild(_btn);
        this._modKey = _btn;
        this._setKeyEnabled(this._modKey, false);
    }

    // spacebar
    _btn = document.createElement('div');
    _btn.classList.add('btn', 'entry');
    _btn.setAttribute('data-enabled', 'true');
    if(this.properties.locale == 'hex' || this.properties.locale == 'numeric')
    {
        this._setKeyEnabled(_btn, false);
    }
    _btn.id = 'btnSpacebar';
    _btn.appendChild(document.createTextNode(this._layouts[this.properties.locale][0].spaceText));  //index 0 because that is where the string is stored.
    _btn.setAttribute('data-value', 'space');
    this._addListeners(_btn);
    _controlsWrapper.appendChild(_btn);
    // keep reference to the space bar button
    this._spacebar = _btn;

    // OK
    _btn = document.createElement('div');
    _btn.classList.add('btn', 'control');
    _btn.id = 'btnOK';
    _btn.setAttribute('data-value', 'OK');
    _btn.setAttribute('data-enabled', 'true');
    this._addListeners(_btn);
    _controlsWrapper.appendChild(_btn);
    // keep reference to the ok button
    this._ok = _btn;

    // backspace
    var _btnProperties = {
        "buttonBehavior" : "shortAndHold",
        "canStealFocus" : true,
        "icon" : "../images/Icn_Delete.png",
        "selectCallback" : this._deleteSelectHandler.bind(this),
        "holdStartCallback": this._deleteHoldStartHandler.bind(this),
        "holdStopCallback": this._deleteHoldStopHandler.bind(this),
        "disabledClass" : "KeyboardCtrlDeleteBtn_Ds",
        "focusedClass" : "KeyboardCtrlDeleteBtn_Fs",
        "enabledClass" : "KeyboardCtrlDeleteBtn_En",
        "downClass" : "KeyboardCtrlDeleteBtn_Dwn",
        "heldClass" : "KeyboardCtrlDeleteBtn_Hd",
    };
    this._btnBackspace = framework.instantiateControl(this.uiaId, _controlsWrapper, "ButtonCtrl", _btnProperties);

    // append controls
    this._btnWrapper.appendChild(_controlsWrapper);

    // append all buttons
    this.divElt.appendChild(this._btnWrapper);

    // Add it to the DOM
    this.parentDiv.appendChild(this.divElt);
};

KeyboardCtrl.prototype._addListeners = function(element)
{
    element.addEventListener(this._MOUSEDOWNEVENT, this._btnDownCallback, false);
    element.addEventListener(this._MOUSEOUTEVENT, this._btnOutCallback, false);
    element.addEventListener(this._MOUSEOVEREVENT, this._btnOverCallback, false);
};

KeyboardCtrl.prototype._removeListeners = function(element)
{
    element.removeEventListener(this._MOUSEDOWNEVENT, this._btnDownCallback, false);
    document.body.removeEventListener(this._MOUSEUPEVENT, this._btnUpCallback, false);
    element.removeEventListener(this._MOUSEOUTEVENT, this._btnOutCallback, false);
    element.removeEventListener(this._MOUSEOVEREVENT, this._btnOverCallback, false);
};

/*
 * =================
 * STARTUP UTILITIES
 * =================
 */

/*
 * Fill the input string with the value property
 */
KeyboardCtrl.prototype._fillInputWithStr = function(startingStr)
{
    if (startingStr != null && startingStr != "")
    {
        this._suppressConvUpdate = true;
        this._initialise = true; //Keyboard is opening with input string, don't change layout to small case
        this._btnClicked(startingStr);
    }
};

KeyboardCtrl.prototype._setPlaceholder = function()
{
    if (this.properties.placeholderTextId && this.properties.placeholderTextId != "")
    {
        this._inputSpan.classList.add('placeholder');
        this._inputSpan.innerText = framework.localize.getLocStr(this.uiaId, this.properties.placeholderTextId, this.properties.placeholdersubMap);
        this._hasPlaceholder = true;
    }
    else if(this.properties.placeholderText)
    {
        this._inputSpan.classList.add('placeholder');
        this._inputSpan.innerText = this.properties.placeholderText;
        this._hasPlaceholder = true;
    }
    else
    {
        log.debug("No placeholder text has been specified");
    }
};

KeyboardCtrl.prototype._setInitialFocusKey = function()
{
    //if this._previousFocus != null, then set to this._previousFocus
    //else, set to upper left alpha key
    if (this._prevFocus && this._prevCssStyle && (this._prevCssStyle == this._cssStyle))
    {
        //set highlight on this._prevFocus
        this._focusData = this._prevFocus;
    }
    else
    {
        var layoutIndex = this._getLayoutIndex();
        //either the layout changed (meaning the focus data could be invalid), or there wasn't data to begin with
        this._focusData.row = 1;
        if (this._layouts[this.properties.locale][layoutIndex].startRow)
        {
            this._focusData.row = this._layouts[this.properties.locale][layoutIndex].startRow;
        }
        else if (this._conversionLang)
        {
            this._focusData.row = 2;
        }

        this._focusData.col = 0;
        if (this._layouts[this.properties.locale][layoutIndex].startCol)
        {
            this._focusData.col = this._layouts[this.properties.locale][layoutIndex].startCol;
        }
    }

    if (this._editMode)
    {
        this._setEditMode(false);
    }
    this._focusedKey = this._getFocusedKey(false);
    this._setKeyFocused(this._focusedKey, true);

};

/*
 * =====================================
 * CONTROL FUNCTIONS FOR CUSTOM TEXTBOX
 * =====================================
 */

// Click handler for the custom textbox. Updated 4/26 based on latest spec change
KeyboardCtrl.prototype._changeCaretHandler = function(e, source)
{
    if (e.target.dataset.enabled === "false")
    {
        return;
    }
    if (this._caret.dataset.enabled === "false")
    {
        return;
    }
    framework.common.beep("Short", source);
    if (this._editMode)
    {
        //put focus on this._input
        this._focusData.row = 0;
        this._focusData.col = 0;
    }
    else
    {
        this._moveCaret(e.clientX, "click");
    }

    //all three cases toggle edit mode, so its out here
    this._setEditMode(!this._editMode);
};

/*
 * Shift the caret to the correct position relative
 * to the string and the span containing it.
 *
 * @xData:      the x coordinate of the new caret position
 * @trigger:    which event caused the caret to move
 *         - click: clicking/touching the text box or multi-controller scrolling
 *         - delete: delete button pressed, or left bump in edit mode
 *         - insert: a character was entered
 *
 * Can be called from:          trigger:
 * _changeCaretHandler()       click
 * _incrementCaret()            click
 * _setCaretToEnd()             click
 * _combineCharacters()         replace
 * _btnClicked()                insert
 * _suggestionSelectHelper()    insert
 * _deleteCharacter()           delete
 */
KeyboardCtrl.prototype._moveCaret = function(xData, trigger, pos)
{
    if (xData < 0)
    {
        log.debug("text span just got smaller without delete");
    }

    switch(trigger)
    {
        case "click":
            if (this._noInsert)
            {
                log.debug("Character insertion is disabled");
                return;
            }

            var eventPositionX = xData;
            var proposedCaretOffset = eventPositionX - this._inputDivLeft - this._spanOffset;
            var caretSlot = 0;
            var prevCaretSlot;
            var i;

            for (i=0; i<this._characterSizes.length; i++)
            {
                prevCaretSlot = caretSlot;
                caretSlot += this._characterSizes[i];
                if (proposedCaretOffset <= caretSlot)
                {
                    break;
                }
            }

            log.debug("prop: " + proposedCaretOffset + " between " + prevCaretSlot + ", " + caretSlot);

            if (i == 0)
            {
                this._caretPos = 0;
                this._caretOffset = caretSlot;
            }
            else if (i == this._characterSizes.length)
            {
                this._caretPos = this._characterSizes.length - 1;
                this._caretOffset = caretSlot;
            }
            else
            {
                var marginToLeft = proposedCaretOffset - prevCaretSlot;
                var marginToRight = caretSlot - proposedCaretOffset;
                if (marginToLeft < marginToRight)
                {
                    this._caretPos = i-1;
                    this._caretOffset = prevCaretSlot;
                }
                else
                {
                    this._caretPos = i;
                    this._caretOffset = caretSlot;
                }
            }

            //update _candidateZeroCaretPos if highlight exists
            if (this._highlightPos.start > -1)
            {
                this._candidateZeroCaretPos = this._caretPos - this._highlightPos.start;
                this._positionDebugCaret();
            }

            this._caretOffset += this._spanOffset;
            break;

        case "replace":
            var caretIndex;
            if (pos !== null && pos !== undefined)
            {
                caretIndex = pos;
            }
            else
            {
                caretIndex = this._caretPos;
                this._caretOffset += xData;
            }
            this._characterSizes[caretIndex] += xData;
            this._updateHighlightedArea();
            this._positionDebugCaret();
            break;

        case "insert":
            var charWidth = xData;
            this._caretPos++;
            this._characterSizes.splice(this._caretPos, 0, charWidth);
            this._caretOffset += charWidth;
            break;

        case "delete":
            var charWidth = this._characterSizes.splice(this._caretPos, 1);
            this._caretPos--;
            this._caretOffset -= charWidth;
            break;

        default:
            log.debug("default caret switch");
            break;
    }


    //for rtl, keep at far left of string.. only move cursor for ltr languages..
    if (this._caretOnLeft())
    {
        this._caret.style.left = (this._inputDivXPadding-1) + "px";
        this._inputSpan.style.left = this._inputDivXPadding + "px";
    }
    else
    {
        this._caretOffset += this._shiftSpan();
        this._caret.style.left = (this._caretOffset-1) + "px";
    }

    this._checkModKeyStatus();
};

KeyboardCtrl.prototype._positionDebugCaret = function()
{
    var offset = 0;
    for (var i=0; i<=this._candidateZeroCaretPos; i++)
    {
        offset += this._characterSizes[this._highlightPos.start + i];
    }
    //set style.left to offset
    this._debugCaret.style.left = offset + this._suggDivXPadding + "px";
};

/*
 * called from _moveCaret().
 *
 * Once the caret has been shifted to the appropriate location
 * within the string, shift the span (if necessary) to display
 * the correct section of the string.
 */
KeyboardCtrl.prototype._shiftSpan = function()
{
    var shift = null;
    //caretPos is the caret position relative to the beginning of the string.
    if (this._caretOffset < this._minCaretOffset)
    {
        shift = this._minCaretOffset - this._caretOffset;
    }
    else if (this._caretOffset > this._maxCaretOffset)
    {
        shift = this._maxCaretOffset - this._caretOffset;
    }
    else    //caret is within range, but inputSpan may not be
    {
        shift = 0;

        var shiftedLeft = this._minCaretOffset - this._spanOffset;
        var spaceToRightEdge = this._maxCaretOffset - (this._inputSpan.clientWidth + this._spanOffset);

        if (shiftedLeft > 0 && spaceToRightEdge > 0)    // span is shifted left, and span right edge isn't touching inputDiv's right edge
        {

            if (shiftedLeft <= spaceToRightEdge)
            {
                shift += shiftedLeft;
            }
            else
            {
                shift += spaceToRightEdge;
            }
        }
    }

    this._spanOffset += shift;
    this._inputSpan.style.left = this._spanOffset + "px";

    if (this._conversionLang)
    {
        this._highlightSpanOffset += shift;
        this._highlightedSpan.style.left = this._highlightSpanOffset + "px";
    }

    return shift;

};

/*
 * Shifts the caret one position left or right based on
 * Multi-controller rotate event. Calls _moveCaret()
 *
 * @direction: "right" or "left"
 *      - "right" from a cw event
 *      - "left" from a ccw event
 */
KeyboardCtrl.prototype._incrementCaret = function(direction)
{
    var caretAtEnd = true;

    if (this._caret.dataset.enabled === "false")
    {
        return;
    }

    if (direction == "right")
    {
        if (this._caretPos < this._characterSizes.length - 1)
        {
            caretAtEnd = false;
            this._caretPos++;
            this._candidateZeroCaretPos++;
        }
    }
    else    //"left"
    {
        if (this._caretPos > 0)
        {
            caretAtEnd = false;
            this._caretPos--;
            this._candidateZeroCaretPos--;
        }
    }

    if (!caretAtEnd)
    {
        var newXData = 0;
        for (var i=0; i<=this._caretPos; i++)
        {
            newXData += this._characterSizes[i];
        }
        this._moveCaret(newXData + this._inputDivLeft + this._spanOffset, "click");
    }
    else
    {
        log.debug("caret at end of string");
    }
};

/*
 * Calculates the caret offset for the end of the input
 * string, then calls _moveCaret().
 */
KeyboardCtrl.prototype._setCaretToEnd = function()
{
    if (this._input.dataset.enabled === "false")
    {
        return;
    }

    //set cursor at end of string
    this._caretPos = this._characterSizes.length - 1;
    this._candidateZeroCaretPos = this._candidateZero.length;

    var newXData = 0;
    for (var i=0; i<=this._caretPos; i++)
    {
        newXData += this._characterSizes[i];
    }
    //logically move caret to end of input text (visually moves to the far right)
    this._moveCaret(newXData + this._inputDivLeft + this._spanOffset, "click");

    //if we are in an rtl language, visually move the cursor back to the left
    if (this._caretOnLeft())
    {
        this._caret.style.left = (this._inputDivXPadding-1) + "px";
        this._inputSpan.style.left = this._inputDivXPadding + "px";
    }
};

KeyboardCtrl.prototype._caretOnLeft = function()
{
    if ((this._isRtlLang == true || this._containsThaiOrRtl() == true) && this._systemLangRtl == true && this._specialLayout == false)
    {
        return true;
    }
    else
    {
        return false;
    }
};

KeyboardCtrl.prototype._updateConversionCandidateStr = function(val, canGrowHighlight)
{
    var _highlightedStrMaxLength = -1;
    var newHighlightStr = "";

    //By the time this function is called, if the spacebar was pressed, val has
    // been converted to a literal space for insertion into the display string,
    // so this checks if the spacebar has been pressed
    if (val === ' ' || val === ',')
    {
        // accept text, clear suggestions
        this._candidateZero = '';
        newHighlightStr = '';
        this._highlightPos.start = -1;
        this._highlightPos.end = -1;
        this._candidateZeroCaretPos = 0;
        this._clearSuggestions();
    }                   //_caretPos has NOT been incremented at this point when inserting a character.
    else if ((this._caretPos < this._highlightPos.start) || (this._caretPos > this._highlightPos.end))
    {
        log.debug(val + " added <-outside-> of highlight");
        // text added to an area other than the currently highlighted area.. accept text and start a new highlighted string
        if (canGrowHighlight)
        {
            this._candidateZero = val;
            newHighlightStr = val;
            this._highlightPos.start = this._caretPos;
            this._highlightPos.end = this._caretPos + 1;
            this._candidateZeroCaretPos = 1;
        }
    }
    else
    {
        //text added to currently highlighted area
        log.debug(val + " added ->within<- highlight, possibly hidden");
        var stringStart = this._candidateZero.substring(0, this._candidateZeroCaretPos);
        var stringEnd = this._candidateZero.substring(this._candidateZeroCaretPos, this._candidateZero.length);
        this._candidateZero = stringStart + val + stringEnd;
        this._candidateZeroCaretPos++;

        if (canGrowHighlight)
        {
            this._highlightPos.end++;
        }
        var highlightStrLen = this._getMaxHighlightLength();
        newHighlightStr = this._candidateZero.substring(0, highlightStrLen);

    }

    log.debug("_caretPos: " + this._caretPos);
    log.debug("_candidateZeroCaretPos: " + this._candidateZeroCaretPos);
    log.debug("_highlightPos.start: " + this._highlightPos.start + " .end " + this._highlightPos.end);

    this._lastEnteredKey.row = this._focusData.row;
    this._lastEnteredKey.col = this._focusData.col;

    return newHighlightStr;
};

KeyboardCtrl.prototype._getMaxHighlightLength = function()
{
    var stringBefore = this._inputStr.substring(0, this._highlightPos.start);
    var stringAfter = this._inputStr.substring(this._highlightPos.end);
    var bytesBefore = this._countBytes(stringBefore);
    var bytesAfter = this._countBytes(stringAfter);

    var bytesRemaining = this.properties.maxBytes - (bytesBefore + bytesAfter);
    var maxHighlightLength = 0;

    for (var i=0; i<this._candidateZero.length; i++)
    {
        bytesRemaining -= this._getUtf8ByteSize(this._candidateZero.charCodeAt(i));
        if (bytesRemaining < 0)
        {
            maxHighlightLength = i;
            break;
        }
    }

    // if it never got past zero, max is length of candidate string
    if (bytesRemaining >= 0)
    {
        maxHighlightLength = this._candidateZero.length;
    }

    return maxHighlightLength;
};

KeyboardCtrl.prototype._updateHighlightedArea = function()
{
    log.debug("updating highlighted area. ", this._highlightPos.start, this._highlightPos.end);

    var highlightLeft = 0;
    for (var i=0; i<=this._highlightPos.start; i++)
    {
        highlightLeft += this._characterSizes[i];
    }

    var highlightWidth = 0;
    for (var i=this._highlightPos.start + 1; i<=this._highlightPos.end; i++)
    {
        highlightWidth += this._characterSizes[i];
    }

    this._highlightSpanOffset = highlightLeft + this._spanOffset;
    this._highlightedSpan.style.left = this._highlightSpanOffset + "px";
    this._highlightedSpan.style.width = highlightWidth + "px";
};

KeyboardCtrl.prototype._BPMFToLatin = function(bpmfStr)
{
    log.debug("_BPMFToLatin called");
    var latinConvertedStr = "";
    for(var i =0; i<bpmfStr.length; i++)
    {
    	var found = false;
    	for(var character in this._bopomofoCharMap)
    	{
    		if(bpmfStr[i] == character)
    		{
    			latinConvertedStr = latinConvertedStr + this._bopomofoCharMap[character];
    			found = true;
    			break;
    		}
    	}
    	if(!found)
    	latinConvertedStr = latinConvertedStr + bpmfStr[i];
    }
    return latinConvertedStr;
};

KeyboardCtrl.prototype._updateSuggestions = function()
{
    log.debug("_updateSuggestions called");

    var _newSuggestions = '';

    if (this._candidateZero === '' || this._candidateZero === ' ' || this._candidateZero === ',')
    {
        log.info("Candidate string not sent to character converter.");
        return;
    }

    //fill suggestion divs accordingly..
    this._suggestionDivs[0].dataset.value = this._candidateZero;
    this._suggestionDivs[0].innerText = this._candidateZero;
    this._suggestionDivs[0].dataset.enabled = "true";

    if(this.properties.locale == 'mn_TW')
    {
    	this._candidateZero = this._BPMFToLatin(this._candidateZero); //Convert from bopomofo to Latin for sending to prediction engine
    }


    if (this._predEngine)
    {
        _newSuggestions = this._predEngine.GetPrediction(this._candidateZero).split(",");

        log.debug("Key: ", this._candidateZero, "   count: ", _newSuggestions.length, "   value: ", _newSuggestions);

        //FIXME: remove this once implemented in the plugin
        if (_newSuggestions.length > 50)
        {
            _newSuggestions = _newSuggestions.slice(0, 50); //grab 50 elements in the array starting at index 0.
        }

        for (var i=_newSuggestions.length-1; i>=0; i--)
        {
            if (this._candidateZero === _newSuggestions[i])
            {
                _newSuggestions.splice(i, 1);
            }
            if(_newSuggestions[i] == '')
            {
                _newSuggestions.splice(i,1);
            }
        }

        this._numSuggestions = _newSuggestions.length + 1; // +1 for entered text

        // need to loop over the number of new suggestions or the number of existing suggestion divs, whichever is longer
        var _loopMax = (this._numSuggestions > this._suggestionDivs.length) ? this._numSuggestions : this._suggestionDivs.length;

        for (var i = 1; i<_loopMax; i++)
        {
            if (i < this._numSuggestions)
            {
                //set sugg text if index already exists, else create it with sugg text
                if (this._suggestionDivs[i])
                {
                    this._suggestionDivs[i].dataset.value = _newSuggestions[i - 1];
                    this._suggestionDivs[i].innerText = _newSuggestions[i - 1];
                    this._suggestionDivs[i].dataset.enabled = "true";
                }
                else
                {
                    var _newSugg;
                    _newSugg = document.createElement('span');
                    _newSugg.className = 'suggestionSpan';
                    _newSugg.appendChild(document.createTextNode(''));
                    _newSugg.setAttribute('data-value', _newSuggestions[i - 1]);
                    _newSugg.setAttribute('data-enabled', "true");
                    _newSugg.innerText = _newSuggestions[i - 1];
                    _newSugg.id = 'suggestion' + i;
                    this._addListeners(_newSugg);
                    this._suggestionWrapper.appendChild(_newSugg);
                    this._suggestionDivs.push(_newSugg);
                    this._suggestionWidths.push(0);
                }
            }
            else if (i > 8) //need to keep >= 8 suggestions for blank row, so remove any unneeded divs
            {
                //if index exists, it doesn't need to for this set of suggestions.
                // remove listener; pop remaining indeces from arrays; exit for
                for (var j=this._suggestionDivs.length - 1; j>=i; j--)
                {
                    this._removeListeners(this._suggestionDivs[j]);
                    this._suggestionWrapper.removeChild(this._suggestionDivs[j]);
                    this._suggestionDivs.pop();
                    this._suggestionWidths.pop();
                }
                //exit loop because I just got rid of every remaining index in the array.
                break;

            }
            else
            {
                //just remove text
                this._suggestionDivs[i].dataset.value = "";
                this._suggestionDivs[i].innerText = "";
                this._suggestionDivs[i].dataset.enabled = "false";
            }
        }
    }
    else
    {
        for (var i=1; i<this._suggestionDivs.length; i++)
        {
            this._suggestionDivs[i].dataset.value = "";
            this._suggestionDivs[i].innerText = "";
            this._suggestionDivs[i].dataset.enabled = "false";
        }

        log.debug("no suggestions exist");
    }

    this._resizeSuggestions();

    //reset scrolling position
    this._suggestionOffset = 0;
    this._suggestionWrapper.style.left = this._suggestionOffset + 'px';
    this._firstVisibleSuggestion = 0;
    this._updateVisibleSuggCount();

    //return number of suggestions (so I can check if it's non-zero, and enable/disable the arrows)
    return _newSuggestions.length;
};

KeyboardCtrl.prototype._updateVisibleSuggCount = function()
{
    if (this._firstVisibleSuggestion % 1 == 0)
    {
        var sum = this._suggestionWidths[this._firstVisibleSuggestion];
        var i=0;
        while (sum <= this._visibleSuggWidth && this._suggestionDivs[this._firstVisibleSuggestion + i].dataset.value != '')
        {
             i++;
             sum += this._suggestionWidths[this._firstVisibleSuggestion + i];
        }
        this._visibleSuggCount = i;
    }
    else
    {
        this._visibleSuggCount = this._numSuggestions - this._firstVisibleSuggestion - 0.5;
    }
    if(this._visibleSuggCount == 0 && this._numSuggestions > 0)
    {
        this._visibleSuggCount = 1;
    }
    //if the suggestions have expanded/shrunk, then we may have to add/remove items to the focus duplicates
    //update this._focusData.focusDuplicates here
    var duplicateStart = this._visibleSuggCount + 1;
    if (this._visibleSuggCount > 0 && duplicateStart <= this._focusData.columns - 1)
    {
        this._focusData.focusDuplicates[1] = [duplicateStart, this._focusData.columns - 1];
    }
    else
    {
        this._focusData.focusDuplicates[1] = [];
    }
};

KeyboardCtrl.prototype._resizeSuggestions = function()
{
    this._maxSuggOffset = this._leftArrow.clientWidth + 2;       // 2 for the border
    for (var i=0; i<this._numSuggestions; i++)
    {
        this._suggestionWidths[i] = this._suggestionDivs[i].clientWidth;
        this._maxSuggOffset += this._suggestionWidths[i];
    }

    this._updateVisibleSuggCount();
};

KeyboardCtrl.prototype._moveSuggestions = function(source)
{
    if (source == 'left')
    {
        if (this._firstVisibleSuggestion > 0)
        {
            if (this._firstVisibleSuggestion % 1 == 0)
            {
                this._suggestionOffset += (this._suggestionWidths[this._firstVisibleSuggestion - 1]);
                this._firstVisibleSuggestion--;
            }
            else
            {
                //loop until i > this._suggestionOffset, recreating suggestionOffset
                this._suggestionOffset = 0;
                var i;
                for (i=0; i<this._firstVisibleSuggestion - 1; i++)
                {
                    this._suggestionOffset -= this._suggestionWidths[i];
                }


                this._firstVisibleSuggestion = i;

            }
        }
    }
    else
    {
        if (this._firstVisibleSuggestion % 1 == 0)
        {
            //loop from firstVisibleSuggestion+1 to end.. if width sum > visibleWidth, shift them.. if not.. shift the right most over...
            var widthRemaining = 0;
            for (var i=this._firstVisibleSuggestion; i<this._numSuggestions; i++)
            {
                widthRemaining += this._suggestionWidths[i];
            }

            if (widthRemaining > this._visibleSuggWidth + this._suggestionWidths[this._firstVisibleSuggestion])
            {
                this._suggestionOffset -= (this._suggestionWidths[this._firstVisibleSuggestion]);
                this._firstVisibleSuggestion++;
            }
            else if (widthRemaining > this._visibleSuggWidth)
            {
                this._suggestionOffset -= widthRemaining - this._visibleSuggWidth;
                this._firstVisibleSuggestion += 0.5;
            }
            else
            {
                //no suggestions off screeen
                //do nothing
                log.debug("ignoring click, not enough suggestions");
            }
        }
        else
        {
            log.debug("ignoring click, at the end");
        }
    }
    this._updateVisibleSuggCount();
    this._suggestionWrapper.style.left = this._suggestionOffset + 'px';
};

KeyboardCtrl.prototype._clearSuggestions = function()
{
    if (this._candidateZero == "")
    {
        //TODO: enable disable arrows here? or a different check that checks if scrolling is possible
        for (var i=this._suggestionDivs.length - 1; i>=8; i--)
        {
            this._suggestionDivs[i].removeEventListener(this._CLICKEVENT, this.suggestionHandler, false);
            this._suggestionWrapper.removeChild(this._suggestionDivs[i]);
            this._suggestionDivs.pop();
            this._suggestionWidths.pop();
        }
        for (var j=7; j>=0; j--)
        {
            this._suggestionDivs[j].dataset.value = "";
            this._suggestionDivs[j].innerText = "";
            this._suggestionDivs[j].dataset.enabled = "false";
        }
    }
    else
    {
        for (var i=this._suggestionDivs.length - 1; i>=0; i--)
        {
            this._suggestionDivs[i].dataset.value = "";
            this._suggestionDivs[i].innerText = "";
            this._suggestionDivs[j].dataset.enabled = "false";
        }
    }

    //reset offset
    this._suggestionOffset = 0;
    this._suggestionWrapper.style.left = this._suggestionOffset + 'px';
    this._firstVisibleSuggestion = 0;
    this._updateVisibleSuggCount();
    this._numSuggestions = 0;
};

KeyboardCtrl.prototype._combineCharacters = function(source)
{
    var modChar;
    var hasAlternate = false;

    //get the character just before the cursor
    var oldChar = this._candidateZero.charAt(this._candidateZeroCaretPos - 1);

    //if modChar is in this._combiner, get the value, set hasAlternate
    modChar = this._candidateZero.charAt(this._candidateZeroCaretPos - 1);
    if (modChar in this._combiner)
    {
        hasAlternate = true;
        modChar = this._combiner[modChar];
    }

    if (hasAlternate)
    {
        framework.common.beep("Short", source);
        var oldWidth = this._inputSpan.clientWidth;
        var oldHighlightedStr = this._highlightedStr;

        // update the highlighted string, if cursor is in highlighted area
        if (this._candidateZeroCaretPos > 0 && this._caretPos <= this._highlightPos.end)
        {
            stringStart = this._candidateZero.substring(0, this._candidateZeroCaretPos - 1);
            stringEnd = this._candidateZero.substring(this._candidateZeroCaretPos, this._candidateZero.length);
            this._candidateZero = stringStart + modChar + stringEnd;
            //update this._highlightedStr
            this._highlightedStr = this._candidateZero.substring(0, this._highlightPos.end - this._highlightPos.start);
        }

        //slide the new character back into the string if _highlightedStr has changed
        if (this._highlightedStr !== oldHighlightedStr)
        {
            var stringStart = this._inputStr.substring(0, this._caretPos - 1);
            var stringEnd = this._inputStr.substring(this._caretPos, this._inputSpan.innerText.length);
            this._inputStr = stringStart + modChar + stringEnd;
            this._inputSpan.innerText = this._displayString(this._inputStr);
        }

        // update caret position -- _moveCaret() updates characterSizes[]
        this._moveCaret(this._inputSpan.clientWidth - oldWidth, "replace");

        this._byteCount += this._getUtf8ByteSize(modChar.charCodeAt(0)) - this._getUtf8ByteSize(oldChar.charCodeAt(0));

        this._updateHighlightedArea();
        this._updateSuggestions();
    }
};

KeyboardCtrl.prototype._checkModKeyStatus = function()
{
    if (this.properties.locale == 'ja_JP_ABC')
    {
        var modChar = this._candidateZero.charAt(this._candidateZeroCaretPos - 1);

        if ((modChar in this._combiner) && (this._candidateZeroCaretPos > 0 && this._caretPos <= this._highlightPos.end))
        {
            this._setKeyEnabled(this._modKey, true);
        }
        else
        {
            this._setKeyEnabled(this._modKey, false);
        }
    }
};

/*
 * ===============
 * INPUT HANDLERS
 * ===============
 */

KeyboardCtrl.prototype._inputDownHandler = function(e)
{
    log.debug("_inputDownHandler");
    if (this._input.dataset.enabled === "false")
    {
        return;
    }
    if (this._selectMode === null)
    {
        this._selectMode = "touch";
        if (!this._editMode)
        {
            if (this._focusedKey !== this._input)
            {
                this._setKeyFocused(this._focusedKey, false);
            }
            this._targetToFocusdata(this._input);
        }
        this._setKeyDownHighlight(this._input, true);
    }
    this._inputKeyPressed = true;
    document.body.addEventListener("mouseup", this._inputUpCallback);
};
//
KeyboardCtrl.prototype._inputUpHandler = function(e)
{
    log.debug("_inputUpHandler");
    if (this._input.dataset.enabled === "false")
    {
        return;
    }
    if (this._selectMode === "touch")
    {
        if (this._inputKeyPressed)
        {
            this._changeCaretHandler(e, "Touch");
            this._setKeyDownHighlight(this._input, false);
            this._inputKeyPressed = false;
        }
        document.body.removeEventListener("mouseup", this._inputUpCallback);
        this._selectMode = null;
    }
};
//
KeyboardCtrl.prototype._inputOverHandler = function(e)
{
    log.debug("_inputOverHandler");
    if (this._input.dataset.enabled === "false")
    {
        return;
    }

    if (this._selectMode === "touch" && (this._inputKeyPressed))
    {
        //add held highlight
        this._setKeyDownHighlight(this._input, true);
    }
};

//
KeyboardCtrl.prototype._inputOutHandler = function(e)
{
    log.debug("_inputOutHandler");
    if (this._input.dataset.enabled === "false")
    {
        return;
    }
    if (this._selectMode === "touch" && (this._inputKeyPressed))
    {
        //remove held highlight
        this._setKeyDownHighlight(this._input, false);
    }
};
/*
 * =============================
 * KEYBOARD HANDLERS AND HELPERS
 * =============================
 */

//
KeyboardCtrl.prototype._btnDownHandler = function(e)
{
    if (e.target.dataset.enabled === "false")
    {
        return;
    }
    else if (!this._isSuggestionPopulated() && e.target.className.indexOf("suggestion") == 0)
    {
        // suggestion row is empty.. ignore
        return;
    }

    var _btnPressed = e.currentTarget;

    if (e.target.dataset.value == "fade")
    {
        //click on the fade divs on the edges of the input field.. use the input field as the target
        _btnPressed = this._input;
    }

    if (this._selectMode === null)
    {
        this._selectMode = "touch";
        this._downKey = _btnPressed;

        // move focus.. if focus is already on target, don't remove it because it won't get re-added in _targetToFocusdata()
        if (this._focusedKey !== _btnPressed)
        {
            this._setKeyFocused(this._focusedKey, false);
        }

        if (this._editMode !== true || _btnPressed !== this._input)
        {
            //if toggling edit mode but not moving focusData, don't call _targetToFocusData
            // because it will set editMode to false.
            this._targetToFocusdata(_btnPressed);
        }

        this._setKeyDownHighlight(_btnPressed, true);
        // no selectStart behaviors for non-delete keys

        // _btnUpCallback used here as bound reference. Opera will correctly see a different target element when removing listener
        document.body.addEventListener("mouseup", this._btnUpCallback);
    }
};

//
KeyboardCtrl.prototype._btnUpHandler = function(e)
{
    //log.info(this._downKey.dataset.value, e.target.dataset.value);
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    var _btnReleased = e.target;

    if (e.target.dataset.value == "fade" || e.target.dataset.value == "textSpan")
    {
        //click on the fade divs on the edges of the input field or the text span within the input field.. use the input field as the target
        _btnReleased = this._input;
    }

    if (this._selectMode === "touch")
    {
        document.body.removeEventListener("mouseup", this._btnUpCallback);

        if (this._downKey === _btnReleased)
        {
            switch (_btnReleased.dataset.value) //delete key is a buttonCtrl and won't be handled here
            {
                case "input":
                case "fade":
                case "caret":
                    this._changeCaretHandler(e, "Touch");
                    break;
                case "layout":
                case "shift":
                    this._changeLayoutHandler(e, "Touch");
                    break;
                case "OK":
                    this._processInputHandler(e, "Touch");
                    break;
                case "cancel":
                    this._cancelHandler(e, "Touch");
                    break;
                case "globe":
                    this._changeLanguageHandler(e, "Touch");
                    break;
                case "space":
                    this._btnSelectHandler(e, "Touch");
                    break;
                case "mod":
                    this._combineCharacters("Touch");
                    break;
                default:
                    if (_btnReleased.className.indexOf("suggestion") == 0)
                    {
                        this._suggestionSelectHandler(e, "Touch");
                    }
                    else if (_btnReleased.parentElement.classList.contains("row")) //"buttons"
                    {
                        this._btnSelectHandler(e, "Touch");
                    }
                    break;
            }
        }

        this._setKeyDownHighlight(_btnReleased, false);

        this._selectMode = null;
        this._downKey = null;
    }
};

//
KeyboardCtrl.prototype._btnOverHandler = function(e)
{
    if (e.target.classList.contains("disabled"))
    {
        return;
    }

    var _btnOver = e.target;
    if (e.target.dataset.value == "fade" || e.target.dataset.value == "textSpan")
    {
        //click on the fade divs on the edges of the input field or the text span within the input field.. use the input field as the target
        _btnOver = this._input;
    }

    if (this._selectMode === "touch" && this._downKey === _btnOver)
    {
        //add held highlight
        this._setKeyDownHighlight(_btnOver, true);
        // need to update this._focusData.row and .col
    }
};

//
KeyboardCtrl.prototype._btnOutHandler = function(e)
{
    if (e.target.classList.contains("disabled"))
    {
        return;
    }

    var _btnOut = e.target;
    if (e.target.dataset.value == "fade" || e.target.dataset.value == "textSpan")
    {
        //click on the fade divs on the edges of the input field or the text span within the input field.. use the input field as the target
        _btnOut = this._input;
    }

    if (this._selectMode === "touch" && this._downKey === _btnOut)
    {
        //remove held highlight
        this._setKeyDownHighlight(_btnOut, false);
        //NOTE: If user shouldn't be able to press key after sliding off then back on and releasing, set this._downKey = null here
    }
};


/*
 * REGULAR BUTTONS
 */

// handles (non-control) button clicks
KeyboardCtrl.prototype._btnSelectHandler = function(e, source)
{
    // exit if the button is disabled
    if (e.target.dataset.enabled == "false")
    {
        return;
    }

    framework.common.beep("Short", source);
    this._btnClicked(e.target.dataset.value);
};

/*
 * helper function for _btnSelectHandler, called directly
 * from a multicontroller select on a button (to bypass setting edit mode)
 */
KeyboardCtrl.prototype._btnClicked = function(value)
{
    //Check the param for some special cases
    var val = value;
    var wasCombiner = false;    // (Boolean) Flag to track characters vs. "combiners"

    if (val == '')
    {
        // This case occurs when coming back from focus restore and the current user string is empty
        // need to return in order to avoid the keyboard switching from the default shift state to lowercase
        return;
    }
    if (val == 'space')
    {
        // The spacebar was pressed, set val as a literal space to be inserted in the string, no need to update candidates
        val = ' ';
    }

    if (val.length > 1)
    {
        if (this._thaiCombiners.indexOf(val) > -1)
        {
            //This is a combiner character in Thai, remove leading two characters used for display purposes
            val = val.charAt(val.length-1);
            log.debug(val + " --- Thai combiner");
            wasCombiner = true;
        }
        else
        {
            //This is a multi-character button (e.g. ^_^)
            //loop through the rest of the function val.length times
            //no need to do anything extra for now.. maybe needed if Thai combiner characters change to icons
        }
    }

    for (var i=0; i<val.length; i++)
    {
        var oldWidth = this._inputSpan.clientWidth;
        var canExtendHighlight = true;

        // if placeholder text is shown, remove it and change the color back to normal
        if (this._hasPlaceholder)
        {
            this._inputSpan.classList.remove('placeholder');
            oldWidth = 0;
            this._hasPlaceholder = false;
        }

        //since we are entering a character, we are safe to enable the OK button
        this._setKeyEnabled(this._ok, true);

        //Check character count.. and byte count
        //this._characterSizes[0] is 0 for caret positioning purposes... so there is an extra index in that array
        if (this.properties.maxChars > 0 && (this._characterSizes.length > this.properties.maxChars)
            || this.properties.maxBytes > 0 && (this._byteCount + this._getUtf8ByteSize(val.charCodeAt(i)) > this.properties.maxBytes))
        {
            //Trying to add more than character (or byte) limit. May need to add character to suggestion
            canExtendHighlight = false;
        }
        // Character would fit, but do not start conversion if buffer has been cut into before character was entered
        else if (this._conversionLang === true && (this.properties.maxBytes > 0) && this._highlightedStr === ""
                 && (this._byteCount > (this.properties.maxBytes - this._byteBuffer)))
        {
            canExtendHighlight = false;
        }
        else
        {
            //character can fit, but need to check if there is already hidden char(s)
            if (this.properties.maxBytes > 0 && (this._candidateZero.length > this._highlightedStr.length)
                 && (this._candidateZeroCaretPos > this._highlightedStr.length))
            {
                // .. in which case we need to make sure we add them to the correct location
                canExtendHighlight = false;
            }
            else
            {
                canExtendHighlight = true;
                // calculate new string
                var stringStart = this._inputStr.substring(0, this._caretPos);
                var stringEnd = this._inputStr.substring(this._caretPos, this._inputSpan.innerText.length);
                this._inputStr = stringStart + val.charAt(i) + stringEnd;
                this._inputSpan.innerText = this._displayString(this._inputStr);
                //update bytecount here
                this._byteCount += this._getUtf8ByteSize(val.charCodeAt(i));
            }
        }

        // if character converter is running, need to keep track of extra info
        if (this._suppressConvUpdate === false)
        {
            if ((this._isJaJpConversionLoaded && this.properties.locale == 'ja_JP_ABC')
            	|| (this._isMnTwConversionLoaded && (this.properties.locale == 'mn_TW'))
                || (this._isZhCnConversionLoaded && (this.properties.locale == 'zh_CN' || this.properties.locale == 'zh_CN_ABC'))
                || (this._isZhTwConversionLoaded && (this.properties.locale == 'zh_TW' || this.properties.locale == 'zh_TW_ABC'))
                || (this._isCnHkConversionLoaded && (this.properties.locale == 'cn_HK' || this.properties.locale == 'cn_HK_ABC')))
            {
                var oldHighlight = this._highlightedStr;
                this._highlightedStr = this._updateConversionCandidateStr(val.charAt(i), canExtendHighlight);

                this._updateHighlightedArea();
                this._updateSuggestions();
                //need to re-check mod key here because highlight has changed since last time it was checked
                this._checkModKeyStatus();

                //check if this._highlightedStr changed in previous function, update input string and cursor location accordingly
                //if this._highlightedStr was cleared (due to a space or comma), then no need to update string
                if (this._highlightedStr !== oldHighlight
                    && this._highlightedStr !== ""
                    && canExtendHighlight === false)
                {
                    // ** Insert new character
                    var oldWidth = this._inputSpan.clientWidth;
                    var stringStart = this._inputStr.substring(0, this._caretPos);
                    var stringEnd = this._inputStr.substring(this._caretPos);
                    this._inputStr = stringStart + val.charAt(i) + stringEnd;
                    // update caret position and byte count information
                    this._inputSpan.innerText = this._displayString(this._inputStr);
                    this._moveCaret(this._inputSpan.clientWidth - oldWidth, "insert", i);
                    this._highlightPos.end++;
                    this._highlightedStr = this._candidateZero.substring(0, this._highlightPos.end - this._highlightPos.start);
                    this._byteCount += this._getUtf8ByteSize(val.charCodeAt(i));

                    // ** Remove character(s) from tail end of highlight that no longer fit (if any).
                    var removeCharCount = this._getCharCountToRemove();
                    this._removeFromEndOfHighlight(removeCharCount);
                    this._updateHighlightedArea();
                }
                this._positionDebugCaret();
            }
        }

        if (canExtendHighlight)
        {
            // update caret position after updating converter
            this._moveCaret(this._inputSpan.clientWidth - oldWidth, "insert");
            if (this._highlightedSpan !== null && this._highlightedSpan !== undefined)
            {
                this._updateHighlightedArea();
            }
        }

        if (wasCombiner)
        {
            // After innerText has been set, the addition of a combiner
            // does not trigger a DOM element refresh. Force the refresh
            // by re-parenting _inputSpan.
            this._input.appendChild(this._inputSpan);
        }
        else
        {
            // No need to force refresh
        }

    }

    //reset to false.. is set to true before _btnClicked() is called each time, when necessary.
    this._suppressConvUpdate = false;

    //check if character insertion is still valid
    if (this._noInsert == false && this._isThaiOrRtl(val.charCodeAt(0)))
    {
        //set noInsert flag
        this._setCaretToEnd();
        this._noInsert = true;
        log.info("Disabling character insertion...");
    }

    // change layout if needed
    if (this._currentLayout == 'lettersCaps')
    {
        if (!this._initialise) //SW00145843 : Keyboard is opening with input string, don't switch to small case layout
        {
            this._currentLayout = 'lettersSmall';
            this._layoutUpdate(this._layouts[this.properties.locale][0].name);
        }
        else
        {
            this._initialise = false;
        }
        this._setKeyFocused(this._focusedKey, false);
        this._focusedKey = this._getFocusedKey(false);

        //_getFocusedKey() can return an object emulating a disabled button for _incrementFocus(), that check is made here
        if (this._focusedKey.dataset.enabled === "false" || (this._focusedKey === this._btnBackspace.divElt && this._btnBackspace.isEnabled === false))
        {
            this._setInitialFocusKey();
        }
        else
        {
            this._setKeyFocused(this._focusedKey, true);
        }
    }
};

KeyboardCtrl.prototype._countBytes = function(str)
{
    var byteCount = 0;
    for (var i=0; i<str.length; i++)
    {
        byteCount += this._getUtf8ByteSize(str.charCodeAt(i));
    }

    return byteCount;
};

/*
 * This function holds byte size information for UTF-8 encoded characters.
 * See the scheme table at http://en.wikipedia.org/wiki/UTF-8#Description for more information
 */
KeyboardCtrl.prototype._getUtf8ByteSize = function(unicodeVal)
{
    var bytes;
    if (unicodeVal < 0x007f)
    {
        bytes = 1;
    }
    else if (unicodeVal < 0x07ff)
    {
        bytes = 2;
    }
    else if (unicodeVal < 0xffff)
    {
        bytes = 3;
    }
    else if (unicodeVal < 0x1fffff)
    {
        bytes = 4;
    }
    else if (unicodeVal < 0x3ffffff)
    {
        bytes = 5;
    }
    else
    {
        bytes = 6;
    }

    return bytes;
};

// handles the suggestion row
KeyboardCtrl.prototype._suggestionSelectHandler = function(e, source)
{
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    log.debug("_suggestionSelectHandler called", e, e.target.id);
    framework.common.beep("Short", source);
    this._suggestionSelectHelper(e.target.id);
};

KeyboardCtrl.prototype._suggestionSelectHelper = function(id)
{
    switch (id)
    {
        case 'arrowLeft':
            this._setKeyFocused(this._focusedKey, false);
            this._focusData.row = 1;
            this._focusData.col = 0;
            this._focusedKey = this._leftArrow;
            this._setKeyFocused(this._focusedKey, true);
            this._moveSuggestions('left');
            break;
        case 'arrowRight':
            this._setKeyFocused(this._focusedKey, false);
            this._focusData.row = 1;
            this._focusData.col = this._focusData.columns - 1;
            this._focusedKey = this._rightArrow;
            this._setKeyFocused(this._focusedKey, true);
            this._moveSuggestions('right');
            break;

        default:
            if (id.indexOf('suggestion') >= 0) //make sure 'suggestion' is in ID
            {
                // A suggestion has been selected.
                //Note: characters seem to change size if there are Romanji characters around them....

                var selectedIndex = id.substring(10, id.length);
                var selectedText = this._suggestionDivs[selectedIndex].dataset.value;

                if (this._suggestionDivs[selectedIndex].dataset.value == "")
                {
                    log.debug("Empty suggestion div selected. Ingnored...");
                    return;
                }

                log.debug("Start", this._caretPos, this._characterSizes, this._inputSpan.clientWidth);

                // Delete highlighted text...
                this._caretPos = this._highlightPos.end;
                var _caretOffset = 0;
                for (i=0; i<=this._caretPos; i++)
                {
                    _caretOffset += this._characterSizes[i];
                }
                this._caretOffset = _caretOffset + this._spanOffset;

                for (var i=this._highlightPos.end; i>this._highlightPos.start; i--)
                {
                    this._deleteCharacter(true);
                    log.debug("deleting", this._caretPos, this._characterSizes, this._inputSpan.clientWidth);
                }

                // ... insert suggestion text...
                var maxSuggestionChars;
                if (this.properties.maxChars > 0 && (this.properties.maxChars - this._inputStr.length) < selectedText.length
                    || this.properties.maxBytes > 0 && (this.properties.maxBytes - this._byteCount) < this._countBytes(selectedText))
                {
                    //get the number of characters I can put in there from bytes here, set maxSuggestion Chars to the min
                    var bytesRemaining = this.properties.maxBytes - this._byteCount;
                    var maxByteCharCount = 0;
                    for (var i=0; i<selectedText.length; i++)
                    {
                        var bytes = this._getUtf8ByteSize(selectedText.charCodeAt(i));
                        if(bytes <= bytesRemaining)
                        {
                            maxByteCharCount++;
                            bytesRemaining -= bytes;
                        }
                        else
                        {
                            break;
                        }
                    }

                    var maxCharCharCount = this.properties.maxChars - this._inputStr.length;

                    if (this.properties.maxChars == 0)
                    {
                        //property not set, use maxBytes
                        maxSuggestionChars = maxByteCharCount;
                    }
                    else if (this.properties.maxBytes == 0)
                    {
                        //property not set, use maxChars
                        maxSuggestionChars = maxCharCharCount;
                    }
                    else
                    {
                        //Both properties are set, max char count is the smaller of the two
                        maxSuggestionChars = (maxByteCharCount < maxCharCharCount) ? maxByteCharCount : maxCharCharCount;
                    }

                }
                else
                {
                    maxSuggestionChars = selectedText.length;
                }

                for (var i=0; i<maxSuggestionChars; i++)
                {
                    var oldWidth = this._inputSpan.clientWidth;

                    var stringStart = this._inputStr.substring(0, this._caretPos);
                    var stringEnd = this._inputStr.substring(this._caretPos, this._inputSpan.innerText.length);
                    var newChar = selectedText.charAt(i);

                    this._inputStr = stringStart + newChar + stringEnd;
                    this._inputSpan.innerText = this._displayString(this._inputStr);

                    // update caret position -- _moveCaret() updates characterSizes[]
                    this._moveCaret(this._inputSpan.clientWidth - oldWidth, "insert");
                    log.debug("inserting", this._caretPos, this._characterSizes, this._inputSpan.clientWidth);

                    //update bytecount here
                    this._byteCount += this._getUtf8ByteSize(newChar.charCodeAt(0));
                }

                // ... finally, clear highlight and suggestions
                this._highlightPos.start = -1;
                this._highlightPos.end = -1;
                this._highlightedStr = '';
                this._candidateZero = '';
                this._candidateZeroCaretPos = 0;
                this._updateHighlightedArea();

                //re-check modKeyStatus because the highlight has changed
                this._checkModKeyStatus();

                this._clearSuggestions();

                this._incrementFocus("acceptSugg");
            }
            else
            {
                log.debug("default case in _suggestionSelectHandler()", e);
            }
            break;
    }
};

// handles the OK button
KeyboardCtrl.prototype._processInputHandler = function(e, source)
{
    // exit if OK is disabled
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    framework.common.beep("Short", source);

    if (typeof this.properties.okBtnCallback == 'function')
    {
        // NOTE: agohsmbr - 08.29.2012 - Updated callback to reflect control
        // refactoring. (reference, appData, params)

        // this.properties.okBtnCallback(this._input.value);
        var params = {"input":this._inputStr};
        this.properties.okBtnCallback(this, this.properties.appData, params);
        log.info("okBtnCallback called");
    }
};

// handles the cancel button.
KeyboardCtrl.prototype._cancelHandler = function(e, source)
{
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    framework.common.beep("Short", source);

    if (typeof this.properties.cancelBtnCallback == 'function')
    {
        var params = {"input":this._inputStr};
        this.properties.cancelBtnCallback(this, this.properties.appData, params);
    }
};

// handles backspace press
KeyboardCtrl.prototype._deleteSelectHandler = function(buttonRef, appData, params)
{
    this._setEditMode(false);

    //delete just one character
    this._deleteCharacter(false);

    //update focus data
    this._focusData.row = 0;
    this._focusData.col = this._focusData.columns - 1;
    this._focusedKey = this._btnBackspace.divElt;
};

// handles backspace long hold
KeyboardCtrl.prototype._deleteHoldStartHandler = function(buttonRef, appData, params)
{
    this._setEditMode(false);

    //start deleting
    if(this._deleteIntervalId != null)
    {
        clearInterval(this._deleteIntervalId);
        this._deleteIntervalId = null;
    }

    clearInterval(this._deleteIntervalId);
    this._deleteIntervalId = setInterval(this._deleteCharacter.bind(this, false), this._deleteInterval);
};

// handles backspace long release
KeyboardCtrl.prototype._deleteHoldStopHandler = function(buttonRef, appData, params)
{
    //stop deleting
    if(this._deleteIntervalId != null)
    {
        clearInterval(this._deleteIntervalId);
        this._deleteIntervalId = null;
    }

    // update focus data
    this._focusData.row = 0;
    this._focusData.col = this._focusData.columns - 1;
    this._focusedKey = this._btnBackspace.divElt;
};

/*
 * Helper function for delete key handlers
 * Param: fromConversion -- true if a suggestion has been selected
 *                          causing the highlighted character(s)
 *                          to be delete.
 */
KeyboardCtrl.prototype._deleteCharacter = function(fromConversion)
{
    // delete the character in front of the *correct* caret
    if (!fromConversion && (this._candidateZeroCaretPos > 0)   //candidate caret is after start of highlighted area
         && (this._highlightPos.end - this._highlightPos.start) < this._candidateZeroCaretPos //*candidate* caret is beyond the end of the highlight
         && this._caretPos <= this._highlightPos.end)   // regular caret is NOT beyond the end of the highlight
    {
        //only delete character in converter
        if ((this._isJaJpConversionLoaded && this.properties.locale == 'ja_JP_ABC')
        		|| (this._isMnTwConversionLoaded && (this.properties.locale == 'mn_TW'))
                || (this._isZhCnConversionLoaded && (this.properties.locale == 'zh_CN' || this.properties.locale == 'zh_CN_ABC'))
                || (this._isZhTwConversionLoaded && (this.properties.locale == 'zh_TW' || this.properties.locale == 'zh_TW_ABC'))
                || (this._isCnHkConversionLoaded && (this.properties.locale == 'cn_HK' || this.properties.locale == 'cn_HK_ABC')))
        {
            // update suggestions only
            this._deleteWithSuggestions();
        }
    }
    else if (this._caretPos > 0)
    {
        var before = this._inputStr.substring(0, this._caretPos-1);
        var after = this._inputStr.substring(this._caretPos, this._inputStr.length);
        var deletedChar = this._inputStr.charAt(this._caretPos-1);

        // Prior to deleting the character, determine if it is a "combiner"
        var wasCombiner = false;
        for(var i=0;i<this._thaiCombiners.length;i++)
        {
            if(this._thaiCombiners[i] == ("◌​" + deletedChar))
            {
                wasCombiner = true;
                break;
            }
        }

        if ((!fromConversion && this._suppressConvUpdate === false) &&
                (this._isJaJpConversionLoaded && this.properties.locale == 'ja_JP_ABC')
                || (this._isMnTwConversionLoaded && this.properties.locale == 'mn_TW')
                || (this._isZhCnConversionLoaded && (this.properties.locale == 'zh_CN' || this.properties.locale == 'zh_CN_ABC'))
                || (this._isZhTwConversionLoaded && (this.properties.locale == 'zh_TW' || this.properties.locale == 'zh_TW_ABC'))
                || (this._isCnHkConversionLoaded && (this.properties.locale == 'cn_HK' || this.properties.locale == 'cn_HK_ABC')))
        {
                // delete character from the correct location with the converter and a possible max character limit.
                this._deleteWithSuggestions(deletedChar);
        }
        else
        {
            // just remove it from the input
            this._inputStr = before + after;
            this._inputSpan.innerText = this._displayString(this._inputStr);
            // update caret position
            this._moveCaret(0, "delete");
            this._byteCount -= this._getUtf8ByteSize(deletedChar.charCodeAt(0));
        }


        if(wasCombiner)
        {
            // After innerText has been set, the removal of a combiner
            // does not trigger a DOM element refresh. Force the refresh
            // by re-parenting _inputSpan
            this._input.appendChild(this._inputSpan);
        }

        //this needs to be called after the caret is updated, that is why this check is duplicated out here...
        if (!fromConversion && this._suppressConvUpdate === false)
        {
            // update suggestions.. this logic only applies if deleting a character in the highlighted area
            if ((this._isJaJpConversionLoaded && this.properties.locale == 'ja_JP_ABC')
            	|| (this._isMnTwConversionLoaded && this.properties.locale == 'mn_TW')
                || (this._isZhCnConversionLoaded && (this.properties.locale == 'zh_CN' || this.properties.locale == 'zh_CN_ABC'))
                || (this._isZhTwConversionLoaded && (this.properties.locale == 'zh_TW' || this.properties.locale == 'zh_TW_ABC'))
                || (this._isCnHkConversionLoaded && (this.properties.locale == 'cn_HK' || this.properties.locale == 'cn_HK_ABC')))
            {
                this._updateHighlightedArea();
            }
        }

        if (!fromConversion)
        {
            if (this._inputStr == "")
            {
                // place contextual clue
                if (this.properties.placeholderText)
                {
                    this._setPlaceholder();
                }
                //disable OK
                this._setKeyEnabled(this._ok, false);
            }
        }
        //determine if the user can now insert characters
        if (this._noInsert && this._isThaiOrRtl(deletedChar.charCodeAt(0)))
        {
            if (this.properties.locale != "he_IL_ABC" && this.properties.locale != "ar_SA_ABC" && this.properties.locale != "th_TH_ABC" && this.properties.locale != "ar_SA" && this.properties.locale != "th_TH" && !this._containsThaiOrRtl())
            {
                this._noInsert = false;
                log.info("Enabling character insertion...");
            }
        }
    }
    else
    {
        log.debug("Cannot delete; already at beginning of string.");
    }
};

KeyboardCtrl.prototype._deleteWithSuggestions = function(deletedChar)
{
    var deletedFromInputAlready = false;

    //track conversion string info, removedFromConv could be empty
    var before = this._candidateZero.substring(0, this._candidateZeroCaretPos-1);
    var after = this._candidateZero.substring(this._candidateZeroCaretPos, this._candidateZero.length);
    var removedFromConv = this._candidateZero.charAt(this._candidateZeroCaretPos-1);
    var hiddenConvChars = this._candidateZero.substring(this._highlightPos.end - this._highlightPos.start);

    if (this._caretPos <= this._highlightPos.start)
    {
        //deleting character in front of highlight
        deletedFromInputAlready = false;

        //if there are character(s) hidden because of max limit, need to expand the highlight here.
        if (this._highlightPos.end - this._highlightPos.start < this._candidateZero.length)
        {
            //get the correct amount of characters to slip back into the highlightedStr
            var charsToInsert = this._getCharCountToInsert(hiddenConvChars, deletedChar);

            //build string to insert with correct # of chars
            var insertStr = "";
            for (var i=0; i<charsToInsert; i++)
            {
                var oldWidth = this._inputSpan.clientWidth;

                //insert character at this._highlightPos.end, don't decrement this._highlightPos.end
                var inputBefore = this._inputStr.substring(0, this._highlightPos.end);
                var inputAfter = this._inputStr.substring(this._highlightPos.end, this._inputStr.length);
                this._inputStr = inputBefore + hiddenConvChars.charAt(i) + inputAfter;
                //build string, and set inner text
                this._inputSpan.innerText = this._displayString(this._inputStr);

                //add the new characterWidth and update this._caretOffset for the delete
                this._characterSizes.splice(this._highlightPos.end + 1, 0, this._inputSpan.clientWidth - oldWidth);
                this._byteCount += this._getUtf8ByteSize(hiddenConvChars.charCodeAt(i));

                this._highlightPos.end++;
            }

            this._highlightPos.start--;
            this._highlightPos.end--;

            //update this._highlightedStr
            this._highlightedStr = this._candidateZero.substring(0, this._highlightPos.end - this._highlightPos.start);
        }
        else    //just shift the highlight down
        {
            this._highlightPos.start--;
            this._highlightPos.end--;
        }

    }
    else if (this._caretPos <= this._highlightPos.end)
    {
        //Deleting a character in the highlighted area...

        //remove from _candidateZero tracker
        this._candidateZero = before + after;
        this._candidateZeroCaretPos--;

        //if _candidateZero is/was larger than highlight (just removed a char), there are some hidden characters that can be slid back in
        if (this._highlightedStr.length <= this._candidateZero.length)
        {
            deletedFromInputAlready = true;

            //if cursor is in actual input highlight (meaning the cursor was in the visible part of the suggestion)
            if ((this._highlightPos.end - this._highlightPos.start) > this._candidateZeroCaretPos)
            {
                //loop through highlight to shift the previously visible characters over
                var startPos = this._highlightPos.start + this._candidateZeroCaretPos;
                for (var i=startPos; i<this._highlightPos.end-1; i++)
                {
                    var oldWidth = this._inputSpan.clientWidth;

                    //replace the deleted character with the next one in line
                    //take after.charAt(i - startPos) and slide that in the input string at i
                    var inputBefore = this._inputStr.substring(0, i);
                    var inputAfter = this._inputStr.substring(i + 1);
                    var removed = this._inputStr.charAt(i);

                    this._inputStr = inputBefore + after.charAt(i - startPos) + inputAfter;
                    //build string, and set inner text
                    this._inputSpan.innerText = this._displayString(this._inputStr);
                    //call _moveCaret with a "replace"
                    this._moveCaret(this._inputSpan.clientWidth - oldWidth, "replace", i+1);
                    this._byteCount += this._getUtf8ByteSize(after.charCodeAt(i - startPos)) - this._getUtf8ByteSize(removed.charCodeAt(0));
                }

                //After copying the final character, remove the old copy
                this._highlightPos.end--;
                var inputBefore = this._inputStr.substring(0, this._highlightPos.end);
                var inputAfter = this._inputStr.substring(this._highlightPos.end + 1);
                var oldCopy = this._inputStr.charAt(this._highlightPos.end);
                this._inputStr = inputBefore + inputAfter;
                this._inputSpan.innerText = this._displayString(this._inputStr);

                this._characterSizes.splice(this._highlightPos.end+1, 1);
                this._byteCount -= this._getUtf8ByteSize(oldCopy.charCodeAt(0));

                this._highlightedStr = this._candidateZero.substring(0, this._highlightedStr.length-1);

                // Now that the character has been properly deleted,
                // check how many characters will be incoming (could be 0)
                var charsToInsert = this._getCharCountToInsert(hiddenConvChars, deletedChar, true);
                // add those characters to end of highlight
                this._insertAtEndOfHighlight(hiddenConvChars, charsToInsert);

                this._incrementCaret("left");
            }
            else    //cursor was in hidden part of suggestion
            {
                //may have deleted a character that couldn't fit, but the next character(s) in line could have... may need to insert chars here like in the first case

                //check how many characters will be incoming (could be 0)
                var charsToInsert = this._getCharCountToInsert(hiddenConvChars, removedFromConv, true);
                // add those characters to end of highlight
                this._insertAtEndOfHighlight(hiddenConvChars, charsToInsert);
            }
        }
        else
        {
            //_candidateZero and _highlightedStr should match.. no hidden characters
            deletedFromInputAlready = false;
            this._highlightedStr = this._candidateZero;
            this._highlightPos.end--;
        }

        if (this._candidateZero == "")
        {
            this._clearSuggestions();
        }
        else
        {
            this._updateSuggestions();
        }
    }
    else
    {
        //cursor is deleting a character after the highlight, or there is no highlight
        deletedFromInputAlready = false;

        //if there are character(s) hidden because of max limit, need to expand the highlight here.
        if (this._highlightPos.end - this._highlightPos.start < this._candidateZero.length)
        {
            //check how many characters will be incoming (could be 0)
            var charsToInsert = this._getCharCountToInsert(hiddenConvChars, deletedChar);
            // add those characters to end of highlight
            var widthAdded = this._insertAtEndOfHighlight(hiddenConvChars, charsToInsert);

            //adding characters to the end of the highlight would effect the curosr position in this case
            this._caretOffset += widthAdded;
            this._caretPos += charsToInsert;
        }
        else
        {
            //decrement candidate cursor here.. not above because: it isn't really moving compared to the beginning of the string since we are sliding in a character.
            this._candidateZeroCaretPos--;
        }
    }

    //remove character from input if necessary
    if (deletedFromInputAlready === false)
    {
        var before = this._inputStr.substring(0, this._caretPos-1);
        var after = this._inputStr.substring(this._caretPos, this._inputStr.length);
        var deleted = this._inputStr.charAt(this._caretPos-1);

        this._inputStr = before + after;
        this._inputSpan.innerText = this._displayString(this._inputStr);
        this._moveCaret(0, "delete");
        // update byte count here
        this._byteCount -= this._getUtf8ByteSize(deleted.charCodeAt(0));
    }


    this._positionDebugCaret();
};

KeyboardCtrl.prototype._getCharCountToInsert = function(queue, removed, deletedWasInHighlight)
{
    var charsToInsert = 0;
    var updatedByteCount = this._byteCount;

    // If deleted character came from highlight either it was hidden, meaning removing it will not effect the count,
    // or the byte count has already been updated
    if (! deletedWasInHighlight)
    {
        //... so only decrement if the byte count hasn't been updated
        updatedByteCount -= this._getUtf8ByteSize(removed.charCodeAt(0));
    }

    for (var i=0; i<queue.length; i++)
    {
        updatedByteCount += this._getUtf8ByteSize(queue.charCodeAt(i));
        if (updatedByteCount <= this.properties.maxBytes)
        {
            charsToInsert = i + 1;
        }
    }
    return charsToInsert;
};

KeyboardCtrl.prototype._getCharCountToRemove = function()
{
    var charsToRemove = 0;
    var updatedByteCount = this._byteCount;

    //byte count has already been updated

    for (var i=this._highlightedStr.length-1; i>=0; i--)
    {
        updatedByteCount -= this._getUtf8ByteSize(this._highlightedStr.charCodeAt(i));
        if (updatedByteCount <= this.properties.maxBytes)
        {
            charsToRemove = i;
            break;
        }
    }
    return this._highlightedStr.length - charsToRemove;
};

KeyboardCtrl.prototype._insertAtEndOfHighlight = function(str, count)
{
    var totalWidthAdded = 0;
    for (var i=0; i<count; i++)
    {
        var oldWidth = this._inputSpan.clientWidth;

        //insert character at this._highlightPos.end, increment this._highlightPos.end
        var inputBefore = this._inputStr.substring(0, this._highlightPos.end);
        var inputAfter = this._inputStr.substring(this._highlightPos.end, this._inputStr.length);
        this._inputStr = inputBefore + str.charAt(i) + inputAfter;
        this._highlightPos.end++;
        //build string, and set inner text
        this._inputSpan.innerText = this._displayString(this._inputStr);

        //add the new characterWidth and update this._caretOffset for the delete
        this._characterSizes.splice(this._highlightPos.end, 0, this._inputSpan.clientWidth - oldWidth);
        this._byteCount += this._getUtf8ByteSize(str.charCodeAt(i));

        // update this._highlightedStr also...
        this._highlightedStr = this._candidateZero.substring(0, this._highlightPos.end - this._highlightPos.start);

        totalWidthAdded += this._inputSpan.clientWidth - oldWidth;
    }
    return totalWidthAdded;
};

KeyboardCtrl.prototype._removeFromEndOfHighlight = function(count)
{
    for (var j=0; j<count; j++)
    {
        // remove the last visible  character in the highlight (only from the input)
        this._highlightPos.end--;
        var inputBefore = this._inputStr.substring(0, this._highlightPos.end);
        var inputAfter = this._inputStr.substring(this._highlightPos.end + 1);
        var deletedChar = this._inputStr.charAt(this._highlightPos.end);
        this._inputStr = inputBefore + inputAfter;
        this._inputSpan.innerText = this._displayString(this._inputStr);
        // update caret position
        if (this._caretPos > this._highlightPos.end)
        {
            this._moveCaret(0, "delete");
            this._candidateZeroCaretPos--;
        }
        else
        {
            this._characterSizes.splice(this._highlightPos.end+1, 1);
            this._byteCount -= this._getUtf8ByteSize(deletedChar.charCodeAt(0));
        }

        this._highlightedStr = this._candidateZero.substring(0, this._highlightPos.end - this._highlightPos.start);
    }
};

// layout switch handler (attached to this._btnShift and this._layout)
KeyboardCtrl.prototype._changeLayoutHandler = function(e, source)
{

    //for asian languages check here for special layout names in this._currentLayout

    // exit if the button is disabled
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    framework.common.beep("Short", source);

    var targetLayout;
    var capsLock = false;
    var btnVal = e.target.dataset.value;
    if(btnVal == 'shift')
    {
        switch(this._currentLayout)
        {
            case 'lettersSmall' :
                targetLayout = this._layouts[this.properties.locale][1].name;
                break;
            case 'lettersCaps' :
                targetLayout = this._layouts[this.properties.locale][1].name;
                capsLock = true;
                break;
            case 'lettersCapsLock' :
                targetLayout = this._layouts[this.properties.locale][0].name;
                break;
            case 'symbols1' :
                targetLayout = this._layouts[this.properties.locale][1].name;
                break;

            /* begin cases for chinese layouts */
            case 'letters':
            case 'special1':
                targetLayout = this._layouts[this.properties.locale][2].name;
                break;
            case 'special2':
                targetLayout = this._layouts[this.properties.locale][1].name;
                break;

            default :
                log.error('this._currentLayout is an unkown value');
                return;
        }

    }
    else if(btnVal == 'layout')
    {
        switch (this._currentLayout)
        {
            case 'lettersSmall':
            case 'lettersCaps':
            case 'lettersCapsLock':
                targetLayout = this._layouts[this.properties.locale][2].name;
                if (this.properties.locale != 'ar_SA_ABC' || this.properties.locale != 'ar_SA' || this.properties.locale != 'he_IL_ABC')
                {
                    this._setKeyEnabled(this._btnShift, false);
                }
                break;
            case 'symbols1':
                targetLayout = this._layouts[this.properties.locale][0].name;
                if (this.properties.locale != 'ar_SA_ABC' && this.properties.locale != 'ar_SA' && this.properties.locale != 'he_IL_ABC')
                {
                    //Arabic + Hebrew Shift buttons always disabled .. the RTL similarity is a coincidence
                    this._setKeyEnabled(this._btnShift, true);
                }
                break;

            /* begin cases for chinese layouts */
            case 'letters':
                targetLayout = this._layouts[this.properties.locale][1].name;
                break;
            case 'special1':
            case 'special2':
                targetLayout = this._layouts[this.properties.locale][0].name;
                break;

            case 'kana_letters':
                targetLayout = this._layouts[this.properties.locale][2].name;
                this._setKeyEnabled(this._modKey, false);
                break;
            case 'kana_symbols':
                targetLayout = this._layouts[this.properties.locale][0].name;
                this._setKeyEnabled(this._modKey, true);
                break;

            case 'taiw_letters':
                targetLayout = this._layouts[this.properties.locale][2].name;
                this._setKeyEnabled(this._modKey, false);
                break;
            case 'taiw_symbols':
                targetLayout = this._layouts[this.properties.locale][0].name;
                this._setKeyEnabled(this._modKey, false);
                break;

            case 'arabic_letters':
                targetLayout = this._layouts[this.properties.locale][2].name;
                break;
            case 'arabic_symbols':
                targetLayout = this._layouts[this.properties.locale][0].name;
                break;

            default:
                log.error('this._currentLayout is an unkown value');
                return;
        }
    }

    this._layoutUpdate(targetLayout);

    if (capsLock)
    {
        this._currentLayout = 'lettersCapsLock';
    }
    else
    {
        this._currentLayout = targetLayout;
    }
    this._cssRefresh();
    this._targetToFocusdata(e.target, true);
    this._setLayoutShiftInnerText();
};

/**********************************************
 * helper functions for _changeLayoutHandler()
 **********************************************/

// Sets text for Layout and Shift keys based on this._layouts object
KeyboardCtrl.prototype._setLayoutShiftInnerText = function()
{
    // The default shift text is an icon, 1qw is default layout switch text

    var shiftText = '';
    var layoutText = '1qw';
    var layoutIndex = this._getLayoutIndex();

    if (this._layouts[this.properties.locale][layoutIndex].layoutText)
    {
        layoutText = this._layouts[this.properties.locale][layoutIndex].layoutText;
    }
    this._layoutSwitch.innerText = layoutText;

    // Here we need to change the font size of the layout key if we are changing between Japanese layouts
    if ((this.properties.locale == 'ja_JP_ABC' && this._currentLayout == "kana_symbols") || this.properties.locale == 'mn_TW')
    {
        this._layoutSwitch.classList.add("smallText");
    }
    else if (this.properties.locale == 'ja_JP_ABC' && this._currentLayout == "kana_letters")
    {
        this._layoutSwitch.classList.remove("smallText");
    }

    if (this.properties.locale != 'ja_JP_ABC' && this.properties.locale != 'mn_TW')
    {
        if (this._layouts[this.properties.locale][layoutIndex].shiftText)
        {
            //set text, remove icon
            shiftText = this._layouts[this.properties.locale][layoutIndex].shiftText;
            this._btnShift.classList.add('noIcon');
        }
        else
        {
            //clear text, re-add icon
            shiftText = '';
            this._btnShift.classList.remove('noIcon');
        }

        if (this._currentLayout == 'lettersCapsLock')
        {
            this._btnShift.classList.add('capsLock');
        }
        else
        {
            this._btnShift.classList.remove('capsLock');
        }
        this._btnShift.innerText = shiftText;
    }
};

// Changes which buttons are visible, and swaps the listeners
KeyboardCtrl.prototype._layoutUpdate = function(targetLayout)
{
    //_focusData.row and .col updated in _changeLayoutHAndler after _cssRefresh()

    //switch layouts
    var layouts = this.divElt.getElementsByClassName('layout');
    var i;
    for (i=0; i<layouts.length; i++)
    {
        layouts[i].style.display = 'none';
    }
    var visibleLayout = document.getElementById(targetLayout);
    visibleLayout.style.display = 'block';

    //remove listeners from former btns array, add to current
    for (var j=0; j<this._btns.length; j++)
    {
        for (var k=0; k<this._btns[j].length; k++)
        {
            this._removeListeners(this._btns[j][k]);
            this._btns[j][k].classList.remove('focused');

            if (j < visibleLayout.children.length && k < visibleLayout.children[j].children.length)
            {
                this._btns[j][k] = visibleLayout.children[j].children[k];
                this._addListeners(this._btns[j][k]);
            }
        }
    }

};

/*
 * Changes input size and padding, also
 * updates _focusData for new layout.
 */
KeyboardCtrl.prototype._cssRefresh = function()
{
    //this._currentLayout is updated in calling function before this is called.

    this._input.classList.remove(this._cssStyle);
    this._btnWrapper.classList.remove(this._cssStyle);
    this._suggestionRowWrapper.classList.remove(this._cssStyle);

    var layoutIndex = this._getLayoutIndex();
    this._cssStyle = this._layouts[this.properties.locale][layoutIndex].style;

    this._input.classList.add(this._cssStyle);
    this._btnWrapper.classList.add(this._cssStyle);
    this._suggestionRowWrapper.classList.add(this._cssStyle);

    switch (this._cssStyle)
    {
        case 'fiveTen':
            this._focusData.columns = 10;
            this._focusData.rows = 5;
            this._focusData.shiftedRow = 2;
            this._focusData.focusDuplicates[0] = [0, 8];
            this._focusData.focusDuplicates[1] = [];
            this._focusData.focusDuplicates[2] = [8, 9];
            this._focusData.focusDuplicates[3] = [8, 9];
            this._focusData.focusDuplicates[4] = [2, 7, 8, 9];

            this._btnWidth = 70;
            this._btnMargin = 5;
            break;

        case 'sixTen':
            this._focusData.columns = 10;
            this._focusData.rows = 6;
            this._focusData.shiftedRow = 4;
            this._focusData.focusDuplicates[0] = [0, 8];
            this._focusData.focusDuplicates[1] = [];
            this._focusData.focusDuplicates[2] = [];
            this._focusData.focusDuplicates[3] = [];
            this._focusData.focusDuplicates[4] = [8, 9];
            this._focusData.focusDuplicates[5] = [2, 7, 8, 9];

            this._btnWidth = 73;
            this._btnMargin = 5;
            break;

        case 'sixTwelve':
            this._focusData.columns = 12;
            this._focusData.rows = 6;
            this._focusData.shiftedRow = 4;
            this._focusData.focusDuplicates[0] = [0, 10];
            this._focusData.focusDuplicates[1] = [];
            this._focusData.focusDuplicates[2] = [];
            this._focusData.focusDuplicates[3] = [];
            this._focusData.focusDuplicates[4] = [10, 11];
            this._focusData.focusDuplicates[5] = [2, 9, 10, 11];

            this._btnWidth = 62;
            this._btnMargin = 3;
            break;

        case 'suggFiveTen':
            this._focusData.columns = 10;
            this._focusData.rows = 6;
            this._focusData.shiftedRow = 3;
            this._focusData.focusDuplicates[0] = [0, 8];
            this._focusData.focusDuplicates[1] = [];
            this._focusData.focusDuplicates[2] = [];
            if (this._currentLayout == "special2")
            {
                this._focusData.focusDuplicates[3] = [];
            }
            else
            {
                this._focusData.focusDuplicates[3] = [8, 9];
            }
            this._focusData.focusDuplicates[4] = [];
            this._focusData.focusDuplicates[5] = [2, 8];

            this._btnWidth = 73;
            this._btnMargin = 5;
            break;

        case 'suggSevenTen':
            this._focusData.columns = 10;
            this._focusData.rows = 8;
            this._focusData.shiftedRow = 1;
            this._focusData.focusDuplicates[0] = [0, 8];
            this._focusData.focusDuplicates[1] = [];
            this._focusData.focusDuplicates[2] = [];
            this._focusData.focusDuplicates[3] = [];
            this._focusData.focusDuplicates[4] = [];
            this._focusData.focusDuplicates[5] = [];
            this._focusData.focusDuplicates[6] = [];
            this._focusData.focusDuplicates[7] = [3, 8];

            this._btnWidth = 73;
            this._btnMargin = 2;
            break;
        case 'suggSevenEleven':
            this._focusData.columns = 11;
            this._focusData.rows = 8;
            this._focusData.shiftedRow = 1;
            this._focusData.focusDuplicates[0] = [0, 9];
            this._focusData.focusDuplicates[1] = [9, 10];
            this._focusData.focusDuplicates[2] = [];
            this._focusData.focusDuplicates[3] = [9, 10];
            this._focusData.focusDuplicates[4] = [9, 10];
            this._focusData.focusDuplicates[5] = [9, 10];
            this._focusData.focusDuplicates[6] = [9, 10];
            this._focusData.focusDuplicates[7] = [3, 9];

            this._btnWidth = 66;
            this._btnMargin = 2;
            break;

        default:
            log.debug("that layout doesn't exist... yet");
            break;
    }

    // In reality, the input field is always 16 pixels left. But previously, and possibly in the future this may not be the case.
    // It is important that *font size* does not change between layouts since the caret positions have already been determined.
    // However, the following code allows the input field to change size. (Even though it doesn't need to right now.)

    this._inputDivLeft = parseInt(this.divElt.currentStyle.left) + parseInt(this._input.currentStyle.left);
    if (this._inputDivLeft === NaN)
    {
        this._inputDivLeft = 16;    // 16 is the default left offset for all current styles
    }
    this._refreshCaretBoundaries();

    //for rtl, keep at far left of string.. only move cursor for ltr languages..
    if (this._caretOnLeft())
    {
        this._caret.style.left = (this._inputDivXPadding-1) + "px";
        this._inputSpan.style.left = this._inputDivXPadding + "px";
    }
    else
    {
        this._caretOffset += this._shiftSpan();
        this._caret.style.left = (this._caretOffset-1) + "px";
    }

};

KeyboardCtrl.prototype._refreshCaretBoundaries = function()
{
    //16 is the number of pixels it needs to stay from the edge due to the faded divs
    this._maxCaretOffset = ((this._input.clientWidth - this._inputDivXPadding) > this._inputDivXPadding) ? this._input.clientWidth - this._inputDivXPadding : this._inputDivXPadding ;
    this._minCaretOffset = this._inputDivXPadding;
};

// handles the globe key
KeyboardCtrl.prototype._changeLanguageHandler = function(e, source)
{
    // exit if the button is disabled
    if (e.target.dataset.enabled === "false")
    {
        return;
    }

    framework.common.beep("Short", source);
    framework.sendEventToMmui("Common", "Global.SelectGlobeKey");
};

KeyboardCtrl.prototype._loadConversionFile = function(reload)
{
    if (guiConfig.debugMode)
    {
        this._predEngine = new fakePredictionEngine();
        log.info("FAKE dictionary loaded");
        this._isJaJpConversionLoaded = true;
        this._isZhCnConversionLoaded = true;
        this._isZhTwConversionLoaded = true;
        this._isCnHkConversionLoaded = true;
        this._isMnTwConversionLoaded = true;
        return;
    }

    // This will not throw an error from the PC anymore because of the debugMode check above
    if (this.properties.locale == "ja_JP_ABC" && !this._isJaJpConversionLoaded)
    {
        this._predEngine = new PredictionEngine();
        this._predEngine.LoadDictionary('JAP');
        this._isJaJpConversionLoaded = true;
        log.info("JAP dictionary loaded");
    }
    else if ((this.properties.locale == "zh_CN" || this.properties.locale == "zh_CN_ABC") && !this._isZhCnConversionLoaded)
    {
        this._predEngine = new PredictionEngine();
        this._predEngine.LoadDictionary('CH');
        this._isZhCnConversionLoaded = true;
        log.info("ZHCN dictionary loaded");
    }
    if ((this.properties.locale == "zh_TW" || this.properties.locale == "zh_TW_ABC") && !this._isZhTwConversionLoaded)
    {
        this._predEngine = new PredictionEngine();
        this._predEngine.LoadDictionary('CH');
        this._isZhTwConversionLoaded = true;
        log.info("ZHTW dictionary loaded");
    }
    if ((this.properties.locale == "cn_HK" || this.properties.locale == "cn_HK_ABC") && !this._isCnHkConversionLoaded)
    {
        this._predEngine = new PredictionEngine();
        this._predEngine.LoadDictionary('CAN');
        this._isCnHkConversionLoaded = true;
        log.info("CNHK dictionary loaded");
    }
    if (this.properties.locale == "mn_TW" && !this._isMnTwConversionLoaded)
    {
        this._predEngine = new PredictionEngine();
        this._predEngine.LoadDictionary('BPMF');
        this._isMnTwConversionLoaded = true;
        log.info("BPMF dictionary loaded");
    }

};

KeyboardCtrl.prototype.setAtSpeed = function(atSpeed)
{
    this._atSpeed = atSpeed;
    var layoutIndex, i, j;
    layoutIndex = this._getLayoutIndex();
    var focusedKey = this._getFocusedKey(false);
    if(this._atSpeed)
    {
        if((focusedKey.classList) && focusedKey.classList.contains("activeState")) //SW00138903 fix
        {
            focusedKey.classList.remove("activeState");
        }
        if (focusedKey.dataset.value == "input") //SW00138903 fix
        {
            if(this._caret.classList.contains("activeState"))
            {
                this._caret.classList.remove("activeState");
            }
            if (this._editMode)
            {
                this._setKeyFocused(focusedKey, false);
                this._focusData.row = 0;
                this._focusData.col = 0;
                this._setKeyFocused(this._caret, true);
                this._focusedKey = this._caret;
            }
            else
            {
                this._setKeyFocused(this._caret, false);
                this._focusedKey = this._getFocusedKey(false);
                this._setKeyFocused(this._focusedKey, true);
            }
        }
        this._setKeyEnabled(this._input, false);
        this._setKeyEnabled(this._caret, false);
        for (i=0; i<this._layouts[this.properties.locale][layoutIndex].buttons.length; i++)
        {
            for (j=0; j<this._layouts[this.properties.locale][layoutIndex].buttons[i].length; j++)
            {
                if (this._layouts[this.properties.locale][layoutIndex].buttons[i][j].length > 0)
                {
                    this._setKeyEnabled(this._btns[i][j], false);
                }
            }
        }
        if (this._conversionLang)
        {
            this._setKeyEnabled(this._leftArrow, false);
            this._setKeyEnabled(this._rightArrow, false);
            for (i=0; i<this._suggestionDivs.length; i++)
            {
                this._setKeyEnabled(this._suggestionDivs[i], false);
            }
        }
        if (this.properties.locale != "hex" && this.properties.locale != "numeric")
        {
            if (this.properties.locale != "ja_JP_ABC" && this.properties.locale != "mn_TW")
            {
                this._setKeyEnabled(this._btnShift, false);
            }
            else
            {
                this._setKeyEnabled(this._modKey, false);
            }
            this._setKeyEnabled(this._spacebar, false);
            this._setKeyEnabled(this._globe, false);
            this._setKeyEnabled(this._layoutSwitch, false);
            this._btnBackspace.setEnabled(false);
        }
    }
    else
    {
        this._setKeyEnabled(this._input, true);
        this._setKeyEnabled(this._caret, true);
        for (i=0; i<this._layouts[this.properties.locale][layoutIndex].buttons.length; i++)
        {
            for (j=0; j<this._layouts[this.properties.locale][layoutIndex].buttons[i].length; j++)
            {
                if (this._layouts[this.properties.locale][layoutIndex].buttons[i][j].length > 0)
                {
                    this._setKeyEnabled(this._btns[i][j], true);
                }
            }
        }
        if (this._conversionLang)
        {
            this._setKeyEnabled(this._leftArrow, true);
            this._setKeyEnabled(this._rightArrow, true);
            for (i=0; i<this._suggestionDivs.length; i++)
            {
                this._setKeyEnabled(this._suggestionDivs[i], true);
                if (!this._numSuggestions)
                {
                    // suggestion Divs are visually enabled, but logically disabled until populated 
                    this._suggestionDivs[i].dataset.enabled = "false";
                }
            }
        }
        if (this.properties.locale != "hex" && this.properties.locale != "numeric")
        {
            if (this.properties.locale == "ja_JP_ABC" || this.properties.locale == "mn_TW")
            {
                // "Mod" key is unique to Japanese
                this._checkModKeyStatus();
            }
            else if (this.properties.locale != 'ar_SA_ABC' && this.properties.locale != 'ar_SA' && this.properties.locale != 'he_IL_ABC')
            {
                // Only enable shift key for non-Japanese LTR languages
                this._setKeyEnabled(this._btnShift, true);
            }
            this._setKeyEnabled(this._spacebar, true);
            this._setKeyEnabled(this._globe, true);
            this._setKeyEnabled(this._layoutSwitch, true);
            this._btnBackspace.setEnabled(true);
        }
    }
};

KeyboardCtrl.prototype._isSuggestionPopulated = function()
{
    var populated;

    if (this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggFiveTen' || this._cssStyle == 'suggSevenEleven')
    {
        if (this._suggestionDivs[0] && this._suggestionDivs[0].dataset.enabled === "true")
        {
            populated = true;
        }
        else
        {
            populated = false;
        }
    }
    else
    {
        populated = true;    //return true if not a suggestion layout
    }

    return populated;
};

KeyboardCtrl.prototype._getLayoutIndex = function()
{
    var layoutIndex;
    switch (this._currentLayout)
    {
        case "lettersSmall":    //intentional fallthrough
        case "letters":
        case "kana_letters":
        case "arabic_letters":
        case "taiw_letters":
            layoutIndex = 0;
            break;
        case "lettersCaps":    //intentional fallthrough
        case "lettersCapsLock":
        case "special1":
            layoutIndex = 1;
            break;
        case "kana_symbols":    //intentional fallthrough
        case "arabic_symbols":
        case "symbols1":
        case "special2":
        case "taiw_symbols":
            layoutIndex = 2;
            break;
        default:
            layoutIndex = 0;
            log.debug("layoutIndex defaulted to 0");
            break;
    }
    return layoutIndex;
};

KeyboardCtrl.prototype._enableBtns = function()
{
    var layoutIndex, j, k;

    //need to know the current locale + layout
    for (j=0; j<this._layouts[this.properties.locale][layoutIndex].buttons.length; j++)
    {
        for (k=0; k<this._layouts[this.properties.locale][layoutIndex].buttons[j].length; k++)
        {
            if (this._layouts[this.properties.locale][layoutIndex].buttons[j][k].length > 0)
            {
                this._setKeyEnabled(this._btns[j][k], true);
            }
        }
    }

};

/*
 * =========================
 * LIST HANDLERS
 * =========================
 */

KeyboardCtrl.prototype._isInsertValid = function()
{
    if (this.properties.locale == "ar_SA_ABC" || this.properties.locale == "th_TH_ABC" || this.properties.locale == "he_IL_ABC" || this.properties.locale == "ar_SA" || this.properties.locale == "th_TH" || this._containsThaiOrRtl())
    {
        this._setCaretToEnd();
        this._noInsert = true;
        log.info("disabling character insertion...");
    }
    else
    {
        this._noInsert = false;
        log.info("Enabling character insertion...");
    }

};

KeyboardCtrl.prototype._containsThaiOrRtl = function()
{
    //check if there are still thai/Arabic chars
    var hasThaiRtl = false;
    for (i=0; i<this._inputStr.length; i++)
    {
        if (this._isThaiOrRtl(this._inputStr.charCodeAt(i)))
        {
            hasThaiRtl = true;
            break;
        }
    }
    return hasThaiRtl;
};

KeyboardCtrl.prototype._isThaiOrRtl = function(unicodeVal)
{
    var isThaiRtl = false;
    if (unicodeVal > 3583 && unicodeVal < 3712)
    {
        isThaiRtl = true;
    }
    if (this._isRtl(unicodeVal))
    {
        isThaiRtl = true;
    }

    return isThaiRtl;
};

KeyboardCtrl.prototype._isRtl = function(unicodeVal)
{
    var isRTL = false;
    if (unicodeVal > 1535 && unicodeVal < 1792)
    {
        isRTL = true;
    }
    else if (unicodeVal > 1423 && unicodeVal < 1525)
    {
        isRTL = true;
    }

    return isRTL;
};

KeyboardCtrl.prototype._getMostBytes = function(lang)
{
    var byteMax = 0;
    var size = 0;

    for (var layout=0; layout<3; layout++)
    {
        for (var i=0; i<this._layouts[lang][layout].buttons.length; i++)
        {
            for (var j=0; j<this._layouts[lang][layout].buttons[i].length; j++)
            {
                if (this._layouts[lang][layout].buttons[i][j] !== "")
                {
                    size = this._getUtf8ByteSize(this._layouts[lang][layout].buttons[i][j].charCodeAt(0));
                    if (size > byteMax)
                    {
                        byteMax = size; //set byteMax
                    }
                }
            }
        }
    }

    return byteMax;
};

/*
 * =========================
 * MULTICONTROLLER
 * =========================
 */
KeyboardCtrl.prototype.handleControllerEvent = function(eventID)
{
    log.debug("KeyboardCtrl: handleController() called, eventID: " + eventID);

    var response;

    switch (eventID)
    {
        case "acceptFocusInit": //intentional fallthrough. these cases have the same behavior
        case "acceptFocusFromLeft":
        case "acceptFocusFromRight":
        case "acceptFocusFromTop":
        case "acceptFocusFromBottom":
            //set focus on upper-left key
            this._prevFocus = null;
            if (this._focusedKey == null)
            {
                this._setInitialFocusKey();
            }
            response = "consumed";
            break;
        case "lostFocus":
            //Hide highlight.. delete key is stealing focus here
            var key = this._getFocusedKey(false);
            this._setKeyFocused(key, false);

            this._focusData.row = 0;
            this._focusData.col = this._focusData.columns - 1;
            this._focusedKey = this._btnBackspace.divElt;
            response = "consumed";
            break;
        case "touchActive":
            //this._controllerActive = false;
            //this._touchActive = true;
            this._btnBackspace.handleControllerEvent("touchActive");
            // input mode change to touch
            response = "consumed";
            break;
        case "controllerActive":
            //this._controllerActive = true;
            //this._touchActive = false;
            this._btnBackspace.handleControllerEvent("controllerActive");
            // input mode change to multicontroller
            response = "consumed";
            break;

        case "cw":
            if (this._editMode)
            {
                this._incrementCaret("right");
            }
            else
            {
                this._incrementFocus("cw");
            }
            response = "consumed";
            break;

        case "ccw":
            if (this._editMode)
            {
                this._incrementCaret("left");
            }
            else
            {
                this._incrementFocus("ccw");
            }
            response = "consumed";
            break;

        case "leftStart":
            if (this._editMode)
            {
                if(this._btnBackspace.isEnabled) //SW00144529 fix - call _deleteCharacter only if backspace button is enabled
                {
                    this._deleteCharacter(false);
                };
            }
            else
            {
                this._incrementFocus("left");
            }
            response = "consumed";
            break;
        case "left":
            response = "consumed";
            break;

        case "rightStart":
            if (this._editMode)
            {
                if(this._spacebar.dataset.enabled == "true") //SW00144529 fix - call btnClicked only if space button is enabled
                {
                    this._btnClicked(' ');
                };
            }
            else
            {
                this._incrementFocus("right");
            }
            response = "consumed";
            break;
        case "right":
            response = "consumed";
            break;

        case "upStart":
            if (!this._editMode)
            {
                this._incrementFocus("up");
            }
            response = "consumed";
            break;
        case "up":
            response = "consumed";
            break;

        case "downStart":
            this._incrementFocus("down");
            response = "consumed";
            break;
        case "down":
            response = "consumed";
            break;

        case "selectStart":
            // Select Start
            var pressedKey = this._getFocusedKey(false);
            if (pressedKey.dataset.enabled === "true" || (pressedKey === this._btnBackspace.divElt && this._btnBackspace.isEnabled === true))    //Disabled check
            {
                if (pressedKey.id.indexOf("ButtonCtrl") == 0)   //'Backspace'
                {
                    this._btnBackspace.handleControllerEvent("selectStart");
                }
                else
                {
                    if (pressedKey === this._input)
                    {
                        if (this._editMode)
                        {
                            this._setKeyFocused(this._caret, false);
                        }
                        else
                        {
                            this._setKeyFocused(this._input, false);
                            pressedKey = this._caret;
                        }
                    }
                    pressedKey.classList.add('activeState');
                }
                response = "consumed";
            }
            break;
        case "select":
            var pressedKey = this._getFocusedKey(false);
            if (pressedKey === this._input && this._editMode === false)
            {
                pressedKey = this._caret;
            }

            if (pressedKey.dataset.enabled === "true" || (pressedKey === this._btnBackspace.divElt && this._btnBackspace.isEnabled === true))    //Disabled check
            {
                if (this._focusedKey.id.indexOf("ButtonCtrl") == 0)   //'Backspace'
                {
                    this._btnBackspace.handleControllerEvent("select");
                    break;
                }

                pressedKey.classList.remove('activeState');

                if (this._focusData.row == 0 && this._focusData.col < this._focusData.columns - 1)
                {
                    if (this._editMode)
                    {
                        //put focusData on this._input
                        this._focusData.row = 0;
                        this._focusData.col = 0;
                    }
                    else
                    {
                        this._setCaretToEnd();
                    }

                    framework.common.beep("Short", "Multicontroller");
                    this._setEditMode(!this._editMode);
                }
                else if (this._focusData.row == 1 && this._conversionLang &&
                            (this._isJaJpConversionLoaded || this._isZhCnConversionLoaded || this._isZhTwConversionLoaded || this._isCnHkConversionLoaded || this._isMnTwConversionLoaded))
                {
                    //Suggestions
                    this._suggestionSelectHelper(this._focusedKey.id, "Multicontroller");
                }
                else
                {
                    var myEvent = {
                        target: this._focusedKey,
                        currentTarget: this._focusedKey
                    };

                    switch (this._focusedKey.id)
                    {

                        case 'btnCancel':
                            this._cancelHandler(myEvent, "Multicontroller");
                            break;

                        case 'btnShift':
                        case 'btnLayoutSwitch':
                            this._changeLayoutHandler(myEvent, "Multicontroller");
                            break;

                        case 'btnOK':
                            this._processInputHandler(myEvent, "Multicontroller");
                            break;

                        case 'btnGlobe':
                            this._changeLanguageHandler(myEvent, "Multicontroller");
                            break;

                        case "btnMod":
                            this._combineCharacters("Multicontroller");
                            break;

                        default:
                            this._btnSelectHandler(myEvent, "Multicontroller");
                            break;
                    }
                }
                response = "consumed";
            }
            break;

        default:
            log.debug("Controller event " + eventID + " does nothing.");
            break;
    }

    return response;
};

/*
 * Shifts the focus to the next HTML element.
 * Disabled buttons are skipped here. (see comment on focusReverted boolean for exception)
 * If focus is to shift to the delete key, then use buttonCtrl's handleControllerEvent()
 *
 * @direction: the direction to shift the focus
 */
KeyboardCtrl.prototype._incrementFocus = function(direction)
{
    //not used for the same reason as this._lastHighlightedKey. This is used for the case that the user wants
    //to bump left to the end of a row and that key is disabled. we can't skip it and go to the next one, we must go back
    var prevFocusPos = {row: this._focusData.row, col: this._focusData.col};

    //if we have to use the prevFocusPos above (see explanation), and the position we move the focus back to is a
    //disabled key, which could happen when atSpeed, then we need to know it's ok to place the focus on a disabled key
    var focusReverted = false;

    this._setKeyFocused(this._focusedKey, false);
    var wasfocusedStr = this._focusedKey.dataset.value;
    log.debug("was: " + wasfocusedStr);

    var focusedStr = '';
    var nextKeyIsDisabled = true;    //variable to check if we need to keep looking for a place to set the focus... initiallt set to true so the search will begin.
    var checkAdjacent = false;
    while(nextKeyIsDisabled === true && direction != 'break' && focusReverted == false)
    {
        switch (direction)
        {
            case "up":
                if (checkAdjacent && this._focusData.col < this._focusData.columns - 1)
                {
                    /* check adjacent button */
                    this._focusData.col++;
                    this._focusedKey = this._getFocusedKey(false);

                    if (this._focusedKey.enabled === "false")
                    {
                        this._focusData.col--;
                        checkAdjacent = false;
                    }
                    else
                    {
                        break;
                    }
                }

                if (this._focusData.row > 0)
                {
                    this._focusData.row--;
                }
                else //go back, we're bumping to a disabled key that can't be skipped over
                {
                    focusReverted = true;
                    this._focusData.row = prevFocusPos.row;
                }

                if (!this._isSuggestionPopulated())
                {
                    if (this._focusData.row == 1)
                    {
                        this._focusData.row = 0; //skip empty suggestion section
                    }
                }
                else if (this._cssStyle == 'suggFiveTen' || this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
                {
                    if (this._focusData.row == 1)
                    {
                        this._focusData.col = 1; //snap all the way to the left of the suggestion section
                    }
                }

                if ((this._focusData.row + 1) == this._focusData.shiftedRow) //We're moving from the shifted rows back to un-shifted rows
                {
                    /* check adjacent button next time through (if necessary -- current button is disabled) */
                    checkAdjacent = true;
                }

                break;

            case "down":
                if (checkAdjacent && this._focusData.col > 0)
                {
                    this._focusData.col--;
                    this._focusedKey = this._getFocusedKey(false);

                    if (this._focusedKey.enabled === "false")
                    {
                        this._focusData.col++;
                        checkAdjacent = false;
                    }
                    else
                    {
                        break;
                    }
                }

                //if focus is on input field
                if (this._focusData.row == 0 && this._editMode)
                {
                    //calculate where to shift down from caret
                    this._focusData.col = Math.floor((this._caretOffset + 2) / (this._btnWidth + this._btnMargin));
                }
                //if shifting down off row 3, col 8 in suggFiveTen, and this._currentLayout == "special1",
                // the highlight looks wrong, but that is the spec. If it wasn't I would set col = 9 in an else here.

                if (this._focusData.row < this._focusData.rows - 1)
                {
                    this._focusData.row++;

                    if (this._focusData.col >= this._focusData.columns)
                    {
                        log.debug("**************shifted down off the end of a row...*****************");
                        //this._focusData.col = this._focusData.columns - 1;
                    }
                }
                else //go back, we're bumping to a disabled key that can't be skipped over
                {
                    focusReverted = true;
                    this._focusData.row = prevFocusPos.row;
                }

                if (!this._isSuggestionPopulated())
                {
                    if (this._focusData.row == 1)
                    {
                        this._focusData.row = 2; //skip empty suggestion section
                    }
                }
                else if (this._cssStyle == 'suggFiveTen' || this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
                {
                    if (this._focusData.row == 1)
                    {
                        this._focusData.col = 1; //snap all the way to the left of the suggestion section
                    }
                    else if (this._focusData.row == 2)
                    {
                        this._focusData.row = this._lastHighlightedKey.row;   // coming down off the converter. Must go back to last highlighted key
                        this._focusData.col = this._lastHighlightedKey.col;
                    }
                }

                if ((this._focusData.row) == this._focusData.shiftedRow)
                {
                    /* check adjacent button next time through (if necessary -- current button is disabled) */
                    checkAdjacent = true;
                }
                break;

            case "left":
                if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][0]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][1])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][0];
                }
                else if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][2]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][3])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][2];
                }

                if (this._focusData.col > 0)
                {
                    this._focusData.col--;
                }
                else //go back, we're bumping to a disabled key that can't be skipped over
                {
                    focusReverted = true;
                    this._focusData.col = prevFocusPos.col;
                }
                break;

            case "right":
                if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][0]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][1])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][1];
                }
                else if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][2]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][3])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][3];
                }

                if (this._focusData.col < this._focusData.columns - 1)
                {
                    this._focusData.col++;
                }
                else //go back, we're bumping to a disabled key that can't be skipped over
                {
                    focusReverted = true;
                    this._focusData.col = prevFocusPos.col;
                }
                break;

            case "ccw":
                if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][0]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][1])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][0];
                }
                else if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][2]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][3])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][2];
                }

                if (this._focusData.col > 0)
                {
                    this._focusData.col--;
                }
                else if (this._focusData.row > 0)
                {
                    this._focusData.row--;
                    this._focusData.col = this._focusData.columns - 1;
                    if(this.properties.locale == 'mn_TW' && this._focusData.row > 2)
                    {
                    	this._focusData.col--;
                    }
                    if (!this._isSuggestionPopulated() && this._focusData.row == 1)
                    {
                        //skip empty suggestion row
                        this._focusData.row--;
                    }
                }
                else //go back, we're rotating to a disabled key that can't be skipped over (or going ccw from the input, which does nothing)
                {
                    focusReverted = true;
                    this._focusData.row = prevFocusPos.row;
                    this._focusData.col = prevFocusPos.col;
                }
                break;

            case "cw":
                if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][0]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][1])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][1];
                }
                else if (this._focusData.col >= this._focusData.focusDuplicates[this._focusData.row][2]
                            && this._focusData.col <= this._focusData.focusDuplicates[this._focusData.row][3])
                {
                    this._focusData.col = this._focusData.focusDuplicates[this._focusData.row][3];
                }

                if (this._focusData.col < this._focusData.columns - 1)
                {
                    this._focusData.col++;
                }
                else if (this._focusData.row < this._focusData.rows - 1)
                {
                        this._focusData.row++;
                        this._focusData.col = 0;
                        if (!this._isSuggestionPopulated() && this._focusData.row == 1)
                        {
                            //skip empty suggestion row
                            this._focusData.row++;
                        }
                }
                else //go back, we're rotating to a disabled key that can't be skipped over (or going cw from OK, which does nothing)
                {
                    focusReverted = true;
                    this._focusData.row = prevFocusPos.row;
                    this._focusData.col = prevFocusPos.col;
                }
                break;

            case "redraw":
                this._focusData.row = 0;
                this._focusData.col = 0;
                direction = 'break';
                break;

            case "acceptSugg":
                this._focusData.row = this._lastEnteredKey.row;
                this._focusData.col = this._lastEnteredKey.col;
                direction = 'break';
                break;

            default:
                log.debug("default in incrementFocus()");
                break;
        }

        this._focusedKey = this._getFocusedKey(focusReverted);
        if (this._focusedKey.dataset.enabled === "true" || (this._focusedKey === this._btnBackspace.divElt && this._btnBackspace.isEnabled === true))
        {
              nextKeyIsDisabled = false;
        }
        else
        {
              nextKeyIsDisabled = true;
        }
        focusedStr = this._focusedKey.dataset.value;
    }

    if (this._editMode)
    {
        this._setEditMode(false);
    }
    this._setKeyFocused(this._focusedKey, true);

    log.debug("now: " + focusedStr);

    log.debug(" :012345678901");
    for (var i=0; i<this._focusData.rows; i++)
    {
        var rowStr = "";
        for (var j=0; j<this._focusData.columns; j++)
        {
            if (j == this._focusData.col && i == this._focusData.row)
                rowStr += "|";
            else
                rowStr += "0";
        }
        log.debug(i + ":" + rowStr);
    }
    log.debug(' ');

};

/*
 * Returns the HTML Element located at the current values in this._focusData.row and .col
 * @reverted -- If true, will not return an object with dataset.value = '', which emulates a disabled key
 *           -- used when needing to place the focus back on a disabled key (can happen when atSpeed).
 */
KeyboardCtrl.prototype._getFocusedKey = function(reverted)
{

    //NOTE: this._focusData.row starts at 0 on the row containing the input and the backspace button.

    if (this._focusData.row > 1)
    {
        this._lastHighlightedKey.row = this._focusData.row;
        this._lastHighlightedKey.col = this._focusData.col;
    }

    var focusedBtn;

    var layouts = this.divElt.getElementsByClassName('layout');
    var layoutIndex = 0;

    for (var i=0; i<layouts.length; i++)
    {
        if (this._layouts[this.properties.locale][i].name === this._currentLayout)
        {
            layoutIndex = i;
            break;
        }
    }

    switch (this._focusData.row)
    {
        case 0:
            if (this._focusData.col <= this._focusData.focusDuplicates[0][1])
            {
                focusedBtn = this._input;
            }
            else
            {
                focusedBtn = this._btnBackspace.divElt;
            }
            break;

        case 1:
            if (this._cssStyle == 'suggFiveTen' || this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                //suggestions
                if (this._isSuggestionPopulated())  //check that suggestion row is not empty
                {
                    if ((this._focusData.col + Math.round(this._firstVisibleSuggestion)) < 1)
                    {
                        /* Before the first suggestion */
                        focusedBtn = this._leftArrow;
                        //set as left arrow
                    }
                    else if(this._focusData.col < 1) //If reached start of visible suggestions but not yet start of suggestionDivs, moveSuggestions to left
                    {
                        this._moveSuggestions("left");
                        this._focusData.col++;
                        focusedBtn = this._suggestionDivs[Math.floor(this._firstVisibleSuggestion)];
                    }
                    //If traversed till end of suggestionsDivs and there are no more suggestions to show OR if reached right arrow by commander moving from keyboard buttons to right suggestion arrow
                    else if(((Math.round(this._firstVisibleSuggestion) + this._focusData.col) > this._suggestionDivs.length) ||(((Math.round(this._firstVisibleSuggestion) + this._focusData.col) > this._numSuggestions) && (this._suggestionDivs.length>this._numSuggestions))|| this._focusedKey.className == 'btn')
                    {
                        focusedBtn = this._rightArrow;
                        //set as right arrow
                    }
                   else if ((this._focusData.col > this._visibleSuggCount) &&
                            (this._focusData.col >= this._focusData.focusDuplicates[1][0] && this._focusData.col <= this._focusData.focusDuplicates[1][1]))
                    {
                        //because the suggestion divs have expanded, there are less possible focus positions than this._focusData.columns
                        //Here the focus position is "between" the last visible suggestion and the right arrow, need to check the focus duplicates array..
                        this._moveSuggestions("right");
                        this._focusData.col = this._visibleSuggCount;
                        focusedBtn = this._suggestionDivs[Math.round(this._firstVisibleSuggestion) + this._focusData.col - 1];
                    }
                    else
                    {
                        //number may be half integer.. round() will round up
                        focusedBtn = this._suggestionDivs[Math.round(this._firstVisibleSuggestion) + this._focusData.col - 1]; //subtract one. col 0 corresponds the the left arrow.
                        //set as last suggestion in array
                    }
                }
                else
                {
                    //suggestion row is empty
                    focusedBtn = this._leftArrow;
                    log.debug('Suggestion row is empty... Focus should skip it');
                }
            }
            else    /* fiveTen, sixTen, sixTwelve */
            {
                // First row of buttons
                focusedBtn = this._getButton(0, this._focusData.col);
            }
            break;

        case 2:
            if (this._cssStyle == 'suggFiveTen' || this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                // First row of buttons
                focusedBtn = this._getButton(0, this._focusData.col);
            }
            else if (this._cssStyle == 'sixTen' || this._cssStyle == 'sixTwelve')
            {
                // Second row of buttons
                focusedBtn = this._getButton(1, this._focusData.col);
            }
            else    /* fiveTen */
            {
                // Second row of buttons, last button is duplicated send true as third param
                focusedBtn = this._getButton(1, this._focusData.col, true);
            }
            break;

        case 3:
            if (this._cssStyle == 'suggFiveTen')
            {
                if (this._currentLayout == "special2")
                {
                    focusedBtn = this._getButton(1, this._focusData.col, false);
                }
                else
                {
                    // Second row of buttons, last button is duplicated send true as third param
                    focusedBtn = this._getButton(1, this._focusData.col, true);
                }
            }
            else if (this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                // Second row of buttons
                if(this.properties.locale == 'mn_TW') //in mn_TW, last button of rows 3,4 and 5 are duplicated
                {
                	focusedBtn = this._getButton(1, this._focusData.col, true);
                }
                else
                {
                	focusedBtn = this._getButton(1, this._focusData.col);
                }
            }
            else if (this._cssStyle == 'sixTen' || this._cssStyle == 'sixTwelve')
            {
                // Third row of buttons
                focusedBtn = this._getButton(2, this._focusData.col);
            }
            else    /* fiveTen */
            {
                // Third row of buttons
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._btnShift;
                }
                else if (this._focusData.col >= this._focusData.columns - 2)
                {
                    focusedBtn = this._layoutSwitch;
                }
                else
                {
                    // Here the shift key causes the second parameter to be one less
                    focusedBtn = this._getButton(2, this._focusData.col - 1);
                }
            }
            break;

        case 4:
            if (this._cssStyle == 'suggFiveTen')
            {
                // special case because of the extra button in this row
                // Third row of buttons
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._btnShift;
                }
                else if (this._focusData.col >= this._focusData.columns - 1)
                {
                    focusedBtn = this._layoutSwitch;
                }
                else
                {
                    // Here the shift key causes the second parameter to be one less
                    focusedBtn = this._getButton(2, this._focusData.col - 1);
                }
            }
            else if (this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                // Third row of buttons
                if(this.properties.locale == 'mn_TW') //in mn_TW, last button of rows 3,4 and 5 are duplicated
                {
                	focusedBtn = this._getButton(2, this._focusData.col, true);
                }
                else
                {
                	focusedBtn = this._getButton(2, this._focusData.col);
                }
            }
            else if (this._cssStyle == 'sixTen' || this._cssStyle == 'sixTwelve')
            {
                // Fourth row of buttons
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._btnShift;
                }
                else if (this._focusData.col >= this._focusData.columns - 2)
                {
                    focusedBtn = this._layoutSwitch;
                }
                else
                {
                    // Here the shift key causes the second parameter to be one less
                    focusedBtn = this._getButton(3, this._focusData.col - 1);
                }
            }
            else    /* fiveTen */
            {
                // Spacebar row
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._cancel;
                }
                else if (this._focusData.col == 1)
                {
                    focusedBtn = this._globe;
                }
                else if (this._focusData.col == 2 || this._focusData.col == 3 || this._focusData.col == 4 || this._focusData.col == 5 || this._focusData.col == 6 || this._focusData.col == 7)
                {
                    focusedBtn = this._spacebar;
                }
                else if (this._focusData.col == 8)
                {
                    focusedBtn = this._ok;
                }
                else
                {
                    focusedBtn = this._ok;
                    log.warn("looking for a key after the OK button, or before the cancel button in row 4");
                }
            }
            break;

        case 5:
            if (this._cssStyle == 'suggFiveTen')
            {
                // Spacebar row
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._cancel;
                }
                else if (this._focusData.col == 1)
                {
                    focusedBtn = this._globe;
                }
                else if (this._focusData.col == 2 || this._focusData.col == 3 || this._focusData.col == 4 || this._focusData.col == 5 || this._focusData.col == 6 || this._focusData.col == 7 || this._focusData.col == 8)
                {
                    focusedBtn = this._spacebar;
                }
                else if (this._focusData.col == 9 || this._focusData.col == 10)
                {
                    focusedBtn = this._ok;
                }
                else
                {
                    log.error("looking for a key after the OK button, or before the cancel button in row 5");
                }
              }
            else if (this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                // Fourth row of buttons
                if(this.properties.locale == 'mn_TW') //in mn_TW, last button of rows 3,4 and 5 are duplicated
                {
                    focusedBtn = this._getButton(3, this._focusData.col, true);
                }
                else
                {
                    focusedBtn = this._getButton(3, this._focusData.col);
                }
            }
            else if (this._cssStyle == 'sixTen' || this._cssStyle == 'sixTwelve')
            {
                // Spacebar row
              
                 if (this._focusData.col == 0)
                 {
                     focusedBtn = this._cancel;
                 }
                 else if (this._focusData.col == 1)
                 {
                     focusedBtn = this._globe;
                 }
                 else if (this._focusData.col == 2 || this._focusData.col == 3 || this._focusData.col == 4 || this._focusData.col == 5 || this._focusData.col == 6 || this._focusData.col == 7)
                 {
                     focusedBtn = this._spacebar;
                 }
                 else if (this._focusData.col == 8 || this._focusData.col == 9)
                 {
                     if (this._focusData.columns == 10)
                     {
                         focusedBtn = this._ok;
                     }
                     else
                     {
                         focusedBtn = this._spacebar;
                     }
                 }
                 else if (this._focusData.col == 10 || this._focusData.col == 11)
                 {
              	     focusedBtn = this._ok;
                 }
                 else
                 {
                     log.error("looking for a key after the OK button, or before the cancel button in row 5");
                 }
            }
            else    /* fiveTen -- this shouldn't happen */
            {
                focusedBtn = this._input;
                log.debug("looking for a key not in the layout. row: 5, col: " + this._focusData.col);
            }
            break;

        case 6:
            //only in kana layout
            if (this._cssStyle == 'suggSevenTen' || this._cssStyle == 'suggSevenEleven')
            {
                // Fifth row of buttons
                if (this._focusData.col < 9)
                {
                    focusedBtn = this._getButton(4, this._focusData.col);
                }
                else
                {
                    focusedBtn = this._layoutSwitch;
                }
            }
            else
            {
                focusedBtn = this._input;
                log.debug("looking for a key not in the layout. row: 6, col: " + this._focusData.col);
            }
            break;

        case 7:
            //only in kana layout
            if (this._cssStyle == 'suggSevenTen')
            {
                // Spacebar row
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._cancel;
                }
                else if (this._focusData.col == 1)
                {
                    focusedBtn = this._globe;
                }
                else if (this._focusData.col == 2)
                {
                    focusedBtn = this._modKey;
                }
                else if ( this._focusData.col == 3 || this._focusData.col == 4 || this._focusData.col == 5 || this._focusData.col == 6 || this._focusData.col == 7 || this._focusData.col == 8)
                {
                    focusedBtn = this._spacebar;
                }
                else if (this._focusData.col == 9 || this._focusData.col == 10)
                {
               	    focusedBtn = this._ok;
                }
                else
                {
                    log.error("looking for a key after the OK button, or before the cancel button in row 7");
                }
            }
            else if (this._cssStyle == 'suggSevenEleven')
            {
                // Spacebar row
                if (this._focusData.col == 0)
                {
                    focusedBtn = this._cancel;
                }
                else if (this._focusData.col == 1)
                {
                    focusedBtn = this._globe;
                }
                else if (this._focusData.col == 2)
                {
                    focusedBtn = this._modKey;
                }
                else if (this._focusData.col == 3 || this._focusData.col == 4 || this._focusData.col == 5 || this._focusData.col == 6 || this._focusData.col == 7 || this._focusData.col == 8 || this._focusData.col == 9)
                {
                    focusedBtn = this._spacebar;
                }
                else if (this._focusData.col == 10)
                {
                    focusedBtn = this._ok;
                }
                else
                {
                    log.error("looking for a key after the OK button, or before the cancel button in row 7");
                }
                
            }
            else
            {
                focusedBtn = this._input;
                log.debug("looking for a key not in the layout. row: 7, col: " + this._focusData.col);
            }
            break;

        default:
            focusedBtn = this._cancel;
            log.debug("your row index is too high! " + this._focusData.row);
            break;
    }

    return focusedBtn;
};

KeyboardCtrl.prototype._setKeyEnabled = function(keyRef, isEnabled)
{
    if (isEnabled)
    {
        if (keyRef == this._input)
        {
            this._inputTouchActiveArea.classList.remove("disabled");
        }
        keyRef.classList.remove("disabled");
        keyRef.dataset.enabled = "true";
    }
    else
    {
        if (keyRef == this._input)
        {
            this._inputTouchActiveArea.classList.add("disabled");
        }
        keyRef.classList.add("disabled");
        keyRef.dataset.enabled = "false";
    }
};

KeyboardCtrl.prototype._setKeyFocused = function(keyRef, isFocused)
{
    if (keyRef === this._btnBackspace.divElt)
    {
        if (isFocused)
        {
            this._btnBackspace.handleControllerEvent("acceptFocusInit");
        }
        else
        {
            this._btnBackspace.handleControllerEvent("lostFocus");
        }
    }
    else if(keyRef == this._input)
    {
        if (isFocused)
        {
            this._inputTouchActiveArea.classList.add("focused");
        }
        else
        {
            this._inputTouchActiveArea.classList.remove("focused");
        }
    }
    else
    {
        if (isFocused)
        {
            keyRef.classList.add("focused");
        }
        else
        {
            keyRef.classList.remove("focused");
        }

    }
};

KeyboardCtrl.prototype._setKeyDownHighlight = function(keyRef, isDown)
{
    //no use for delete key yet... may need it though
    if (keyRef == this._input )
    {
        if (isDown)
        {
            this._inputTouchActiveArea.classList.add("activeState");
        }
        else
        {
            this._inputTouchActiveArea.classList.remove("activeState");
        }
    }
    else
    {
        if (isDown)
        {
            keyRef.classList.add("activeState");
        }
        else
        {
            keyRef.classList.remove("activeState");
        }
    };
};

KeyboardCtrl.prototype._getButton = function(row, col, duplicate)
{
    var focusedBtn;

    if (duplicate)
    {
        /* the last key in the row could be duplicated in the incrementFocus() logic,
         * so we need to be sure that the col param isn't too large
         */
        if (col > this._focusData.columns - 2)
        {
            col = this._focusData.columns - 2;
        }
    }

    if (col >= this._focusData.columns - 1)
    {
        focusedBtn = this._btns[row][this._focusData.columns-1];
    }
    else
    {
        focusedBtn = this._btns[row][col];
    }

    return focusedBtn;
};

/* =============
 * UTILITIES
 * =============
 */

/*
 * Receives button value, sets focusData row and col.
 *
 * This function is resposible for moving the focus from the previous key
 * to the current key when a key is pressed (could be the same key).
 */
KeyboardCtrl.prototype._targetToFocusdata = function(target, afterUpdate)
{
    var buttonValue = target.dataset.value;

    if (typeof buttonValue !== "string")
    {
        log.debug("parameter passed to KeyboardCtrl._targetToFocusdata() must be a String");
        return;
    }

    if (this._focusedKey === target && !afterUpdate)
    {
        log.debug("focus is already on:", buttonValue);
        return;
    }

    this._setKeyFocused(this._focusedKey, false);

    var layoutIndex = this._getLayoutIndex();
    var row, column;

    if (buttonValue.length > 1 && buttonValue != "^_^" && this._thaiCombiners.indexOf(buttonValue) < 0)
    {
        //It is either a control button, or a suggestion
        if (target.id.indexOf("suggestion") > -1)
        {
            //suggestion
            var selectedIndex = target.id.substring(10, target.id.length);
            var firstWholeSuggestion = Math.ceil(this._firstVisibleSuggestion);
            row = 1;
            column = selectedIndex - firstWholeSuggestion + 1;

            // Here, if column == 0 OR column == this._focusData.focusDuplicates[1][0] (the start of the duplicates in the suggestion row),
            // then the user selected a half-shown suggestion div

        }
        else
        {
            //Then it is a control button
            switch(buttonValue)
            {
                case "input":
                    //don't call from changeCaretCallback()
                    row = 0;
                    column = 0;
                    break;
                case "shift":  //Not included in ja_JP_ABC layouts
                    row = this._focusData.rows - 2;
                    column = 0;
                    break;
                case "layout":
                    row = this._focusData.rows - 2;
                    column = this._focusData.columns - 1;
                    break;
                case "cancel":
                    row = this._focusData.rows - 1;
                    column = 0;
                    break;
                case "globe":
                    row = this._focusData.rows - 1;
                    column = 1;
                    break;
                case "space":
                    row = this._focusData.rows - 1;
                    column = 4;
                    break;
                case "OK":
                    row = this._focusData.rows - 1;
                    column = this._focusData.columns - 1;
                    break;
                case "mod":
                    row = this._focusData.rows - 1;
                    column = 2;
                default:
                    log.debug("Default case reached in _referenceToFocusdata()");
                    break;
            }
        }
    }
    else
    {
        var i, j;
        var lastCharRow = this._layouts[this.properties.locale][layoutIndex].buttons.length - 1;

        for (i=0; i<this._layouts[this.properties.locale][layoutIndex].buttons.length; i++)
        {
            for (j=0; j<this._layouts[this.properties.locale][layoutIndex].buttons[i].length; j++)
            {
                if (buttonValue == this._layouts[this.properties.locale][layoutIndex].buttons[i][j])
                {
                    row = i + 1;
                    if (this._cssStyle == "suggFiveTen" || this._cssStyle == "suggSevenTen" || this._cssStyle == "suggSevenEleven")
                    {
                        row++;
                    }

                    column = j;
                    //last row of characters (except in Japanese) is shifted one position because of the shift key.
                    if (i == lastCharRow && this._cssStyle != "suggSevenTen" && this._cssStyle != "suggSevenEleven")
                    {
                        column++;
                    }
                }
            }
        }
    }

    this._focusData.row = row;
    this._focusData.col = column;
    if (this._editMode)
    {
        this._setEditMode(false);
    }
    this._focusedKey = this._getFocusedKey(false);
    this._setKeyFocused(this._focusedKey, true);
};

/*
 * Either returns a string of • characters for password variations, or
 * a formatted display string so HTML sequences do not get converted.
 *
 * @textStr -- display string
 */
KeyboardCtrl.prototype._displayString = function(textStr)
{
    var returnStr = '';
    if (this.properties.isPassword && this.properties.isPassword === true)
    {
        var i;
        for (i=0; i<textStr.length; i++)
        {
            //build a string with i •'s and return that
            returnStr = returnStr.concat('●');
        }
    }
    else
    {
        returnStr = textStr;
    }

    return returnStr;
};

/*
 * Changes this._editMode and CSS classes for focus effects
 *
 * @isEditMode - boolean
 */
KeyboardCtrl.prototype._setEditMode = function(isEditMode)
{

    if (isEditMode)
    {
        var _oldFocusedKey = this._getFocusedKey(false);
        this._setKeyFocused(_oldFocusedKey, false);
        this._focusData.row = 0;
        this._focusData.col = 0;
        this._setKeyFocused(this._caret, true);
        this._focusedKey = this._caret;
    }
    else
    {
        this._setKeyFocused(this._caret, false);
        this._focusedKey = this._getFocusedKey(false);
        this._setKeyFocused(this._focusedKey, true);
    }

    this._editMode = isEditMode;
};

/*
 * (internal) Called by GUI Framework just before a context change occurs.
 * Button will issue any remaining callbacks before leaving the screen.
 */
KeyboardCtrl.prototype.finishPartialActivity = function()
{
    log.debug("KeyboardCtrl finishPartialActivity()");
    // If currently held, call holdStopCallback

    this._btnBackspace.finishPartialActivity();
};


/*
 * =========================
 * FOCUS RESTORE
 * =========================
 */
KeyboardCtrl.prototype.getContextCapture = function()
{
    log.debug("getContextCapture called", this._focusData);

    return {
        cssStyle: this._cssStyle,
        currentLayout: this._currentLayout,
        focusData: utility.deepCopy(this._focusData),
        prevFocus: this._prevFocus,
        editMode: this._editMode,
        caretPos: this._caretPos,
        caretLeft: this._caret.style.left,
        caretOffset: this._caretOffset,
        inputStr: this._inputStr,
        highlightPos: this._highlightPos,
        highlightStr: this._highlightedStr,
        candidateZero: this._candidateZero,
        candidateZeroCaretPos : this._candidateZeroCaretPos,
        lastEnteredKey : this._lastEnteredKey,
        atSpeed: this._atSpeed,
        spanOffset: this._spanOffset,
        highlightSpanOffset: this._highlightSpanOffset,
        outgoingLocale: framework.localize.getKeyboardLanguage(),
    };
};

KeyboardCtrl.prototype.restoreContext = function(restoreData)
{
    log.debug("restoreContext called", restoreData);
    //This is called after _init(), so it needs to actually update these settings

    var _incomingLocale = framework.localize.getKeyboardLanguage();
    if (_incomingLocale === restoreData.outgoingLocale)
    {
        //no lang change, restore focus
        this._cssStyle = restoreData.cssStyle;
        this._currentLayout = restoreData.currentLayout;
        this._cssRefresh();
        this._setLayoutShiftInnerText();
        //SW00144532 - if current layout is lettersCapsLock, call this._layoutUpdate with "lettersCaps"
        if(this._currentLayout == "lettersCapsLock")
        {
        	this._layoutUpdate("lettersCaps");
        }
        else
        {
        	this._layoutUpdate(this._currentLayout);
        }
        //SW00144531 - if layout is symbols1, then disable shift button.
        if(this._currentLayout == "symbols1" && this.properties.locale != 'ar_SA_ABC' && this.properties.locale != 'ar_SA' && this.properties.locale != 'he_IL_ABC')
        {
            this._setKeyEnabled(this._btnShift, false);
        }

        this._focusData = restoreData.focusData;
        this._prevFocus = restoreData.prevFocus;
        this._editMode = restoreData.editMode;
        if (this._editMode)
        {
            this._setEditMode(true);    //false by default
        }
        else
        {
            this._setKeyFocused(this._focusedKey, false);
            this._focusedKey = this._getFocusedKey(true);
            this._setKeyFocused(this._focusedKey, true);
        }
    }
    //else, this._cssStyle, this._currentLayout, and focus-state already set in _createStructure()
    // so there is nothing to do here

    //_createStructure may have filled the input with properties.value..
    //it is passed in from the app for this context and needs to be overwritten here, to default values
    if (this._inputStr !== "")
    {
        this._inputStr = "";
        this._inputSpan.innerText = this._displayString(this._inputStr);
        var _length = this._characterSizes.length;
        for (var i=0; i<_length; i++)
        {
            this._characterSizes.pop();
        }
        this._characterSizes[0] = 0;
        this._byteCount = 0;
        this._caretPos = 0;
        this._caretOffset = this._inputDivXPadding;
        this._spanOffset = this._inputDivXPadding;
    }
    else
    {
        this._setPlaceholder();
        this._setKeyEnabled(this._ok, false);
    }
    //gray out OK button if restored input string is empty - SW00146228
    if (restoreData.inputStr == "")
    {
    this._setKeyEnabled(this._ok, false);
    };

    this._fillInputWithStr(restoreData.inputStr);
    this._isInsertValid();

    if (this._noInsert === false)
    {
        //insertion is enabled
        this._caretPos = restoreData.caretPos;
        this._caretOffset = restoreData.caretOffset;
        this._caret.style.left = restoreData.caretLeft;

        this._spanOffset = restoreData.spanOffset;
        this._inputSpan.style.left = this._spanOffset + "px";
    }
    //else, insertion is disabled.. either we're in Thai/Arabic, or the string contains those chars
    //caret should already be at end of string, nothing to do here

    if (_incomingLocale === restoreData.outgoingLocale)
    {
        if (this._conversionLang)
        {
            this._lastEnteredKey = restoreData.lastEnteredKey;
            this._highlightPos = restoreData.highlightPos;
            this._highlightedStr = restoreData.highlightStr;
            this._candidateZeroCaretPos = restoreData.candidateZeroCaretPos;
            this._candidateZero = restoreData.candidateZero;
            this._updateHighlightedArea();
            this._updateSuggestions();
            this._checkModKeyStatus();
        }
    }

};


/*
 * =========================
 * GARBAGE COLLECTION
 * =========================
 */
KeyboardCtrl.prototype._internalCleanUp = function(internal)
{
    if (this._deleteIntervalId != null)
    {
        clearInterval(this._deleteIntervalId);
        this._deleteIntervalId = null;
    }

    // remove event listeners
    if (this._btnShift) // no btnShift in Kana layout
    {
        this._removeListeners(this._btnShift);
    }
    this._removeListeners(this._layoutSwitch);
    this._removeListeners(this._globe);
    this._removeListeners(this._spacebar);
    this._removeListeners(this._cancel);
    this._removeListeners(this._ok);
    this._btnBackspace.cleanUp();

    for (var i=0; i<this._btns.length; i++)
    {
        for (var j=0; j<this._btns[i].length; j++)
        {
            this._removeListeners(this._btns[i][j]);
        }
    }

    if (this._suggestionDivs)
    {
        if (this._modKey)
        {
            this._removeListeners(this._modKey);
        }

        for (var i=0; i<this._suggestionDivs.length; i++)
        {
            this._removeListeners(this._suggestionDivs[i]);
        }
        this._removeListeners(this._leftArrow);
        this._removeListeners(this._rightArrow);
        this._input.removeChild(this._highlightedSpan);
        this._highlightedStr = "";
        this._highlightPos.start = -1;
        this._highlightPos.end = -1;
        this._suggestionDivs = null;
        this._suggestionRowWrapper.innerHTML = '';
        this.divElt.removeChild(this._suggestionRowWrapper);
        if (!guiConfig.debugMode)
        {
            this._predEngine.UnLoadDictionary();    //unloads any loaded dictionary(s)
            this._predEngine = null;
        }
        this._isJaJpConversionLoaded = false;
        this._isZhCnConversionLoaded = false;
        this._isZhTwConversionLoaded = false;
        this._isCnHkConversionLoaded = false;
        this._isMnTwConversionLoaded = false;
    }

    this.divElt.removeChild(this._btnWrapper);
    this._btnWrapper.innerHTML = '';
    this._prevFocus = null;
    this._prevCssStyle = null;


    if (!internal)
    {
        this._inputTouchActiveArea.removeEventListener(this._MOUSEDOWNEVENT, this._inputDownCallback, false);
        document.body.removeEventListener(this._MOUSEUPEVENT, this._inputUpCallback, false);
        this._inputTouchActiveArea.removeEventListener(this._MOUSEOUTEVENT, this._inputOutCallback, false);
        this._inputTouchActiveArea.removeEventListener(this._MOUSEOVEREVENT, this._inputOverCallback, false);
    }
};

KeyboardCtrl.prototype.cleanUp = function()
{
    this._internalCleanUp();

    // remove properties
    this.properties.length = 0;
    log.debug("Template called cleanUp() function");
    this._prevFocus = this._focusData;
    this._prevCssStyle = this._cssStyle;
};

// Register Loaded with Framework
framework.registerCtrlLoaded('KeyboardCtrl');
