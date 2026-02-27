require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateVideos() {
    console.log('Connecting to database...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'lms',
            port: process.env.DB_PORT || 3306,
        });

        console.log('Updating all videos to use YouTube ID: xnOwOBYaA3w');
        const [result] = await connection.query(
            `UPDATE videos SET youtube_id = 'xnOwOBYaA3w', video_url = 'https://www.youtube.com/watch?v=xnOwOBYaA3w'`
        );

        console.log(`Updated ${result.affectedRows} videos.`);
        await connection.end();
    } catch (error) {
        console.error('Error updating videos:', error);
    }
}

updateVideos();
