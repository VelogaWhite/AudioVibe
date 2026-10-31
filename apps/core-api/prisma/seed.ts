import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function main() {
    const csvFilePath = path.join(__dirname, 'data', 'spotify_tracks_cleaned.csv');

    if (!fs.existsSync(csvFilePath)) {
        throw new Error(`ไม่พบไฟล์ Dataset ที่: ${csvFilePath}`);
    }

    console.log('🚀 เริ่มต้นการ Seed ข้อมูลเพลงเข้าสู่ PostgreSQL...');

    const fileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let isHeader = true;
    let headers: string[] = [];
    const trackBatch: any[] = [];
    const featureBatch: any[] = [];
    const BATCH_SIZE = 1000;
    let totalCount = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;

        const row = parseCSVLine(line);

        if (isHeader) {
            headers = row.map((h) => h.replace(/^"|"$/g, '').trim());
            isHeader = false;
            continue;
        }

        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
            rowData[header] = (row[index] ?? '').replace(/^"|"$/g, '').trim();
        });

        const trackId = rowData['track_id'];
        if (!trackId) continue;

        trackBatch.push({
            id: trackId,
            title: rowData['track_name'] || 'Unknown Title',
            artistName: rowData['artist_name'] || 'Unknown Artist',
            albumName: null,
            albumCoverUrl: null,
            durationMs: parseInt(rowData['duration_ms'] || '0', 10),
            popularity: parseInt(rowData['popularity'] || '0', 10),
        });

        featureBatch.push({
            trackId: trackId,
            danceability: parseFloat(rowData['danceability'] || '0'),
            valence: parseFloat(rowData['valence'] || '0'),
            energy: parseFloat(rowData['energy'] || '0'),
            acousticness: parseFloat(rowData['acousticness'] || '0'),
            instrumentalness: parseFloat(rowData['instrumentalness'] || '0'),
            liveness: parseFloat(rowData['liveness'] || '0'),
            speechiness: parseFloat(rowData['speechiness'] || '0'),
        });

        if (trackBatch.length >= BATCH_SIZE) {
            await prisma.track.createMany({
                data: trackBatch,
                skipDuplicates: true,
            });
            await prisma.audioFeature.createMany({
                data: featureBatch,
                skipDuplicates: true,
            });
            totalCount += trackBatch.length;
            console.log(`...นำเข้าแล้ว ${totalCount} แทร็ก`);
            trackBatch.length = 0;
            featureBatch.length = 0;
        }
    }

    if (trackBatch.length > 0) {
        await prisma.track.createMany({
            data: trackBatch,
            skipDuplicates: true,
        });
        await prisma.audioFeature.createMany({
            data: featureBatch,
            skipDuplicates: true,
        });
        totalCount += trackBatch.length;
    }

    console.log(`✅ Seed ข้อมูลเสร็จสิ้นเรียบร้อย! รวมทั้งหมด ${totalCount} แทร็ก`);
}

main()
    .catch((e) => {
        console.error('❌ เกิดข้อผิดพลาดในการ Seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });