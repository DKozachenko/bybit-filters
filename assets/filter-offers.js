function parseRange(valueRangeStr) {
  const [leftPart, rightPart] = valueRangeStr.split('~');

  const from = parseFloat(leftPart.replace(/\s/g,'').replace(',', '.'));
  const to = parseFloat(rightPart.replace(/\s/g,'').replace(',', '.'));

  return [from, to];
}

function onLoadingPage() {
  const loginSpan = document.querySelector('.header-login');

  if (loginSpan) {
    return;
  }

  const tradesList = document.querySelector('.trade-list__content table');

  if (!tradesList) {
    return;
  }

  const offersTr = tradesList.querySelectorAll('.trade-table__tbody tr');
  offersTr.forEach(offerTr => {
    const advetiserName = offerTr.querySelector('.advertiser-name').textContent;
    const priceAmount = offerTr.querySelector('.price-amount').textContent;
    const priceUnit = offerTr.querySelector('.price-unit').textContent;
    const price = +priceAmount.replace(priceUnit, '').replace(',', '.');
    const valueRange = offerTr.querySelectorAll('.ql-value')[1].textContent;
    const [from, to] = parseRange(valueRange);

    console.warn(advetiserName, price, from, to);
  });
}


setInterval(onLoadingPage, 5000)


