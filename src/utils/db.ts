import mysql from 'mysql2/promise';

// In Next.js serverless functions, we want to maintain a cached connection pool
// to avoid creating new connections on every API request.
const globalForMySQL = global as unknown as { mysqlPool: mysql.Pool };

const pool =
    globalForMySQL.mysqlPool ||
    mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms',
        port: parseInt(process.env.DB_PORT || '3306'),
        ssl: { rejectUnauthorized: false }, // Required for Aiven
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });

if (process.env.NODE_ENV !== 'production') globalForMySQL.mysqlPool = pool;

export default pool;
