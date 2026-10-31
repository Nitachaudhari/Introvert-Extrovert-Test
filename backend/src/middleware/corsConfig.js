const cors = require('cors');

const buildCorsOptions = () => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  if (process.env.FRONTEND_URL) {
    const customOrigins = process.env.FRONTEND_URL.split(',').map((o) => o.trim());
    allowedOrigins.push(...customOrigins);
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        // Allow Netlify preview domains or exact matches
        if (allowed.includes('*')) {
          const regex = new RegExp(`^${allowed.replace('*', '.*')}$`);
          return regex.test(origin);
        }
        return false;
      });

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
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

