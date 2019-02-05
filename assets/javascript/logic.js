$(document).ready(()=>{

    // Creat Chart.js object and render empty chart to canvas.
    const ctx = $("#myChart");
    let chart = new Chart(ctx, {
            type: "line",
            data: {},
            options: {},
        });
    
    // Get user input data and run API call and graph data.    
    $("#tickerGraphHistory").on("click",()=>{
        const userInput = $("#tickerInput").val();
        const userTicker = formatUserInput(userInput);
        getTickerHistory(userTicker);
    });

    // format user input to remove spaces and make sure there are no junk characters. 
    function formatUserInput (userInput) {
        const alphaNumeric = /^[a-zA-Z0-9]*$/;
        const removeSpaces = userInput.replace(/\s/g,'');
        if (!alphaNumeric.test(removeSpaces)) {
            return false;
        } else {
            const formatingDone = removeSpaces.toUpperCase();
            return formatingDone;
        }
    }

    // Graph API data.
    function graphTickerHistory(tickerDates, tickerPrice, tickerSymbol){
        let data = {
            labels: tickerDates,
            datasets: [
                {
                    label: tickerSymbol,
                    data: tickerPrice,
                    backgroundColor: "green",
                    borderColor: "lightgreen",
                    fill: false,
                    lineTension: 0,
                    pointRadius: 5
                }
            ]
        };
        let options = {
            title: {
                display: true,
                position: "top",
                text: "Stock Graph",
                fontSize: 14,
                fontColor: "#111"
            }
        };

        // Input new data into chart object.
        let chart = new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        });
    }

    // API call to AlphaVantage. 
    function tickerHistoryPromise(tickerSymbol){
        return $.ajax({ 
                    url: "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol="
                    + tickerSymbol + "&apikey=V7X80TI0MSJ0OXK9",
                    method: "GET"
                });
    }

    function getTickerHistory(tickerSymbol){ 
        // Make sure all promised data from tickerHistoryPromise API call was returned. 
        const promiseDone = $.when(tickerHistoryPromise(tickerSymbol));
        promiseDone.done((response)=>{
            // Parse through returned AlphaVantage Object and push relevent data into an array so it is useable. 
            const monthlyData = [];
            const monthlyClosePrice = response["Monthly Time Series"];
            for (let dates in monthlyClosePrice) {
                if (monthlyClosePrice.hasOwnProperty(dates)) {
                    let close = parseFloat(monthlyClosePrice[dates]["4. close"]);
                    monthlyData.push({
                        date: dates,
                        close: close
                    });
                }
            }
            // Create 2 new arrays that have stock closing prices for each year up to the last 20 years.
            // Also make sure data is in the correct order.
            const graphDates = [];
            for (let i = monthlyData.length-1; i >= 0; i-=12){
                graphDates.push(monthlyData[i].date);
            }
            const graphPrice = [];
            for (let i = monthlyData.length-1; i >= 0; i-=12){
                graphPrice.push(monthlyData[i].close);
            }
            // Make sure that the latest closing data is included in the graphDates and graphPrices arrays.
            if (graphDates[graphDates.length-1] !== monthlyData[0].date
                && graphPrice[graphPrice.length-1] !== monthlyData[0].close) {
                    graphDates.push(monthlyData[0].date);
                    graphPrice.push(monthlyData[0].close);
                }
            // Check to make sure that data is valid before graphing.
            if(graphDates.length < 2 || graphPrice.length < 2) {
                console.log("false");
            } else {
                graphTickerHistory(graphDates, graphPrice, tickerSymbol);
            }            
        });
    }
    
});