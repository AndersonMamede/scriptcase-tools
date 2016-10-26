[![ScriptCase - v7 v8](https://img.shields.io/badge/scriptcase-v7%20%7C%20v8-brightgreen.svg)](https://github.com/AndersonMamede/scriptcase-tools/)
[![Chrome WebStore](https://img.shields.io/badge/platform-Chrome-brightgreen.svg)](https://chrome.google.com/webstore/detail/scriptcase-tools/mfokofbgiajojbgginjeglebmpejnpdm?utm_source=chrome-app-launcher-info-dialog)
[![Firefox](https://img.shields.io/badge/platform-Firefox%20(coming%20in%20next%20release)-lightgrey.svg)](https://github.com/AndersonMamede/scriptcase-tools/)
[![Dependencies](https://img.shields.io/badge/dependencies-none-orange.svg)](https://github.com/AndersonMamede/scriptcase-tools/)
[![License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](https://github.com/AndersonMamede/scriptcase-tools/blob/master/LICENSE)

# ScriptCase Tools
A browser extension to make working with ScriptCase simpler and more productive.

<p align="center"><img src="scriptcase_tools_1.1.0.png" title="ScriptCase Tools" alt="ScriptCase Tools"></p>

## Installation

### Quick Installation
Go to [Chrome Web Store](https://goo.gl/i4LtVl) to install the release version.

### Manual Installation (latest/development version)
1. Download this source code (https://github.com/AndersonMamede/scriptcase-tools)
2. Unzip the file
3. Navigate to **chrome://extensions**
4. Ensure the checkbox labeled **Developer mode** is enabled
5. Click "**Load unpacked extension...**" and select the "**source**" folder inside the (unzipped) folder

## ScriptCase Support
* ScriptCase v7
* ScriptCase v8

Other ScriptCase versions might work correctly, but were not tested.

Any problem with ScriptCase Tools in the above Scriptcases environment should be reported as a bug in our [issue tracker](https://github.com/AndersonMamede/scriptcase-tools/issues) or as a message to [mamede.anderson@gmail.com](mailto:mamede.anderson@gmail.com).

## Why was ScriptCase Tools built?
If you often use ScriptCase to develop your applications, you've probably noticed that its development environment lacks some basic functionalities (e.g., no shortcut keys, not restoring last cursor position), while others could be improved (e.g., code editor, main menu sensitivity).

Even though some users have pointed out some of the problems on ScriptCase official forum, those improvements haven't been made yet.

This browser extension was created to fulfill these gaps.

### How does it work?
Because ScriptCase doesn't provide a public API, hacking into its JavaScript/HTML/CSS code was the (only) way to go. And because of that, this extension heavily depends on ScriptCase's code and structure (e.g., specifics JavaScript functions, the DOM structure, some elements with specific ID/class name).

## Authors
* [Anderson Mamede](https://github.com/AndersonMamede)

## Contributing
* Fork this repository
* Submit [bug reports, ideas or new features](https://github.com/AndersonMamede/scriptcase-tools/issues)<br><br>

If you are working on a new feature, please [create an issue](https://github.com/AndersonMamede/scriptcase-tools/issues) for the feature you’re working on so that we can all avoid duplicating effort. When your new feature (or fix) is ready, submit a pull request and/or attach a patch to your issue.

## Legal and License
This project is not affiliated with, sponsored by, or endorsed by Netmake Soluções em Informática.

Licensed under the MIT License. Please see [LICENSE](LICENSE) for more information.

## Features

### v1.1.4
* Test only (FF release)

### v1.1.3
* Test only (FF release)

### v1.1.2
* Test only (FF release)

### v1.1.1
* Fix a problem that caused the new editor in "Templates HTML" page (app_template.php) not restore sublime marks/fold/cursor when navigating through the left menu (templates)

### v1.1.0
* New option to prevent ScriptCase session from timing out
* Now you can select a text (macro) on editor and press the shortcut key to open its documentation (default shortcut key is F1);
* New feedback form in the popup/settings box

### v1.0.0
* 'Internal libraries' and 'Templates HTML' also restore last cursor and scroll position
* New option to always restore last settings used to deploy
* New option to switch ScriptCase's default code editor to a newer and more complete version of CodeMirror:
	* Sublime Text-based shortcut keys (e.g., jump to line, selext next/all occurrences, duplicate line, etc)
	* New special theme 'Sublime Text (Detailed)', which shows invisible characters (tab and white spaces);
	* Highlight on editor and scrollbar all occurrences of the selected word/text
	* Possibility to add bookmarks/breakpoints in your code (Ctrl+F1/Alt+F1)
	* Possibility to fold/unfold code blocks (Ctrl+Q)
	* Autocomplete for PHP functions
	* Autocomplete for any word found within the editor
	* Highlight the starting and ending brackets (), {} and [] when cursor touches it

### v0.2.1
* Fix: When code editor was not found within a page, a JS exception was thrown, caused by how the verification was made

### v0.2.0
* New option to disable word/line wrapping in code editor (in SC v8, line wrapping was always on)

### v0.1.0
* Option to change ScriptCase's main menu default behavior from "open when hover" to "open when click"
* Option to make code editor's fullscreen mode collapse both left and right columns (not possible before SC v8)
* Option to set cursor and scroll back to its last known position on code editor after saving/generating/running an application and when navigating through ScriptCase's pages (e.g., events, applications settings)
* Option so set cursor and scroll back to its last known position on code editor when an application tab is clicked (application tab = 'Home' or your application)
* New shortcuts keys:
	* F1 => Show documentation (macros)
	* F2 => Save current application (same as the save button in the toolbar)
	* F7 => Give focus to code editor
	* F8 => Generate source code for current application (same as the generate source code button in the toolbar)
	* F9 => Run current application (same as the run button in the toolbar= save, generate and run)
	* F11 => Toggle code editor's fullscreen mode
