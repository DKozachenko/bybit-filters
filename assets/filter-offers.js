async function getOptions() {
  return browser.storage.sync.get([
    'filterByCounterparty',
    'filterByPrice',
    'filterByBottomLimit',
    'filterByTopLimit',
    'notInFilterElemAction'
  ]);
}

async function getFilters() {
  return browser.storage.sync.get([
    'excludeCounterparty',
    'price',
    'priceSign',
    'topLimit',
    'bottomLimit'
  ]);
}

async function getConfig() {
  return Promise.all([getOptions(), getFilters()])
    .then(([options, filters]) => {
      const config = {
        filters: {},
        notInFilterElemAction: options?.notInFilterElemAction ?? 'darken'
      }

      if (Boolean(options?.filterByCounterparty && filters?.excludeCounterparty && filters?.excludeCounterparty?.length > 0)) {
        config.filters['excludeCounterparty'] = filters?.excludeCounterparty;
      }

      if (Boolean(options?.filterByPrice && filters?.price)) {
        config.filters['price'] = filters?.price;
      }

      if (Boolean(options?.filterByPrice && filters?.priceSign)) {
        config.filters['priceSign'] = filters?.priceSign;
      }

      if (Boolean(options?.filterByTopLimit && filters?.topLimit)) {
        config.filters['topLimit'] = filters?.topLimit;
      }

      if (Boolean(options?.filterByBottomLimit && filters?.bottomLimit)) {
        config.filters['bottomLimit'] = filters?.bottomLimit;
      }

      return config;
    });
}

function parseRange(valueRangeStr) {
  const [leftPart, rightPart] = valueRangeStr.split('~');

  const from = parseFloat(leftPart.replace(/\s/g,'').replace(',', '.'));
  const to = parseFloat(rightPart.replace(/\s/g,'').replace(',', '.'));

  return [from, to];
}

function handleUnsuitableElement(offerTr, config) {
  if (config.notInFilterElemAction === 'darken') {
    const button = offerTr.querySelector('.trade-list-action-button button');

    offerTr.style.background = 'repeating-linear-gradient(135deg, gray, gray 10px, white 10px, white 20px)'
    offerTr.style.pointerEvents = 'none';
    button.disabled = true;
  }

  if (config.notInFilterElemAction === 'remove') {
    offerTr.remove();
  }
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
  if (config.filters['priceSign'] === 'more') {
    if (price < config.filters['price']) {
      handleUnsuitableElement(offersTr, config);
    }
  }

  // If filter by price (less)
  if (config.filters['priceSign'] === 'less') {
    if (price > config.filters['price']) {
      handleUnsuitableElement(offersTr, config);
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
  const priceAmount = offerTr.querySelector('.price-amount').textContent;
  const priceUnit = offerTr.querySelector('.price-unit').textContent;
  const price = +priceAmount.replace(priceUnit, '').replace(',', '.');
  const valueRange = offerTr.querySelectorAll('.ql-value')[1].textContent;
  const [from, to] = parseRange(valueRange);
  const buttonText = offerTr.querySelector('.trade-list-action-button button').textContent;

  resetElementStyles(offerTr);

  // Filter inaccessible offers by default
  if (buttonText.toLowerCase() === 'недоступно') {
    handleUnsuitableElement(offerTr, config);
  }

  // If the counterparty name is included in the ignore list
  if (config.filters?.['excludeCounterparty']?.includes(stripEmojis(counterpartyName))) {
    handleUnsuitableElement(offerTr, config);
  }

  // If have both price filters
  if (config.filters?.['price'] && config.filters?.['priceSign']) {
    handlePriceFilters(offerTr, config, price);
  }

  // If bottom limit more filter value
  if (config.filters?.['topLimit'] < to) {
    handleUnsuitableElement(offerTr, config);
  }

  // If botton limit less filter value
  if (config.filters?.['bottomLimit'] > from) {
    handleUnsuitableElement(offerTr, config);
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
      console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice', 'filterByBottomLimit', 'filterByTopLimit','notInFilterElemAction',
        'excludeCounterparty', 'price', 'priceSign', 'topLimit', 'bottomLimit' из хранилища: ${err}`)
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
    childList: true,
    subtree: false,
    characterData: false,
    attributes: false,
    attributeOldValue: false,
    characterDataOldValue: false
  });

  browser.storage.sync.onChanged.addListener(filterOffers);

  dropInterval();
}

const UPDATE_TIME = 2000;
intervalId = setInterval(main, UPDATE_TIME);

