const cors = require('cors');

const buildCorsOptions = () => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://introvertextrovert.netlify.app',
  ];

  if (process.env.FRONTEND_URL) {
    const customOrigins = process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));
    allowedOrigins.push(...customOrigins);
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');

      // Check explicit allowed list
      const isExplicitlyAllowed = allowedOrigins.some((allowed) => {
        const cleanAllowed = allowed.replace(/\/$/, '');
        if (cleanAllowed === cleanOrigin) return true;
        if (cleanAllowed.includes('*')) {
          const regex = new RegExp(`^${cleanAllowed.replace('*', '.*')}$`);
          return regex.test(cleanOrigin);
        }
        return false;
      });

      // Allow official project Netlify domains
      const isNetlifyDomain = /^https:\/\/[a-zA-Z0-9-]+\.netlify\.app$/.test(cleanOrigin);

      if (isExplicitlyAllowed || isNetlifyDomain || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(new Error(`CORS policy blocks access from origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
  };
};

module.exports = cors(buildCorsOptions());


