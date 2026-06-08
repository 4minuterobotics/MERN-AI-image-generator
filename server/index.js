import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import { sanitizeMongoMiddleware, globalLimiter } from './middleware/security.js';

dotenv.config();

const app = express();

// Vercel/Render put us behind a proxy, so express-rate-limit needs to trust
// X-Forwarded-For to see the real client IP. Trust 1 hop only.
app.set('trust proxy', 1);

const ALLOWED_ORIGINS = [
	'https://drew-it.vercel.app',
	'http://localhost:5173', // vite default
	'http://localhost:3900', // ClaudeBuilt convention
	process.env.EXTRA_ALLOWED_ORIGIN,
].filter(Boolean);

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);
			if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
			return cb(new Error('Not allowed by CORS'));
		},
	})
);

app.use(helmet());

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

app.use(sanitizeMongoMiddleware);

app.use(globalLimiter);

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);

app.get('/', async (req, res) => {
	res.send('Hello from DALL-E');
});

// Final error handler: log server-side, return a generic 500 to the client.
// Without this, Express's default handler leaks stack traces in responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error('unhandled error:', err?.message || err);
	if (res.headersSent) return;
	res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 8081;

const startServer = async () => {
	try {
		connectDB(process.env.MONGODB_URL);
		app.listen(PORT, () => console.log(`Server has started on port http://localhost:${PORT}`));
	} catch (error) {
		console.log(error);
	}
};

startServer();
