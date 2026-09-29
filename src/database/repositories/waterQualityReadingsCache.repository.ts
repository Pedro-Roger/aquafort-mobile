import { getDb } from '../db';
import type { WaterQualityRecord } from '../../types';

export interface WaterQualityReadingCacheEntry {
  id: string;
  clientUuid: string | null;
  pondId: string;
  measuredAt: string;
  oxygenMgL: number | null;
  ph: number | null;
  salinityPpt: number | null;
  temperatureC: number | null;
  ammoniaMgL: number | null;
  synced: number;
  createdAt: string;
}

export async function insertReadingCache(
  entry: Omit<WaterQualityReadingCacheEntry, 'createdAt'>
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO water_quality_readings_cache
     (id, client_uuid, pond_id, measured_at, oxygen_mg_l, ph, salinity_ppt, temperature_c, ammonia_mg_l, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.clientUuid,
      entry.pondId,
      entry.measuredAt,
      entry.oxygenMgL,
      entry.ph,
      entry.salinityPpt,
      entry.temperatureC,
      entry.ammoniaMgL,
      entry.synced ? 1 : 0,
    ],
  );
}

export async function getReadingsByPond(
  pondId: string,
  limit = 50
): Promise<WaterQualityReadingCacheEntry[]> {
  const db = await getDb();
  return db.getAllAsync<WaterQualityReadingCacheEntry>(
    `SELECT * FROM water_quality_readings_cache
     WHERE pond_id = ?
     ORDER BY measured_at DESC
     LIMIT ?`,
    [pondId, limit],
  );
}

export async function getPendingReadings(
  limit = 50
): Promise<WaterQualityReadingCacheEntry[]> {
  const db = await getDb();
  return db.getAllAsync<WaterQualityReadingCacheEntry>(
    `SELECT * FROM water_quality_readings_cache
     WHERE synced = 0
     ORDER BY measured_at ASC
     LIMIT ?`,
    [limit],
  );
}

export async function markReadingSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE water_quality_readings_cache SET synced = 1 WHERE id = ?`,
    [id],
  );
}

export async function markReadingUnsynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE water_quality_readings_cache SET synced = 0 WHERE id = ?`,
    [id],
  );
}

export async function deleteReading(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM water_quality_readings_cache WHERE id = ?`,
    [id],
  );
}

export async function getReadingByClientUuid(
  clientUuid: string
): Promise<WaterQualityReadingCacheEntry | null> {
  const db = await getDb();
  return db.getFirstAsync<WaterQualityReadingCacheEntry>(
    `SELECT * FROM water_quality_readings_cache WHERE client_uuid = ?`,
    [clientUuid],
  );
}

export function toWaterQualityRecord(
  entry: WaterQualityReadingCacheEntry
): WaterQualityRecord {
  return {
    clientId: entry.clientUuid ?? entry.id,
    pondId: entry.pondId,
    cycleId: '', // Not stored in cache; need to fetch from cycle if needed
    responsibleId: '',
    responsibleName: '',
    oxygenMgL: entry.oxygenMgL ?? undefined,
    ph: entry.ph ?? undefined,
    salinityPpt: entry.salinityPpt ?? undefined,
    temperatureC: entry.temperatureC ?? undefined,
    ammoniaMgL: entry.ammoniaMgL ?? undefined,
    measuredAt: entry.measuredAt,
    origin: 'MANUAL',
  };
}