import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';

import connectDB from './mongodb/connect.js';
import postRoutes from './routes/postRoutes.js';
import dalleRoutes from './routes/dalleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { sanitizeMongoMiddleware, globalLimiter } from './middleware/security.js';

dotenv.config();

const app = express();

// Vercel/Render put us behind a proxy, so express-rate-limit needs to trust
// X-Forwarded-For to see the real client IP. Trust 1 hop only.
app.set('trust proxy', 1);

// CORS: only the deployed client + local dev. Anything else is denied.
const ALLOWED_ORIGINS = [
	'https://drew-it.vercel.app',
	'http://localhost:5173', // vite default
	'http://localhost:3900', // ClaudeBuilt convention
	process.env.EXTRA_ALLOWED_ORIGIN, // escape hatch for previews/staging
].filter(Boolean);

app.use(
	cors({
		origin: (origin, cb) => {
			// Allow same-origin / curl / server-to-server (no Origin header).
			if (!origin) return cb(null, true);
			if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
			return cb(new Error('Not allowed by CORS'));
		},
	})
);

app.use(helmet());

// 12 MB is enough for a base64-encoded ~9 MB image. Previously 50 MB which
// invited large-body DoS.
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Strip MongoDB operator keys from every request body / params / query.
app.use(sanitizeMongoMiddleware);

// Loose global cap on top of the stricter per-route limits.
app.use(globalLimiter);

app.use('/api/v1/post', postRoutes);
app.use('/api/v1/dalle', dalleRoutes);
app.use('/api/v1/user', userRoutes);

app.get('/', async (req, res) => {
	res.send('Hello from DALL-E');
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
