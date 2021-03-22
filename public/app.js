
(async function Boot(window) {
    var urlParams;
    (window.onpopstate = function () {
        var match,
            pl = /\+/g, // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);

        urlParams = {};
        while ((match = search.exec(query)))
            urlParams[decode(match[1])] = decode(match[2]);
    })();

    axios.defaults.baseURL = "http://localhost:8080/";
    axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";



    // Add a response interceptor
    axios.interceptors.response.use(function (response) {
        if (response.data.error === "AuthError") {
            window.alert(`${response.data.error}:${response.data.msg}`)
            window.location.href = "http://localhost:8080/"
            return
        }

        else if (response.data.error === "PermissionError") {
            window.alert(`${response.data.error}:${response.data.msg}`)
            return
        }
        return response;
    }, function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    });


    // Global Objects
    let WS;
    const connectionStatus = Object.seal({ status: false, retry: 0 })

    const Charts = new Map()

    const stocks = await getStocks()

    // const user = await getUser(urlParams)

    StockComponent().create(stocks)


    const subscribedStocks = stocks.map((item) => item.name)

    connectWebSocket(subscribedStocks)

    // Connect to websocket for stocks update
    // @param stock_names {Array[String]} : Stock names in array
    function connectWebSocket(subscribeStocks) {
        alert("Trying to connect Websocket", subscribeStocks)
        WS = new WebSocket("ws://localhost:8080/ws?channels=" + subscribeStocks);

        // Websocke connection events
        WS.onopen = onConnectionOpen

        WS.onclose = onConnectionClose

        WS.onmessage = onMessage

        WS.onerror = onConnectionError
    }
    function onConnectionOpen() {
        connectionStatus.status = true
        connectionStatus.retry = 0
        console.log("WS connection open.")
    }

    function onConnectionClose(event) {
        connectionStatus.status = false
        if (event.wasClean) {
            alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            alert('[close] Connection died');
        }
    }

    function onConnectionError() {
        connectionStatus.status = false
        alert(`[error] ${error.message}`);
    }


    // Handler to recive message on socket
    // data {Buffer} : meaase recived as buffer
    function onMessage(event) {
        const data = event.data
        try {
            const json = JSON.parse(data)
            StockComponent().update(json)
        } catch (error) {
            console.error("Error in message...", error)
        }
    }


    function alert() {
        console.log(...arguments)
    }


    async function updatePriceEvent(stockName, Input) {
        try {
            const response = await axios({
                method: "POST",
                data: {
                    name: stockName,
                    newPrice: Input.value
                },
                url: "/stocks",
            });

            if (response.error !== 0) {
                window.alert(`${response.data.error}:${response.data.msg}`)
                return
            }

            Input.value = ""
            return Promise.resolve(response);
        } catch (error) {
            console.error({ error: error.name, msg: error });
            return Promise.resolve(undefined);
        }

    }
    function StockComponent(params) {

        const parent = document.getElementById("stock_list")

        return {
            create: (data) => {

                data.forEach((stock) => {

                    // create row div
                    const row = document.createElement('div')
                    row.setAttribute("class", "row")
                    row.setAttribute("id", "stock_" + stock.name)

                    // Price Update
                    const updateDiv = document.createElement("div")
                    const updateForm = document.createElement("form")
                    updateForm.setAttribute("method", "POST")
                    updateForm.setAttribute("name", `form_${stock.name}`)
                    updateForm.setAttribute("action", "POST", "/stock")
                    updateForm.setAttribute("id", `UpdateForm_${stock.name}`)


                    const UpdateInput = document.createElement("input")
                    UpdateInput.setAttribute('type', "number")
                    UpdateInput.setAttribute('name', "price")

                    const updateButton = document.createElement("button")

                    updateButton.setAttribute("type", "button")
                    updateButton.setAttribute("value", "Change Price")

                    updateButton.innerHTML = "Update Price"
                    updateButton.addEventListener("click", (event) => updatePriceEvent(stock.name, UpdateInput))


                    updateForm.appendChild(UpdateInput)
                    updateForm.appendChild(updateButton)

                    updateDiv.appendChild(updateForm)


                    // 1st Column, Stock name price update
                    const div1 = document.createElement('div')

                    div1.setAttribute("class", "col col-md-2")
                    div1.innerHTML = `<bold>${stock.name.toString()}</bold>`

                    div1.appendChild(updateDiv)

                    const div2 = document.createElement("div")
                    div2.setAttribute("class", "col col-md-2")
                    div2.setAttribute("id", "price_" + stock.name)
                    div2.innerHTML = `<p>${stock.current_price}</p><p>$ updated ${stock.updatedAt}</p>`


                    const div3 = document.createElement("div")
                    div3.setAttribute("class", "col col-md-2")
                    div3.setAttribute("id", "graph_" + stock.name)

                    const canvas = document.createElement("canvas")
                    canvas.setAttribute("id", "chart_" + stock.name)
                    div3.appendChild(canvas)

                    drawChart(canvas, stock)
                    row.appendChild(div1)
                    row.appendChild(div2)
                    row.appendChild(div3)

                    parent.appendChild(row)
                })


            },
            update: function (stock) {
                const elem = document.getElementById("price_" + stock.name)

                if (!elem) return undefined

                elem.innerHTML = `<p>${stock.price}</p><p>Updated ${dayjs(stock.updatedAt).fromNow(true)} ago</p>`

                updateChart(stock)
                // drawChart(chart, stock)

                return true
            }
        }
    }

    function updateChart(stock) {
        console.log("updating chart", stock)
        var chart = Charts.get(stock.name)
        chart.data.datasets[0].data.push(stock.price)
        chart.update();

    }

    async function drawChart(element, stock) {
        var ctx = element.getContext("2d");
        var chart = new Chart(ctx, {


            // The type of chart we want to create

            type: "line",

            // The data for our dataset
            data: {
                labels: [],
                datasets: [
                    {
                        labels: ["a", "b", "c"],
                        backgroundColor: "rgb(255, 99, 132)",
                        borderColor: "black",
                        data: stock.history.map((item) => parseInt(item.price)),
                        fill: false,
                        pointBackgroundColor: "rgb(255, 99, 132)",
                        pointRadius: 5
                    },
                ],
            },


            options: {
                legend: {
                    display: false,

                },
                line: {
                    borderColor: "white"
                }
            }

        });

        Charts.set(stock.name, chart)
    }



    async function getStocks() {
        try {
            const response = await axios({
                method: "get",
                url: new URL("/stocks", "http://localhost:8080/"),
            });

            if (response && response.data && response.status !== 200) throw new Error("GetStock call failed with status " + response.status)

            const result = []

            Object.keys(response.data.data).forEach((value) => {
                const obj = response.data.data[value]
                result.push({
                    ...obj,
                    current_price: obj.history[obj.history.length - 1].change
                })
            })
            console.log("result", result)

            return Promise.resolve(result);
        } catch (error) {
            console.error(error);
            return Promise.resolve(undefined);
        }
    }


    async function getUser(urlParams) {
        try {
            const authKey = urlParams["auth"];
            if (!authKey) {
                console.log("Authention key needed...");
                logout();
            }

            console.log("authKey", authKey);

            const response = await axios({
                method: "get",
                header: { "X-TOKEN": authKey },
                url: new URL("/user", "http://localhost:8080/"),
            });
            return Promise.resolve(response);
        } catch (error) {
            console.error({ error: error.name, msg: error });
            return Promise.resolve(undefined);
        }
    }

    function logout() {
        console.log("user logged out");
        window.location.href = "http://localhost:8080/public/index.html";
    }
})(window);



