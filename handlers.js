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
  const { note, appid, userid } = req.body;
  const filter = { appid: Number(appid), userid };
  // try {
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("gamesmap");
  console.log(note);
  //   const r = await db.collection("notes").insertOne(notes);
  const r = await db.collection("notes").findOneAndUpdate(
    filter,
    { $push: { notes: note } },
    {
      upsert: true,
      returnOriginal: false,
    }
  );
  //   assert.strictEqual(1, r.modifiedCount) value.notes
//   console.log(r);
  res.status(201).json({ status: 201, data: r.value.notes });

  // close the connection to the database server
  client.close();
  // } catch (err) {
  // console.log(err)
  // res.status(500).json({ status: 500, message: err.message })
  // }
};
// r.value._id would Delete the entire Array of Notes
// TODO: Delete the individual note in the array ie [0] or [4] $pull ?

const getNotes = async (req, res) => {
  const { userid, game } = req.params;
  
  const filter = { userid, appid: Number(game) };
	console.log(filter)

	const client = await MongoClient(MONGO_URI, options);
	await client.connect();
  const db = client.db("gamesmap");

	const r = await db.collection("notes").findOne(filter);
  // TODO: Mongo stuff
  res.status(200).json({ status: 200, data: r.notes })
  console.log(r, 'this is the R')
  client.close()
}


const deleteNotes = async (req, res) => {
  // const { _id } = req.params
  const { note } = req.body
  const { userid, game } = req.params;
  const filter = { userid, appid: Number(game) };
 // $pull 
	const client = await MongoClient(MONGO_URI, options);
	await client.connect();
	const db = client.db("gamesmap");
	const r = await db.collection("notes").updateOne(
    filter,
    { $pull: { notes: note } },

  );
    // assert.strictEqual(1, r.deletedCount);
    console.log(r)
    res.status(204).json({ status: 204 });
    client.close();

}

module.exports = { putNotes, deleteNotes, getNotes };
