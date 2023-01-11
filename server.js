require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./database/database");

const userRoute = require("./routes/User");
const productRoute = require("./routes/product");

app.use(express.json());
app.use("/", userRoute);
app.use("/", productRoute);

app.listen(process.env.PORT, () => {
	console.log(`server is running at ${process.env.PORT}`);
});
