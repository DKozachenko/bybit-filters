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
        filters: [],
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

      if (Boolean(options?.bottomLimit && filters?.bottomLimit)) {
        config.filters['bottomLimit'] = filters?.bottomLimit;
      }

      return config;
    });
}

/**
 *
 * Config {
 *  filters: Filter[],
 *  notInFilterElemAction: string
 * }
 *
 * Filter {
 *   filterName: string,
 *   filterValue: any,
 *   hasToBeApplied: boolean
 * }
 *
 */

function parseRange(valueRangeStr) {
  const [leftPart, rightPart] = valueRangeStr.split('~');

  const from = parseFloat(leftPart.replace(/\s/g,'').replace(',', '.'));
  const to = parseFloat(rightPart.replace(/\s/g,'').replace(',', '.'));

  return [from, to];
}

function handleNotInFilterElement(offersTr, config) {
  if (config.notInFilterElemAction === 'darken') {
    offersTr.style.backgroundColor = 'gray';
  }

  if (config.notInFilterElemAction === 'remove') {
    offersTr.remove();
  }
}

function handlePriceFilters(offersTr, config, price) {
  // Если фильтрация по цене (больше)
  if (config.filters['priceSign'] === 'more') {
    if (price < config.filters['price']) {
      handleNotInFilterElement(offersTr, config);
    }
  }

  // Если фильтрация по цене (меньше)
  if (config.filters['priceSign'] === 'less') {
    if (price > config.filters['price']) {
      handleNotInFilterElement(offersTr, config);
    }
  }
}

function handleOffer(offerTr, config) {
  const advetiserName = offerTr.querySelector('.advertiser-name').textContent;
  const priceAmount = offerTr.querySelector('.price-amount').textContent;
  const priceUnit = offerTr.querySelector('.price-unit').textContent;
  const price = +priceAmount.replace(priceUnit, '').replace(',', '.');
  const valueRange = offerTr.querySelectorAll('.ql-value')[1].textContent;
  const [from, to] = parseRange(valueRange);

  console.warn(advetiserName, price, from, to);

  // Если имя контрагента, входит в список игнорируемых
  if (config.filters?.['excludeCounterparty']?.includes(advetiserName)) {
    handleNotInFilterElement(offerTr, config);
  }

  if (config.filters?.['price'] && config.filters?.['priceSign']) {
    handlePriceFilters(offerTr, config, price);
  }

  // Если верхний лимит больше фильтра
  if (config.filters?.['topLimit'] < to) {
    handleNotInFilterElement(offerTr, config);
  }

  // Если нижний лимит меньше фильтра
  if (config.filters?.['bottomLimit'] > from) {
    handleNotInFilterElement(offerTr, config);
  }
}

function filterOffers() {
  const loginSpan = document.querySelector('.header-login');

  if (loginSpan) {
    return;
  }

  const tradesList = document.querySelector('.trade-list__content table');

  if (!tradesList) {
    return;
  }

  getConfig()
    .then(config => {
      const offersTr = tradesList.querySelectorAll('.trade-table__tbody tr');
      offersTr.forEach(offerTr => handleOffer(offerTr, config));
    })
    .catch(err => {
      console.error(`Ошибка при получении ключей 'filterByCounterparty', 'filterByPrice', 'filterByBottomLimit', 'filterByTopLimit','notInFilterElemAction',
        'excludeCounterparty', 'price', 'priceSign', 'topLimit', 'bottomLimit' из хранилища: ${err}`)
    });
}

const UPDATE_TIME = 3000;

browser.storage.sync.onChanged.addListener(filterOffers);
setInterval(filterOffers, UPDATE_TIME)


