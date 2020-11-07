// MongoDB File

const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;
// console.log(MONGO_URI)
const assert = require("assert");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// PUT Notes Into DB 
// const notes = [];

const putNotes = async (req, res) => {
	const { note, appid, userid } = req.body
	const filter = { appid , userid }
	// try {
	  const client = await MongoClient(MONGO_URI, options);
	  await client.connect();
	  const db = client.db("gamesmap");
		console.log(note)
	//   const r = await db.collection("notes").insertOne(notes);
	  const r = await db.collection('notes').findOneAndUpdate(
		filter,
		{ $push: { notes: note } }, {
			upsert: true,
			returnOriginal: false,
		}
	  )	
	//   assert.strictEqual(1, r.modifiedCount) value.notes
	console.log(r)
	  res.status(201).json({ status: 201, data: r.value.notes });
  
	  // close the connection to the database server
	  client.close();
	// } catch (err) {
		// console.log(err)
		// res.status(500).json({ status: 500, message: err.message })
	// }
  };

module.exports = { putNotes }
