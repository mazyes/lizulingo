import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, TablesDB, Permission, Role, TablesDBIndexType, OrderBy, AppwriteException } from 'node-appwrite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env.local without external dotenv dependency
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvLocal();

const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID || '6ac980c400226dd2e952';
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: APPWRITE_API_KEY is not defined in .env.local or process.env');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const tables = new TablesDB(client);
const DATABASE_ID = 'lizulingo';

async function setup() {
  console.log(`🚀 Starting Appwrite setup on ${endpoint} (Project: ${projectId})...`);

  // 1. Ensure database exists
  try {
    await tables.get({ databaseId: DATABASE_ID });
    console.log(`✅ Database "${DATABASE_ID}" already exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`📦 Creating database "${DATABASE_ID}"...`);
      await tables.create({ databaseId: DATABASE_ID, name: 'lizulingo' });
      console.log(`✅ Database "${DATABASE_ID}" created.`);
    } else {
      throw err;
    }
  }

  // 2. Table: progress
  try {
    await tables.getTable({ databaseId: DATABASE_ID, tableId: 'progress' });
    console.log(`✅ Table "progress" already exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`📦 Creating table "progress"...`);
      await tables.createTable({
        databaseId: DATABASE_ID,
        tableId: 'progress',
        name: 'progress',
        permissions: [Permission.create(Role.users())],
        rowSecurity: true,
      });
      console.log(`✅ Table "progress" created.`);
    } else {
      throw err;
    }
  }

  // Columns for progress
  const progressCols = [
    { key: 'userId', type: 'string', size: 36, required: true },
    { key: 'data', type: 'text', required: true },
    { key: 'version', type: 'integer', required: true },
    { key: 'updatedAt', type: 'datetime', required: true },
    { key: 'deviceId', type: 'string', size: 36, required: false },
  ];

  for (const col of progressCols) {
    try {
      await tables.getColumn({ databaseId: DATABASE_ID, tableId: 'progress', key: col.key });
      console.log(`  ✓ Column "progress.${col.key}" exists.`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`  + Creating column "progress.${col.key}"...`);
        if (col.type === 'string') {
          await tables.createStringColumn({
            databaseId: DATABASE_ID,
            tableId: 'progress',
            key: col.key,
            size: col.size!,
            required: col.required,
          });
        } else if (col.type === 'text') {
          await tables.createTextColumn({
            databaseId: DATABASE_ID,
            tableId: 'progress',
            key: col.key,
            required: col.required,
          });
        } else if (col.type === 'integer') {
          await tables.createIntegerColumn({
            databaseId: DATABASE_ID,
            tableId: 'progress',
            key: col.key,
            required: col.required,
          });
        } else if (col.type === 'datetime') {
          await tables.createDatetimeColumn({
            databaseId: DATABASE_ID,
            tableId: 'progress',
            key: col.key,
            required: col.required,
          });
        }
        console.log(`  ✓ Column "progress.${col.key}" created.`);
      } else {
        throw err;
      }
    }
  }

  // 3. Table: profiles
  try {
    await tables.getTable({ databaseId: DATABASE_ID, tableId: 'profiles' });
    console.log(`✅ Table "profiles" already exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`📦 Creating table "profiles"...`);
      await tables.createTable({
        databaseId: DATABASE_ID,
        tableId: 'profiles',
        name: 'profiles',
        permissions: [Permission.read(Role.users()), Permission.create(Role.users())],
        rowSecurity: true,
      });
      console.log(`✅ Table "profiles" created.`);
    } else {
      throw err;
    }
  }

  // Columns for profiles
  const profilesCols = [
    { key: 'userId', type: 'string', size: 36, required: true },
    { key: 'displayName', type: 'string', size: 30, required: false },
    { key: 'mascotColor', type: 'string', size: 16, required: false },
    { key: 'totalXp', type: 'integer', required: false, xdefault: 0 },
    { key: 'weeklyXp', type: 'integer', required: false, xdefault: 0 },
    { key: 'weekStart', type: 'string', size: 10, required: false },
    { key: 'streak', type: 'integer', required: false, xdefault: 0 },
  ];

  for (const col of profilesCols) {
    try {
      await tables.getColumn({ databaseId: DATABASE_ID, tableId: 'profiles', key: col.key });
      console.log(`  ✓ Column "profiles.${col.key}" exists.`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`  + Creating column "profiles.${col.key}"...`);
        if (col.type === 'string') {
          await tables.createStringColumn({
            databaseId: DATABASE_ID,
            tableId: 'profiles',
            key: col.key,
            size: col.size!,
            required: col.required,
          });
        } else if (col.type === 'integer') {
          await tables.createIntegerColumn({
            databaseId: DATABASE_ID,
            tableId: 'profiles',
            key: col.key,
            required: col.required,
            xdefault: col.xdefault,
          });
        }
        console.log(`  ✓ Column "profiles.${col.key}" created.`);
      } else {
        throw err;
      }
    }
  }

  // Indexes for profiles
  try {
    await tables.getIndex({ databaseId: DATABASE_ID, tableId: 'profiles', key: 'idx_userId' });
    console.log(`  ✓ Index "profiles.idx_userId" exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`  + Creating unique index "profiles.idx_userId"...`);
      await tables.createIndex({
        databaseId: DATABASE_ID,
        tableId: 'profiles',
        key: 'idx_userId',
        type: TablesDBIndexType.Unique,
        columns: ['userId'],
      });
      console.log(`  ✓ Index "profiles.idx_userId" created.`);
    } else {
      console.warn(`  ! Note on index idx_userId: ${err.message}`);
    }
  }

  try {
    await tables.getIndex({ databaseId: DATABASE_ID, tableId: 'profiles', key: 'idx_weeklyXp' });
    console.log(`  ✓ Index "profiles.idx_weeklyXp" exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`  + Creating key index "profiles.idx_weeklyXp"...`);
      await tables.createIndex({
        databaseId: DATABASE_ID,
        tableId: 'profiles',
        key: 'idx_weeklyXp',
        type: TablesDBIndexType.Key,
        columns: ['weeklyXp'],
        orders: [OrderBy.Desc],
      });
      console.log(`  ✓ Index "profiles.idx_weeklyXp" created.`);
    } else {
      console.warn(`  ! Note on index idx_weeklyXp: ${err.message}`);
    }
  }

  console.log('\n🎉 Appwrite setup finished successfully!');
}

setup().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
