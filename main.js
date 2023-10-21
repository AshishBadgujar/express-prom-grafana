const express = require("express")
const client = require('prom-client')

const app = express()
let register = new client.Registry()

const headsCount = new client.Counter({
    name: "heads_count",
    help: "number of heads"
})
const tailsCount = new client.Counter({
    name: "tails_count",
    help: "number of tails"
})
const flipCount = new client.Counter({
    name: "flip_count",
    help: "number of flips"
})


const apiCalls = new client.Counter({
    name: 'api_calls_count',
    help: 'the total number of processed requests'
})

const histogram = new client.Histogram({
    name: 'node_request_duration_seconds',
    help: 'histogram for the duration in seconds',
    buckets: [1, 2, 5, 6, 10]
})


register.registerMetric(headsCount)
register.registerMetric(tailsCount)
register.registerMetric(flipCount)
register.registerMetric(apiCalls)
register.registerMetric(histogram)

register.setDefaultLabels({
    app: "app"
})

client.collectDefaultMetrics({ register })

app.get('/', (req, res) => {
    let start = new Date()
    let simulateTime = 1000

    setTimeout(() => {
        let end = new Date() - start
        histogram.observe(end / 1000)
    }, simulateTime)

    apiCalls.inc()

    res.send("Hello world")
})

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType)
    res.end(await register.metrics())
})


app.get("/flip-coins", (req, res) => {
    const times = req.query.times;
    if (times && times > 0) {
        flipCount.inc(Number(times))
        let heads = 0;
        let tails = 0;
        for (let i = 0; i < times; i++) {
            let randomNumber = Math.random();
            if (randomNumber < 0.5) {
                heads++;
            } else {
                tails++;
            }
        }
        headsCount.inc(heads)
        tailsCount.inc(tails)
        res.json({ heads, tails });
    } else {
        res.send('hello! i work!!');
    }
})

app.listen(5000, () => {
    console.log("app running")
})