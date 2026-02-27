require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateVideo() {
    console.log('Connecting to database...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lms',
            port: process.env.DB_PORT || 3306,
        });

        console.log('Updating "App Router Basics" video to use YouTube ID: UWYOC8g5N_0');
        const [result] = await connection.query(
            `UPDATE videos SET youtube_id = 'UWYOC8g5N_0', video_url = 'https://www.youtube.com/watch?v=UWYOC8g5N_0&list=PLC3y8-rFHvwjkxt8TOteFdT_YmzwpBlrG' WHERE title = 'App Router Basics'`
        );

        console.log(`Updated ${result.affectedRows} videos.`);
        await connection.end();
    } catch (error) {
        console.error('Error updating video:', error);
    }
}

updateVideo();
