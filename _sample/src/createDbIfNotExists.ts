import { Database } from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

export async function createDatabaseIfNotExists(dbPath: string): Promise<void> {
    try {
        // Check if database file exists
        const exists = await fs.access(dbPath).then(() => true).catch(() => false);

        // Create database directory if it doesn't exist
        const dbDir = path.dirname(dbPath);
        await fs.mkdir(dbDir, { recursive: true });

        // Create new database connection
        const db = new Database(dbPath);

        if (!exists) {
            console.log('Creating new database...');

            // Read the SQL file
            const bootstrapSql = await fs.readFile(
                path.join(__dirname, 'bootstrap.sql'),
                'utf-8'
            );

            // Execute the SQL statements
            return new Promise((resolve, reject) => {
                db.exec(bootstrapSql, (err) => {
                    if (err) {
                        db.close();
                        reject(err);
                        return;
                    }
                    console.log('Database initialized successfully');
                    db.close();
                    resolve();
                });
            });
        } else {
            console.log('Database already exists');
            db.close();
        }
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
}