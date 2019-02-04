$(document).ready(()=>{

    const ctx = $("#myChart");
    let chart = new Chart(ctx, {
            type: "line",
            data: {},
            options: {},
        });
       
    $("#tickerGraphHistory").on("click",()=>{
        const userInput = $("#tickerInput").val();
        const userTicker = formatUserInput(userInput);
        getTickerHistory(userTicker);
    });

    function formatUserInput (userInput) {
        const removeSpaces = userInput.replace(/\s/g,'');
        const alphaNumeric = /^[a-zA-Z0-9]*$/;
        if (!alphaNumeric.test(removeSpaces)) {
            return false;
        } else {
            const formatingDone = removeSpaces.toUpperCase();
            return formatingDone;
        }
    }

    function graphTickerHistory(tickerDates, tickerPrice, tickerSymbol) {
        const data = {
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
        const options = {
            title: {
                display: true,
                position: "top",
                text: "Stock Graph",
                fontSize: 14,
                fontColor: "#111"
            }
        };

        let chart = new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        });
    }

    function tickerHistoryPromise(tickerSymbol){
        return $.ajax({ 
                    url: "https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol="
                    + tickerSymbol + "&apikey=V7X80TI0MSJ0OXK9",
                    method: "GET"
                });
    }

    function getTickerHistory(tickerSymbol){ 
        const promiseDone = $.when(tickerHistoryPromise(tickerSymbol));
        promiseDone.done((response)=>{
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
            const graphDates = [];
            for (let i = monthlyData.length-1; i >= 0; i-=12) {
                graphDates.push(monthlyData[i].date);
            }
            const graphPrice = [];
            for (let i = monthlyData.length-1; i >= 0; i-=12) {
                graphPrice.push(monthlyData[i].close);
            }
            if(graphDates.length < 1 || graphPrice.length < 1) {
                console.log("false");
            } else {
                graphTickerHistory(graphDates, graphPrice, tickerSymbol);
            }
        });
    }
    
});