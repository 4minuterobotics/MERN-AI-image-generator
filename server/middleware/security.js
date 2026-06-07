import rateLimit from 'express-rate-limit';

// Recursively strip MongoDB operator keys ($foo) and dotted keys (foo.bar)
// from any user-supplied object so they can't smuggle query/update operators
// into Mongoose lookups.
const sanitizeMongo = (obj) => {
	if (obj === null || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map(sanitizeMongo);
	const clean = {};
	for (const [k, v] of Object.entries(obj)) {
		if (k.startsWith('$') || k.includes('.')) continue;
		clean[k] = sanitizeMongo(v);
	}
	return clean;
};

export const sanitizeMongoMiddleware = (req, res, next) => {
	if (req.body && typeof req.body === 'object') req.body = sanitizeMongo(req.body);
	if (req.params && typeof req.params === 'object') {
		for (const k of Object.keys(req.params)) {
			if (k.startsWith('$') || k.includes('.')) delete req.params[k];
		}
	}
	if (req.query && typeof req.query === 'object') {
		for (const k of Object.keys(req.query)) {
			if (k.startsWith('$') || k.includes('.')) delete req.query[k];
		}
	}
	next();
};

// Strip ASCII control chars (incl. NULs) and trim. Defends against header/log
// injection and weird MongoDB encoding edge cases. Caller still enforces length.
export const cleanString = (s) => (typeof s === 'string' ? s.replace(/[\x00-\x1F\x7F]/g, '').trim() : '');

// Per-IP limit. 5 generations / hour. Stability SD3 calls cost real money, so
// this is the hot endpoint to protect.
export const generateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: { error: 'Too many generations from this IP. Try again in an hour.' },
});

// Per-IP limit. 10 community posts / hour.
export const postLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: { error: 'Too many shares from this IP. Try again in an hour.' },
});

// Looser global limit for read endpoints + everything else.
export const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 200,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});
