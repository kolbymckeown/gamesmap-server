require("dotenv").config();

const express = require("express");
const app = express();
const port = 8000;
const fetch = require("node-fetch");
const API_KEY = process.env.STEAM_API_KEY;


// app.get("/", (req, res) => {
// 	res.send("Gamesmap!");

// 	fetch(
// 		`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=76561197960434622&format=json`
// 	)
// 		.then((res) => res.json())
// 		.then((list) => console.log(list.response.game_count));
// });
// // this is a test

// app.listen(port, () => {
// 	console.log(`Example app listening on port ${port}!`);
// });
