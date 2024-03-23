const defaultIconPath = "icons/default.png";
const loadingIconPath = "icons/loading.gif";
const successIconPath = "icons/success.png";
const errorIconPath = "icons/error.png";

async function shortenUrl(url) {
  const apiUrl = 'http://kii.su/shorten';
  const requestBody = {
    urls: [url],
    command: 'short',
    expiration: 262800,
    maxClicks: '0',
    customPrefix: 'ff',
    hashLength: 8
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  return data.shortUrls[0].shortUrl;
}

async function copyShortUrlToClipboard(tab) {
  const currentUrl = tab.url;
  const shortUrl = await shortenUrl(currentUrl);
  const fullShortUrl = `http://kii.su/${shortUrl}`;
  navigator.clipboard.writeText(fullShortUrl);
  return fullShortUrl;
}

function resetIcon() {
  browser.browserAction.setIcon({ path: defaultIconPath });
}

browser.browserAction.onClicked.addListener(async (tab) => {
  browser.browserAction.setIcon({ path: loadingIconPath });

  try {
    const shortUrl = await copyShortUrlToClipboard(tab);
    browser.browserAction.setIcon({ path: successIconPath });
    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL(successIconPath),
      title: "URL Shortened",
      message: `Shortened URL copied to clipboard: ${shortUrl}`
    });
    setTimeout(resetIcon, 2000);
  } catch (error) {
    browser.browserAction.setIcon({ path: errorIconPath });
    browser.notifications.create({
      type: "basic",
      iconUrl: browser.runtime.getURL(errorIconPath),
      title: "Error Shortening URL",
      message: "An error occurred while shortening the URL."
    });
    setTimeout(resetIcon, 2000);
    console.error("Error shortening URL:", error);
  }
});

browser.tabs.onActivated.addListener(resetIcon);