# ScriptCase Tools
A Chrome extension to make working with ScriptCase simplier and more productive.

![alt tag](scriptcase-tools-settings.png)

![alt tag](scriptcase-tools.png)

## Installation

### Quick Installation
Go to [Chrome Web Store](https://goo.gl/i4LtVl) to install the release version.

### Manual Installation (latest/development version)
1. Download this source code (https://github.com/AndersonMamede/scriptcase-tools)
2. Unzip the file
3. Navigate to **chrome://extensions**
4. Ensure the checkbox labeled **Developer mode** is enabled
5. Click "**Load unpacked extension...**" and select the "**source**" folder inside the unzipped folder

## ScriptCase Support
* ScriptCase v7
* ScriptCase v8

Other ScriptCase versions might work correctly, but were not tested.

Any problem with ScriptCase Tools in the above Scriptcases environment should be reported as a bug in our [issue tracker](https://github.com/AndersonMamede/scriptcase-tools/issues) or as a message to [mamede.anderson@gmail.com](mailto:mamede.anderson@gmail.com).

### Why?
If you often use ScriptCase to develop your applications, you've probably noticed that its development environment lacks some basic functionalities (e.g., no shortcut keys, not restoring last cursor position), while others could be improved (e.g., code editor, main menu sensitivity).

Even though some users have pointed out some of the problems on ScriptCase official forum, those improvements haven't been made yet.

This Chrome extension was created to fulfill these gaps.

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

### v0.2.1
* Fix: When code editor was not found within a page, a JS exception was thrown, caused by how the verification was made

### v0.2.0
* Disables word/line wrapping in code editor (in SC v8, line wrapping was always on)

### v0.1.0
* Changes ScriptCase's main menu default behavior from "open when hover" to "open when click"
* Makes code editor's fullscreen mode collapse both left and right columns (not possible before SC v8)
* Puts cursor and scroll back to its last position on code editor after saving/generating/running an application and when navigating through ScriptCase's pages (e.g., events, applications settings,)
* Puts cursor and scroll back to its last position on code editor when an application tab is clicked (application tab = 'Home' or your application)
* Adds shortcuts keys:
	* F1 => Show documentation (macros)
	* F2 => Save current application (same as the save button in the toolbar)
	* F7 => Give focus to code editor
	* F8 => Generate source code for current application (same as the generate source code button in the toolbar)
	* F9 => Run current application (same as the run button in the toolbar= save, generate and run)
	* F11 => Toggle code editor's fullscreen mode
