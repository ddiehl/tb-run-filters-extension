"use strict";

messenger.browserAction.onClicked.addListener(async () => {
  // Get the currently active mail tab
  const tabs = await messenger.mailTabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tabs.length) {
    console.warn("Run Filters: No active mail tab found.");
    return;
  }

  const tab = tabs[0];

  // displayedFolder requires the "accountsRead" permission
  if (!tab.displayedFolder) {
    console.warn("Run Filters: No folder is currently displayed.");
    return;
  }

  const { accountId, path } = tab.displayedFolder;

  try {
    await messenger.RunFilters.runOnFolder(accountId, path);
    console.log(
      `Run Filters: Completed for "${path}" on account "${accountId}".`
    );
  } catch (err) {
    console.error("Run Filters: Failed to run filters.", err);
  }
});
