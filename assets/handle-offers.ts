import { Filters, FiltersKeys, Options, OptionsKeys, PriceSign } from '../src/app/types';

async function getOptions(): Promise<Partial<Options>> {
  return browser.storage.sync.get([
    OptionsKeys.FILTER_BY_COUNTERPARTY,
    OptionsKeys.FILTER_BY_PRICE,
    OptionsKeys.FILTER_BY_AMOUNT,
  ]);
}

async function getFilters(): Promise<Partial<Filters>> {
  return browser.storage.sync.get([
    FiltersKeys.FAVORITE_COUNTERPARTY,
    FiltersKeys.EXCLUDE_COUNTERPARTY,
    FiltersKeys.PRICE,
    FiltersKeys.PRICE_SIGN,
    FiltersKeys.AMOUNT_MIN,
    FiltersKeys.AMOUNT_MAX,
  ]);
}

async function getConfig() {
  return Promise.all([getOptions(), getFilters()])
    .then(([options, filters]) => {
      const filtersConfig: Partial<Filters> = {};

      if (Boolean(options?.[OptionsKeys.FILTER_BY_COUNTERPARTY] &&
        filters?.[FiltersKeys.FAVORITE_COUNTERPARTY] &&
        filters?.[FiltersKeys.FAVORITE_COUNTERPARTY]?.length > 0))
      {
        filtersConfig[FiltersKeys.FAVORITE_COUNTERPARTY] = filters[FiltersKeys.FAVORITE_COUNTERPARTY];
      }

      if (Boolean(options?.[OptionsKeys.FILTER_BY_COUNTERPARTY] &&
        filters?.[FiltersKeys.EXCLUDE_COUNTERPARTY] &&
        filters?.[FiltersKeys.EXCLUDE_COUNTERPARTY]?.length > 0))
      {
        filtersConfig[FiltersKeys.EXCLUDE_COUNTERPARTY] = filters[FiltersKeys.EXCLUDE_COUNTERPARTY];
      }

      if (Boolean(options?.[OptionsKeys.FILTER_BY_PRICE] && filters?.[FiltersKeys.PRICE])) {
        filtersConfig[FiltersKeys.PRICE] = filters[FiltersKeys.PRICE];
      }

      if (Boolean(options?.[OptionsKeys.FILTER_BY_PRICE] && filters?.[FiltersKeys.PRICE_SIGN])) {
        filtersConfig[FiltersKeys.PRICE_SIGN] = filters[FiltersKeys.PRICE_SIGN];
      }

      if (Boolean(options?.[OptionsKeys.FILTER_BY_AMOUNT] && filters?.[FiltersKeys.AMOUNT_MIN])) {
        filtersConfig[FiltersKeys.AMOUNT_MIN] = filters[FiltersKeys.AMOUNT_MIN];
      }

      if (Boolean(options?.[OptionsKeys.FILTER_BY_AMOUNT] && filters?.[FiltersKeys.AMOUNT_MAX])) {
        filtersConfig[FiltersKeys.AMOUNT_MAX] = filters[FiltersKeys.AMOUNT_MAX];
      }

      return filtersConfig;
    });
}

function parseRange(valueRangeStr: string) {
  const [leftPart, rightPart] = valueRangeStr.split('~');

  const from = parseFloat(leftPart.replace(/\s/g,'').replace(',', '.'));
  const to = parseFloat(rightPart.replace(/\s/g,'').replace(',', '.'));

  return [from, to];
}

function handleUnsuitableElement(offerTr: HTMLElement) {
  const button = offerTr.querySelector<HTMLButtonElement>('.trade-list-action-button button');

  offerTr.style.background = 'repeating-linear-gradient(135deg, gray, gray 10px, white 10px, white 20px)';
  offerTr.style.pointerEvents = 'none';

  if (!button) {
    return;
  }
  button.disabled = true;
}

function highlightElement(offerTr: HTMLElement) {
  offerTr.style.background = '#d3ffd3';
}

function resetElementStyles(offerTr: HTMLElement) {
  const button = offerTr.querySelector<HTMLButtonElement>('.trade-list-action-button button');
  const buttonText = button?.textContent;

  offerTr.style.background = 'initial';
  offerTr.style.pointerEvents = 'auto';

  if (buttonText?.toLowerCase() !== 'недоступно' && button) {
    button.disabled = false;
  }
}

function handlePriceFilters(offersTr: HTMLElement, config: Partial<Filters>, price: number) {
  // If filter by price (more)
  if (config[FiltersKeys.PRICE_SIGN] === PriceSign.More && config[FiltersKeys.PRICE]) {
    if (price < config[FiltersKeys.PRICE]) {
      handleUnsuitableElement(offersTr);
    }
  }

  // If filter by price (less)
  if (config[FiltersKeys.PRICE_SIGN] === PriceSign.Less && config[FiltersKeys.PRICE]) {
    if (price > config[FiltersKeys.PRICE]) {
      handleUnsuitableElement(offersTr);
    }
  }
}

// https://edvins.io/how-to-strip-emojis-from-string-in-java-script
function stripEmojis(str: string) {
  return str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function handleOffer(offerTr: HTMLElement, config: Partial<Filters>) {
  const counterpartyName = offerTr?.querySelector<HTMLElement>('.advertiser-name')?.textContent;
  const counterpartyNameWithoutEmojis = stripEmojis(counterpartyName ?? '');
  const priceAmount = offerTr?.querySelector<HTMLElement>('.price-amount')?.textContent;
  const priceUnit = offerTr?.querySelector<HTMLElement>('.price-unit')?.textContent;
  const price = +(priceAmount?.replace(priceUnit ?? '', '').replace(',', '.') ?? '0');
  const valueRange = offerTr.querySelectorAll<HTMLElement>('.ql-value')[1].textContent;
  const [from, to] = parseRange(valueRange ?? '');
  const buttonText = offerTr?.querySelector<HTMLButtonElement>('.trade-list-action-button button')?.textContent;

  resetElementStyles(offerTr);

  // Filter inaccessible offers by default
  if (buttonText?.toLowerCase() === 'недоступно') {
    handleUnsuitableElement(offerTr);
  }

  // If the counterparty name is included in the favorite list
  if (config?.[FiltersKeys.FAVORITE_COUNTERPARTY]?.includes(counterpartyNameWithoutEmojis)) {
    highlightElement(offerTr);
  }

  // If the counterparty name is included in the ignore list
  if (config?.[FiltersKeys.EXCLUDE_COUNTERPARTY]?.includes(counterpartyNameWithoutEmojis)) {
    handleUnsuitableElement(offerTr);
  }

  // If have both price filters
  if (config?.[FiltersKeys.PRICE] && config?.[FiltersKeys.PRICE_SIGN]) {
    handlePriceFilters(offerTr, config, price);
  }

  // If amount min more filter value
  if (config?.[FiltersKeys.AMOUNT_MIN] && config?.[FiltersKeys.AMOUNT_MIN] > to) {
    handleUnsuitableElement(offerTr);
  }

  // If amount max less filter value
  if (config?.[FiltersKeys.AMOUNT_MAX] && config?.[FiltersKeys.AMOUNT_MAX] < from) {
    handleUnsuitableElement(offerTr);
  }
}

function filterOffers() {
  getConfig()
    .then(config => {
      // Have to reget elements each time
      const tradesList = document.querySelector<HTMLTableElement>('.trade-list__content table');
      const offersTr = tradesList?.querySelectorAll<HTMLElement>('.trade-table__tbody tr');
      offersTr?.forEach(offerTr => handleOffer(offerTr, config))
    })
    .catch(err => {
      console.error(`Ошибка при получении ключей '${OptionsKeys.FILTER_BY_COUNTERPARTY}', '${OptionsKeys.FILTER_BY_PRICE}', '${OptionsKeys.FILTER_BY_AMOUNT}',
        '${FiltersKeys.FAVORITE_COUNTERPARTY}', '${FiltersKeys.EXCLUDE_COUNTERPARTY}', '${FiltersKeys.PRICE}',
        '${FiltersKeys.PRICE_SIGN}', '${FiltersKeys.AMOUNT_MIN}', '${FiltersKeys.AMOUNT_MAX}' из хранилища: ${err}`)
    });
}

let intervalId: NodeJS.Timeout | null = null;

function dropInterval() {
  if (!intervalId) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
}

function main() {
  const loginSpan = document.querySelector<HTMLElement>('.header-login');

  if (loginSpan) {
    return;
  }

  const tradesList = document.querySelector<HTMLTableElement>('.trade-list__content table');
  if (!tradesList) {
    return;
  }

  const tbody = tradesList.querySelector<HTMLElement>('.trade-table__tbody');

  if (!tbody) {
    return;
  }

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

