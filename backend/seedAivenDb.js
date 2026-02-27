const mysql = require('mysql2/promise');

async function seedAiven() {
  console.log('Connecting to Aiven Cloud Database...');

  // Connection details from Aiven Service URI
  const connection = await mysql.createConnection({
    host: process.env.AIVEN_DB_HOST || 'mysql-2143bdff-tejasrgowda85-7976.j.aivencloud.com',
    user: process.env.AIVEN_DB_USER || 'avnadmin',
    password: process.env.AIVEN_DB_PASSWORD, // Use environment variable
    database: process.env.AIVEN_DB_NAME || 'defaultdb',
    port: parseInt(process.env.AIVEN_DB_PORT || '12011'),
    ssl: { rejectUnauthorized: false } // Required for Aiven SSL
  });

  console.log('Connected! Creating tables...');

  try {
    // 1. Users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Subjects/Courses
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        thumbnail_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Sections
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        order_index INT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // 4. Videos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        video_url VARCHAR(255) NOT NULL,
        youtube_id VARCHAR(50),
        duration INT DEFAULT 0,
        order_index INT NOT NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )
    `);

    // 5. User Progress
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id INT NOT NULL,
        video_id INT NOT NULL,
        last_watched_sec INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, video_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `);

    console.log('Tables created successfully. Seeding data...');

    // Seed Data
    const [subjectResult] = await connection.query(
      `INSERT INTO subjects (name, description, thumbnail_url) 
       VALUES ('Web Development Bootcamp', 'The ultimate guide to full-stack web development.', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop')`
    );
    const subjectId = subjectResult.insertId;

    const [sectionResult] = await connection.query(
      `INSERT INTO sections (subject_id, title, order_index) VALUES (?, 'Introduction to Next.js', 1)`,
      [subjectId]
    );
    const sectionId = sectionResult.insertId;

    const videos = [
      { title: 'App Router Basics', yt: 'UWYOC8g5N_0', url: 'https://www.youtube.com/watch?v=UWYOC8g5N_0', order: 1 },
      { title: 'Server vs Client Components', yt: 'xnOwOBYaA3w', url: 'https://www.youtube.com/watch?v=xnOwOBYaA3w', order: 2 },
      { title: 'Data Fetching & Caching', yt: 'xnOwOBYaA3w', url: 'https://www.youtube.com/watch?v=xnOwOBYaA3w', order: 3 },
    ];

    for (let vid of videos) {
      await connection.query(
        `INSERT INTO videos (section_id, title, video_url, youtube_id, duration, order_index) 
         VALUES (?, ?, ?, ?, 600, ?)`,
        [sectionId, vid.title, vid.url, vid.yt, vid.order]
      );
    }

    console.log('Database successfully seeded with demo courses!');

  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await connection.end();
  }
}

seedAiven();
