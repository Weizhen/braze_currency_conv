(function() {
    let originalValues = [];
    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'SEK': 'kr'
    };

    // Create and inject the currency selection widget
    function createWidget() {
        const widget = document.createElement('div');
        widget.id = 'currency-converter-widget';
        widget.style.cssText = 'position:fixed;top:10px;right:10px;background:#fff;padding:10px;border:1px solid #ccc;z-index:9999;';
        widget.innerHTML = `
            <select id="currency-select">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SEK">SEK</option>
            </select>
        `;
        document.body.appendChild(widget);
    }

    // Function to scrape and store original USD values
    function scrapeAndStoreUSDValues() {
        const usdElements = document.querySelectorAll('#aggregate-metric-tile_revenue > section > div > div > span');
        originalValues = Array.from(usdElements).map(el => {
            const text = el.textContent.trim();
            const value = parseFloat(text.replace(/[^0-9.-]+/g, ''));
            return {
                element: el,
                value: isNaN(value) ? 0 : value,
                originalText: text
            };
        });
        console.log('Scraped and stored original USD values:', originalValues);
    }

    // Function to update displayed values
    function updateDisplayedValues(exchangeRate, currencySymbol) {
        originalValues.forEach(({element, value, originalText}) => {
            if (isNaN(value) || isNaN(exchangeRate)) {
                console.error('Invalid value or exchange rate:', value, exchangeRate);
                return; // Skip this element
            }
            const convertedValue = (value * exchangeRate).toFixed(2);
            const formattedValue = new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: currencySymbol === '$' ? 'USD' : 'EUR' // Adjust as needed
            }).format(convertedValue);
            element.textContent = formattedValue.replace(/^(\D+)/, currencySymbol);
        });
    }

    // Function to fetch exchange rates (using a free API)
    async function getExchangeRate(currency) {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        return data.rates[currency];
    }

    // Event listener for currency selection
    function setupEventListener() {
        document.getElementById('currency-select').addEventListener('change', async (event) => {
            const selectedCurrency = event.target.value;
            try {
                if (originalValues.length === 0) {
                    scrapeAndStoreUSDValues();
                }
                const exchangeRate = await getExchangeRate(selectedCurrency);
                console.log('Exchange rate:', exchangeRate);
                updateDisplayedValues(exchangeRate, currencySymbols[selectedCurrency] || selectedCurrency);
            } catch (error) {
                console.error('Error updating currency:', error);
                alert('Failed to update currency. Please try again later.');
            }
        });
    }

    // Initialize the converter
    function init() {
        if (document.getElementById('currency-converter-widget')) {
            alert('Currency converter is already active!');
            return;
        }
        createWidget();
        scrapeAndStoreUSDValues();
        setupEventListener();
    }

    init();
})();
