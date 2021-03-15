
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
    axios.defaults.headers.common["X-TOKEN"] = urlParams["auth"];
    axios.defaults.headers.post["Content-Type"] =
        "application/x-www-form-urlencoded";

    const WS = new WebSocket("ws://localhost:8080/ws");

    WS.addEventListener("open", () => {
        console.log("Websocket connection open");
    });

    WS.addEventListener("close", () => {
        console.log("Websocket connection closed..");
    });

    WS.addEventListener("message", (data) => {
        console.log("Got message", data.data);
    });

    const stocks = await getStocks()

    console.log("stocks data", stocks)
    const user = await getUser(urlParams)

    StockComponent().create(stocks)

    if (!user) {
        console.log("Usr authentication failed !!");
        console.log("logging out in 3 sec");

        //    setTimeout(()=>{
        //        logout()
        //    },3000)
    }



})(window);



function StockComponent(params) {

    const parent = document.getElementById("stock_list")

    return {
        create: (data) => {

            data.forEach((stock) => {
                const row = document.createElement('div')
                row.setAttribute("class", "row")
                row.setAttribute("id", "stock_" + stock.name)


                const div1 = document.createElement('div')

                div1.setAttribute("class", "col col-md-2")
                div1.innerHTML = `<bold>${stock.name.toString()}</bold>`

                const div2 = document.createElement("div")
                div2.setAttribute("class", "col col-md-2")
                div2.setAttribute("id", "price_" + stock.name)
                div2.innerHTML = `<p>${stock.current_price}</p><p>${stock.updatedAt}</p>`


                const div3 = document.createElement("div")
                div3.setAttribute("class", "col col-md-2")
                div3.setAttribute("id", "graph_" + stock.name)

                const canvas = document.createElement("canvas")

                div3.appendChild(canvas)

                drawChart(canvas)
                row.appendChild(div1)
                row.appendChild(div2)
                row.appendChild(div3)

                parent.appendChild(row)
            })


        },
        update: function (name, price, updatedAt) {
            const elem = docuemnt.getElementById("price_" + name)

            if (!elem) return undefined

            elem.innerHTML = `<p>${price}</p><p>${updatedAt}</p>`

            console.log("element updatyed")

            return true
        }
    }
}
async function drawChart(element) {
    var ctx = element.getContext("2d");
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: "line",

        // The data for our dataset
        data: {
            labels: [],
            datasets: [
                {
                    labels: [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                    ],
                    backgroundColor: "rgb(255, 99, 132)",
                    borderColor: "rgb(255, 99, 132)",
                    data: [12, 40, 5, 2, 20, 30, 45],
                    fill: false,
                },
            ],
        },

        // Configuration options go here
        options: {
            scales: {
                xAxes: [
                    {
                        type: "category",
                        labels: [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                        ],
                    },
                ],
            },
        },
    });
}

function parseStock(stockArray) {

    if (!Array.isArray(stockArray) && stockArray.length < 0) throw new Error("Invaalid paramaetr")

    const temp = {}

    try {
        for (const share of stockArray) {

            const lastHistory = share.history[share.history.length - 1]

            temp.name = share.name

            temp.updatedAt = lastHistory.updatedAt

            temp.current_price = lastHistory.change
        }

        return temp
    } catch (err) {
        console.error("error in parsing", err)
        return undefined
    }
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