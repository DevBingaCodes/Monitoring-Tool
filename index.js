const express = require("express")
const cors = require("cors")
const metricsRoute = require("./routes/metrics")
const pm2Route = require("./routes/pm2")
const dockerRoute = require("./routes/docker")
const dbRoute = require("./routes/dbs")
const logsROute = require("./routes/logs")

const app = express();

app.use(express.json())

//Cors
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "https://monitor.skirill.org"

];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Rejected Origin:", origin);
      callback(new Error("Not allowed by CORS!"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions))

//Routes
app.use("/system-monitor/v1/metrics", metricsRoute)
app.use("/system-monitor/v1/pm2", pm2Route)
app.use("/system-monitor/v1/docker", dockerRoute)
app.use("/system-monitor/v1/db", dbRoute)
app.use("/system-monitor/v1/logs", logsROute)

// Start the server
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server started on port ${PORT}`);
  });
}