const buyDetails = {
    currencyCode: 'usd',
    value: 0
};

const sellDetails = {
    currencyCode: 'rub',
    value: 0
};

let isSellToBuy = true;
let isConnected = true;

const buyTabBtns = document.querySelectorAll('.buy .currency-tabs li');
const sellTabBtns = document.querySelectorAll('.sell .currency-tabs li');

const buyCurrencyInput = document.querySelector('.buy .conversion-result input');
const sellCurrencyInput = document.querySelector('.sell .conversion-result input');

const buyCurrencyInfo = document.querySelector('.buy .conversion-result p');
const sellCurrencyInfo = document.querySelector('.sell .conversion-result p');

const errorMessage = document.querySelector('.error-message');

function updateCurrencyRates() {
    buyCurrencyInfo.textContent = `1 ${buyDetails.currencyCode.toUpperCase()} = ${Math.round(buyDetails.value * 10000) / 10000} ${sellDetails.currencyCode.toUpperCase()}`;
    sellCurrencyInfo.textContent = `1 ${sellDetails.currencyCode.toUpperCase()} = ${Math.round(sellDetails.value * 10000) / 10000} ${buyDetails.currencyCode.toUpperCase()}`;
}

async function fetchCurrencyRate(fromCurrency, toCurrency) {
    try {
        const apiEndpoint = `https://latest.currency-api.pages.dev/v1/currencies/${fromCurrency}.json`;
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        errorMessage.textContent = '';
        return data[fromCurrency][toCurrency];
    } catch (err) {
        errorMessage.textContent = 'Network Error';
        return null;
    }
}

function updateConversion() {
    if (isSellToBuy) {
        buyCurrencyInput.value = Math.round(sellCurrencyInput.value * sellDetails.value * 10000) / 10000;
    } else {
        sellCurrencyInput.value = Math.round(buyCurrencyInput.value * buyDetails.value * 10000) / 10000;
    }
}

buyTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        buyTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const selectedCurrency = btn.getAttribute('data-currency');
        buyDetails.currencyCode = selectedCurrency;

        if (isConnected) {
            const currentActiveSellTab = Array.from(sellTabBtns).find((tab) => tab.classList.contains('active'));
            const selectedSellCurrency = currentActiveSellTab.getAttribute('data-currency');
            if (selectedCurrency === selectedSellCurrency) {
                buyDetails.value = 1;
                sellDetails.value = 1;
                updateConversion();
                updateCurrencyRates();
            } else {
                fetchCurrencyRate(selectedCurrency, selectedSellCurrency).then(rate => {
                    if (rate) {
                        buyDetails.value = rate;
                        sellDetails.value = 1 / rate;
                        updateConversion();
                        updateCurrencyRates();
                    }
                });
            }
        }
    });
});

sellTabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        sellTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const selectedCurrency = btn.getAttribute('data-currency');
        sellDetails.currencyCode = selectedCurrency;

        if (isConnected) {
            const currentActiveBuyTab = Array.from(buyTabBtns).find((tab) => tab.classList.contains('active'));
            const selectedBuyCurrency = currentActiveBuyTab.getAttribute('data-currency');
            if (selectedCurrency === selectedBuyCurrency) {
                buyDetails.value = 1;
                sellDetails.value = 1;
                updateConversion();
                updateCurrencyRates();
            } else {
                fetchCurrencyRate(selectedCurrency, selectedBuyCurrency).then(rate => {
                    if (rate) {
                        sellDetails.value = rate;
                        buyDetails.value = 1 / rate;
                        updateConversion();
                        updateCurrencyRates();
                    }
                });
            }
        }
    });
});

const numericPattern = /^[0-9]*\.?[0-9]*$/;

buyCurrencyInput.addEventListener('input', () => {
    buyCurrencyInput.value = buyCurrencyInput.value.replace(/,/g, '.');

    if (!numericPattern.test(buyCurrencyInput.value)) {
        buyCurrencyInput.value = buyCurrencyInput.value.slice(0, -1);
        return;
    }

    isSellToBuy = false;
    updateConversion();
});

sellCurrencyInput.addEventListener('input', () => {
    sellCurrencyInput.value = sellCurrencyInput.value.replace(/,/g, '.');

    if (!numericPattern.test(sellCurrencyInput.value)) {
        sellCurrencyInput.value = sellCurrencyInput.value.slice(0, -1);
        return;
    }

    isSellToBuy = true;
    updateConversion();
});

window.addEventListener('online', () => {
    errorMessage.textContent = '';
    isConnected = true;
});

window.addEventListener('offline', () => {
    errorMessage.textContent = 'No internet connection';
    isConnected = false;
});

function initializeConverter() {
    if (isConnected) {
        fetchCurrencyRate(sellDetails.currencyCode, buyDetails.currencyCode).then(rate => {
            if (rate) {
                sellDetails.value = rate;
                buyDetails.value = 1 / rate;
                sellCurrencyInput.value = 5000;
                updateConversion();
                updateCurrencyRates();
            }
        });
    }
}

initializeConverter();
