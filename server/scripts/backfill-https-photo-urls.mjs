#!/usr/bin/env node
// One-off backfill: rewrite legacy `http://res.cloudinary.com/...` photo URLs
// in the `posts` collection to `https://...`. The serve flipped to HTTPS-only
// Cloudinary URLs in postRoutes.js on 2026-06-08; rows created before that
// still have the old http:// URLs and trigger mixed-content blocks in
// browsers on the HTTPS Drew-It site.
//
// Run once: `node scripts/backfill-https-photo-urls.mjs`
// Reads MONGODB_URL from server/.env (or process env).

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Post from '../mongodb/models/post.js';

dotenv.config();

if (!process.env.MONGODB_URL) {
	console.error('MONGODB_URL is not set. Aborting.');
	process.exit(1);
}

const run = async () => {
	mongoose.set('strictQuery', true);
	await mongoose.connect(process.env.MONGODB_URL);
	console.log('connected to MongoDB');

	const before = await Post.countDocuments({ photo: /^http:\/\// });
	console.log(`rows to backfill: ${before}`);

	if (before === 0) {
		console.log('nothing to do.');
		await mongoose.disconnect();
		return;
	}

	// Use aggregation pipeline update so we can do a literal string replace
	// without re-pulling every doc into memory.
	const result = await Post.updateMany({ photo: /^http:\/\// }, [
		{
			$set: {
				photo: {
					$replaceOne: { input: '$photo', find: 'http://', replacement: 'https://' },
				},
			},
		},
	]);

	console.log(`matched: ${result.matchedCount}  modified: ${result.modifiedCount}`);

	const after = await Post.countDocuments({ photo: /^http:\/\// });
	console.log(`rows still on http after run: ${after}`);

	await mongoose.disconnect();
};

run().catch((err) => {
	console.error('backfill failed:', err);
	process.exit(1);
});
