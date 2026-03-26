"use strict";

var { ExtensionCommon } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionCommon.sys.mjs"
);
var { MailServices } = ChromeUtils.importESModule(
  "resource:///modules/MailServices.sys.mjs"
);

var RunFilters = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      RunFilters: {
        async runOnFolder(accountId, path) {
          // Step 1: Resolve account
          const account = MailServices.accounts.getAccount(accountId);
          if (!account) {
            throw new ExtensionCommon.ExtensionError(
              `No account found for accountId: ${accountId}`
            );
          }

          // Step 2: Construct folder URI from accountId + path
          // Mirrors folderPathToURI logic in ExtensionAccounts.sys.mjs.
          const server = account.incomingServer;
          const rootURI = server.rootFolder.URI;

          let folderURI;
          if (path === "/") {
            folderURI = rootURI;
          } else if (server.type === "imap") {
            // IMAP folder names must NOT be percent-encoded.
            folderURI = rootURI + path;
          } else {
            // Local, POP3, etc. need percent-encoding per segment.
            folderURI =
              rootURI +
              path
                .split("/")
                .map(segment =>
                  encodeURIComponent(segment)
                    .replace(/[~!'()*]/g, c => "%" + c.charCodeAt(0).toString(16))
                    .replaceAll("%2B", "+")
                )
                .join("/");
          }

          // Step 3: Resolve URI to nsIMsgFolder
          const nsFolder =
            MailServices.folderLookup.getFolderForURL(folderURI);
          if (!nsFolder) {
            throw new ExtensionCommon.ExtensionError(
              `Could not find folder for URI: ${folderURI}`
            );
          }

          // Step 4: Get server filter list
          const filterList = nsFolder.server.getFilterList(null);
          if (!filterList || filterList.filterCount === 0) {
            return;
          }

          // Step 5: Build temp list of only enabled manual filters.
          // Mirrors Thunderbird's cmd_applyFilters in mailCommon.js.
          const tempFilterList =
            MailServices.filters.getTempFilterList(nsFolder);
          tempFilterList.loggingEnabled = filterList.loggingEnabled;
          tempFilterList.logStream = filterList.logStream;

          let insertIndex = 0;
          for (let i = 0; i < filterList.filterCount; i++) {
            const filter = filterList.getFilterAt(i);
            if (
              filter.enabled &&
              !filter.temporary &&
              filter.filterType & Ci.nsMsgFilterType.Manual
            ) {
              tempFilterList.insertFilterAt(insertIndex, filter);
              insertIndex++;
            }
          }

          if (insertIndex === 0) {
            // No enabled manual filters to run.
            return;
          }

          // Step 6: Create a throwaway nsIMsgWindow and apply filters
          const msgWindow = Cc[
            "@mozilla.org/messenger/msgwindow;1"
          ].createInstance(Ci.nsIMsgWindow);

          MailServices.filters.applyFiltersToFolders(
            tempFilterList,
            [nsFolder],
            msgWindow
          );
        },
      },
    };
  }
};
