import mongoose from "mongoose";

//create a SCHEMA with validation
const postSchema = new mongoose.Schema({
	name: { type: String, required: true },
	prompt: { type: String, required: true },
	photo: { type: String, required: true },
});

//create a MODEL   ("SingularCollectionName", schemaName)
/* mongo will lowercase the colection name and make it plural in the terminal*/
const Post = mongoose.model("Post", postSchema);

export default Post;
