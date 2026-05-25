// Background service worker for Lumio extension.
// Handles installation and icon badge updates.

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lumio Quick Add extension installed.');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version });
  }
  return true;
});
