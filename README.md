# Bybit Filters

[Firefox extension](https://addons.mozilla.org/en-US/firefox/extensions/) for filtering P2P offers on [Bybit](https://www.bybit.com/ru-RU/fiat/trade/otc/buy/USDT/RUB) written with [Angular](https://angular.dev/).

### Run as SPA in browser

```bash
npm ci
npm run start
```

### Run as extension

```bash
npm ci
npm run build
```

[Install](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing) as custom extension using path `./dist/bybit-filters/browser`.

### References

- https://habr.com/ru/articles/851234/
- https://habr.com/ru/articles/858078/

### CHANGELOG

#### [1.0.0] - 09.02.2025

### Added

- Main functional of filtering
- Options component for extension options
- Popup component for showing popup on extension icon

#### [1.1.0] - 09.02.2025

### Changed

- Default values for form in popup component are `null`
- `setInterval` in content script (`filter-offers.js`) each 3s to `MutationObserver` on table tr elements

#### [1.2.0] - 11.02.2025

### Added

- Filter inaccessible offers by default
- CSS background strips for unsuitable elements
- Disabling button for unsuitable elements
- Remove emodjis from counterparty name for better checking 

#### [1.3.0] - 11.02.2025

### Added

- Highlight for favorite counterparties

