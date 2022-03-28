const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const Exercise = require("./models/exercise");
require("dotenv").config({ path: "./sample.env" });

app.use(cors());
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(express.static("public"));
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/views/index.html");
});

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("DB connected successfully..."))
	.catch((err) => console.log("Failed to connect to DB...", err));

const listener = app.listen(process.env.PORT || 3000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

// endpoints
app.post("/api/users", urlencodedParser, async (req, res) => {
	try {
		const user = await User.create(req.body);

		return res.status(201).json({
			username: user.username,
			_id: user._id,
		});
	} catch (err) {
		res.status(400).json({
			error: err.message,
		});
	}
});

app.get("/api/users", async (req, res) => {
	try {
		const user = await User.find().select("-__v");

		if (user.length == 0) return res.status(200).send("There are no users");

		return res.status(200).json(user);
	} catch (err) {
		res.status(400).json({
			error: err.message,
		});
	}
});

app.post("/api/users/:_id/exercises", urlencodedParser, async (req, res) => {
	try {
		const user = await User.findById(req.params._id);
		let exercises;
		if (user) {
			exercises = await Exercise.create({
				description: req.body.description,
				duration: req.body.duration,
				date: req.body.date || new Date(),
				userId: user.id,
			});
		}

		if (!user) {
			return res.status(404).json({ error: "Id Not Found!..." });
		}

		return res.status(201).json({
			username: user.username,
			description: exercises.description,
			duration: exercises.duration,
			date: exercises.date.toDateString(),
			_id: user._id,
		});
	} catch (err) {
		return res.status(400).json({
			error: err.message,
		});
	}
});

app.get("/api/users/:_id/logs", async (req, res) => {
	const user = await User.findById(req.params._id);
	const { from, to, limit } = req.query;
	try {
		let log = await Exercise.find({ userId: user._id }).limit(limit);
		let logs = log.map((el) => ({
			description: el.description,
			duration: el.duration,
			date: el.date.toDateString(),
		}));

		if (from || to) {
			log = await Exercise.find({ userId: user._id })
				.where("date")
				.gte(req.query.from)
				.lte(req.query.to)
				.select("-_id -__v")
				.limit(limit);
		}

		return res.status(200).json({
			_id: user._id,
			username: user.username,
			log: logs,
			count: log.length,
		});
	} catch (err) {
		return res.status(400).json({
			error: err.message,
		});
	}
});
