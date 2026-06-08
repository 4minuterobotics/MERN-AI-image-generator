import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, maxlength: 100, trim: true },
		prompt: { type: String, required: true, maxlength: 500, trim: true },
		photo: { type: String, required: true, maxlength: 2048 },
	},
	{ timestamps: true }
);

// Newest-first listings need this index to stay fast as the collection grows.
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
