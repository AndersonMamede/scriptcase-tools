# Scriptcase Tools
A Chrome extension to make working with Scriptcase simplier and more productive.

### Why?
If you often use Scriptcase to develop your applications, you've probably noticed that its development environment lacks some basic functionalities (e.g., shortcut keys), while others could be improved (e.g., code editor).

Even though some users pointed out some of the problems on Scriptcase official forum, those improvements were not made.

This Chrome extension was created to fulfill these gaps.

### How does it work?
Because Scriptcase doesn't provide a public API, hacking into its JavaScript/HTML/CSS code was the (only) way to go. And because of that, this extension heavily depends on Scriptcase's code and structure (e.g., specifics JavaScript functions, the DOM structure, some elements with specific ID/class name).

## Installation

### Quick Installation
Go to [Chrome Web Store](https://chrome.google.com/webstore) to install the release version.

### Manual Installation (latest/development version)
1. Download this source code (https://github.com/AndersonMamede/scriptcase-tools)
2. Unzip the file
3. Navigate to **chrome://extensions**
4. Ensure the checkbox labeled **Developer mode** is enabled
5. Click "**Load unpacked extension...**" and select the (unzipped) source code folder

## Compatibility
Because of the difficulty of testing under different versions (licenses/$$), currently it is tested only under Scriptcase 7.

## Authors
* [Anderson Mamede](https://github.com/AndersonMamede)

## Legal and License
This project is not affiliated with, sponsored by, or endorsed by Netmake Soluções em Informática.

Licensed under the MIT License. Please see [LICENSE](LICENSE) for more information.

## Features

### v0.1
* Changes Scriptcase's main menu default behavior from "open when hover" to "open when click"
* Makes code editor's fullscreen mode collapse both left and right columns
* Puts cursor and scroll back to its last position on code editor after saving/generating/running an application and when navigating through Scriptcase's left menu (events, applications settings, etc)
* Adds shortcuts keys:
	* F2 => Save current application (same as the save button in the toolbar)
	* F7 => Put focus on code editor
	* F8 => Generate source code for current application (same as the generate source code button in the toolbar)
	* F9 => Run current application (same as the run button in the toolbar= save, generate and run)
	* F11 => Toggle code editor's fullscreen mode
