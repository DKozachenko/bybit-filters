async function getOptions() {
  return browser.storage.sync.get([
    'filterByCounterparty',
    'filterByPrice',
    'filterByAmount',
  ]);
}

async function getFilters() {
  return browser.storage.sync.get([
    'favoriteCounterparty',
    'excludeCounterparty',
    'price',
    'priceSign',
    'amountMin',
    'amountMax'
  ]);
}

async function getConfig() {
  return Promise.all([getOptions(), getFilters()])
    .then(([options, filters]) => {
      const filtersConfig = {};

      if (Boolean(options?.filterByCounterparty && filters?.favoriteCounterparty && filters?.favoriteCounterparty?.length > 0)) {
        filtersConfig['favoriteCounterparty'] = filters.favoriteCounterparty;
      }

      if (Boolean(options?.filterByCounterparty && filters?.excludeCounterparty && filters?.excludeCounterparty?.length > 0)) {
        filtersConfig['excludeCounterparty'] = filters.excludeCounterparty;
      }

      if (Boolean(options?.filterByPrice && filters?.price)) {
        filtersConfig['price'] = filters.price;
      }

      if (Boolean(options?.filterByPrice && filters?.priceSign)) {
        filtersConfig['priceSign'] = filters.priceSign;
      }

      if (Boolean(options?.filterByAmount && filters?.amountMin)) {
        filtersConfig['amountMin'] = filters.amountMin;
      }

      if (Boolean(options?.filterByAmount && filters?.amountMax)) {
        filtersConfig['amountMax'] = filters.amountMax;
      }

      return filtersConfig;
    });
}

function parseRange(valueRangeStr) {
  const [leftPart, rightPart] = valueRangeStr.split('~');

  const from = parseFloat(leftPart.replace(/\s/g,'').replace(',', '.'));
  const to = parseFloat(rightPart.replace(/\s/g,'').replace(',', '.'));

  return [from, to];
}

function handleUnsuitableElement(offerTr) {
  const button = offerTr.querySelector('.trade-list-action-button button');

  offerTr.style.background = 'repeating-linear-gradient(135deg, gray, gray 10px, white 10px, white 20px)';
  offerTr.style.pointerEvents = 'none';
  button.disabled = true;
}

function highlightElement(offerTr) {
  offerTr.style.background = '#d3ffd3';
}

function resetElementStyles(offerTr) {
  const button = offerTr.querySelector('.trade-list-action-button button');
  const buttonText = button.textContent;

  offerTr.style.background = 'initial';
  offerTr.style.pointerEvents = 'auto';

  if (buttonText.toLowerCase() !== 'недоступно') {
    button.disabled = false;
  }
}

function handlePriceFilters(offersTr, config, price) {
  // If filter by price (more)
  if (config['priceSign'] === 'more') {
    if (price < config['price']) {
      handleUnsuitableElement(offersTr);
    }
  }

  // If filter by price (less)
  if (config['priceSign'] === 'less') {
    if (price > config['price']) {
      handleUnsuitableElement(offersTr);
    }
  }
}

// https://edvins.io/how-to-strip-emojis-from-string-in-java-script
function stripEmojis(str) {
  return str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function handleOffer(offerTr, config) {
  const counterpartyName = offerTr.querySelector('.advertiser-name').textContent;
  const counterpartyNameWithoutEmojis = stripEmojis(counterpartyName);
  const priceAmount = offerTr.querySelector('.price-amount').textContent;
  const priceUnit = offerTr.querySelector('.price-unit').textContent;
  const price = +priceAmount.replace(priceUnit, '').replace(',', '.');
  const valueRange = offerTr.querySelectorAll('.ql-value')[1].textContent;
  const [from, to] = parseRange(valueRange);
  const buttonText = offerTr.querySelector('.trade-list-action-button button').textContent;

  resetElementStyles(offerTr);

  // Filter inaccessible offers by default
  if (buttonText.toLowerCase() === 'недоступно') {
    handleUnsuitableElement(offerTr);
  }

  // If the counterparty name is included in the favorite list
  if (config?.['favoriteCounterparty']?.includes(counterpartyNameWithoutEmojis)) {
    highlightElement(offerTr);
  }

  // If the counterparty name is included in the ignore list
  if (config?.['excludeCounterparty']?.includes(counterpartyNameWithoutEmojis)) {
    handleUnsuitableElement(offerTr);
  }

  // If have both price filters
  if (config?.['price'] && config?.['priceSign']) {
    handlePriceFilters(offerTr, config, price);
  }

  // If amount min more filter value
  if (config?.['amountMin'] > to) {
    handleUnsuitableElement(offerTr);
  }

  // If amount max less filter value
  if (config?.['amountMax'] < from) {
    handleUnsuitableElement(offerTr);
  }
}

function filterOffers() {
  getConfig()
    .then(config => {
      // Have to reget elements each time
      const tradesList = document.querySelector('.trade-list__content table');
      const offersTr = tradesList.querySelectorAll('.trade-table__tbody tr');
      offersTr.forEach(offerTr => handleOffer(offerTr, config))
    })
    .catch(err => {
      console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice', 'filterByAmount',
        'favoriteCounterparty', 'excludeCounterparty', 'price', 'priceSign', 'amountMin', 'amountMax' из хранилища: ${err}`)
    });
}

let intervalId = null;

function dropInterval() {
  clearInterval(intervalId);
  intervalId = null;
}

function main() {
  const loginSpan = document.querySelector('.header-login');

  if (loginSpan) {
    return;
  }

  const tradesList = document.querySelector('.trade-list__content table');
  if (!tradesList) {
    return;
  }

  const tbody = tradesList.querySelector('.trade-table__tbody');

  const observer = new MutationObserver(filterOffers);

  observer.observe(tbody, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: false,
    attributeOldValue: false,
    characterDataOldValue: false
  });

  browser.storage.sync.onChanged.addListener(filterOffers);

  dropInterval();
}

const UPDATE_TIME = 2000;
intervalId = setInterval(main, UPDATE_TIME);

