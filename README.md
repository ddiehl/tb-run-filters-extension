# Run Filters on Current Folder

A [Thunderbird](https://www.thunderbird.net/) mail extension that adds a toolbar button to run message filters on the currently displayed folder.

## The Problem

Thunderbird's built-in "Run Filters on Folder" command is buried in the **Tools** menu and requires you to navigate a submenu. There's no quick way to trigger it for the folder you're already looking at.

## The Solution

This extension adds a **"Run Filters"** button to the Thunderbird toolbar. One click runs all enabled manual message filters on whichever folder is currently open.

## Features

- Single-click toolbar button to run filters on the active folder
- Only runs filters that are both **enabled** and set to **Manual** type
- Works with IMAP, POP3, and local folders
- Respects your existing filter logging settings

## Installation

1. Download or clone this repository
2. Open Thunderbird
3. Go to **Tools → Add-on Manager**
4. Click the gear icon and select **Install Add-on From File...**
5. Select the extension folder (or a packaged `.xpi` file)

## Usage

Click the **Run Filters** button in the Thunderbird toolbar while viewing any mail folder. The extension will run all your enabled manual filters against that folder.

## Requirements

- Thunderbird 128.0 or later

## Permissions

- `accountsRead` — needed to identify the currently displayed folder and its account
- `messagesRead` — needed to access folder information

## Project Structure

```
run-filters-extension/
├── manifest.json                        # Extension manifest
├── background.js                        # Toolbar button click handler
├── icons/
│   └── icon.svg                         # Toolbar button icon
└── experiment/
    └── RunFilters/
        ├── schema.json                  # Experimental API schema
        └── implementation.js            # Thunderbird-internal filter runner
```

The extension uses a [WebExtension Experiment](https://webextension-api.thunderbird.net/en/latest/how-to/experiments.html) (`experiment/RunFilters/`) to access Thunderbird's internal `MailServices` APIs, which are not exposed through the standard WebExtension API surface.

## License

MIT
