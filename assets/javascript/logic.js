$(document).ready(()=>{

    // Creat Chart.js object and render empty chart to canvas.
    const ctx = $("#chartCanvas");
    const chart = new Chart(ctx, {
            type: "line",
            data: {},
            options: {
                title: {
                    display: true,
                    position: "top",
                    text: "Stock Graph",
                    fontSize: 14,
                    fontColor: "#111"
                }
            }
        });
    
    // Get user input data from textbox and format it.
    $("#tickerGraphHistory").on("click",()=>{
        const userInput = $("#tickerInput").val();
        const userTicker = formatUserInput(userInput);
        // clear error messages
        $("#errorContainer").empty();
        getTickerHistory(userTicker);
    });

    // Format user input to remove spaces and uppercase letters.
    function formatUserInput (userInput) {
        const removeSpaces = userInput.replace(/\s/g,'');
        const formatingDone = removeSpaces.toUpperCase();
        return formatingDone;
    }

    // handle writing user friendly error messages.
    function handleErrorMessage(desiredErrorMessage) {
        const errorText = $("<div class='alert alert-danger' role='alert'> </div>").text(desiredErrorMessage);
        $("#errorContainer").append(errorText);
    }

    // Update graph object with processed API data.
    function graphTickerHistory(tickerDates, tickerPrice, tickerSymbol){
        chart.config.data.labels = tickerDates;
        chart.config.data.datasets = [{
                label: tickerSymbol,
                data: tickerPrice,
                backgroundColor: "green",
                borderColor: "lightgreen",
                fill: false,
                lineTension: 0,
                pointRadius: 5
            }];
        chart.update();
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
        // Handle error if API call fails.
        promiseDone.fail(()=>{
            handleErrorMessage("Error... There was an issue connecting to the securities data. \
            You may have to try again another time.");
        });
        // Handle successful API call.
        promiseDone.done((response)=>{
            // Handle error if API does not recognize the ticker OR if user queries too quickly for API.
            console.log(response);
            if (response["Error Message"]){
                handleErrorMessage("Error... Information for the ticker you entered is not available. \
                Please make sure the symbol is correct.");
                return;
            } else if (response["Note"]){
                handleErrorMessage("Error... Apologies you have performed too many queries at one time. \
                Our access the securities data is a bit limited. Please wait a few moments before \
                searching again");
            }
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
            // Create two new arrays that have stock closing prices for each year up to the last 20 years.
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
            graphTickerHistory(graphDates, graphPrice, tickerSymbol);             
        });
    }
    
});