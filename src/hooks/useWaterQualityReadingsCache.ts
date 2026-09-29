import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  insertReadingCache,
  getReadingsByPond,
  getPendingReadings,
  markReadingSynced,
  getReadingByClientUuid,
  type WaterQualityReadingCacheEntry,
} from '../database/repositories/waterQualityReadingsCache.repository';
import { generateUUID } from '../utils/uuid';
import type { WaterQualityRecord } from '../types';

export function useWaterQualityReadingsCache(pondId: string | null) {
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading, refetch } = useQuery({
    queryKey: ['waterQualityReadings', pondId],
    queryFn: () => (pondId ? getReadingsByPond(pondId, 100) : []),
    enabled: !!pondId,
    staleTime: 30_000,
  });

  const saveReading = useCallback(
    async (data: Omit<WaterQualityRecord, 'clientId'>): Promise<string> => {
      const clientId = generateUUID();
      const entry: Omit<WaterQualityReadingCacheEntry, 'createdAt'> = {
        id: clientId,
        clientUuid: clientId,
        pondId: data.pondId,
        measuredAt: data.measuredAt,
        oxygenMgL: data.oxygenMgL ?? null,
        ph: data.ph ?? null,
        salinityPpt: data.salinityPpt ?? null,
        temperatureC: data.temperatureC ?? null,
        ammoniaMgL: data.ammoniaMgL ?? null,
        synced: 0,
      };
      await insertReadingCache(entry);
      queryClient.invalidateQueries({ queryKey: ['waterQualityReadings', data.pondId] });
      return clientId;
    },
    [queryClient],
  );

  const markSynced = useCallback(
    async (clientId: string) => {
      await markReadingSynced(clientId);
      if (pondId) {
        queryClient.invalidateQueries({ queryKey: ['waterQualityReadings', pondId] });
      }
    },
    [pondId, queryClient],
  );

  const findByClientUuid = useCallback(
    async (clientUuid: string) => {
      return getReadingByClientUuid(clientUuid);
    },
    [],
  );

  return {
    readings,
    isLoading,
    refetch,
    saveReading,
    markSynced,
    findByClientUuid,
  };
}

export function usePendingWaterQualityReadings() {
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading, refetch } = useQuery({
    queryKey: ['waterQualityReadingsPending'],
    queryFn: () => getPendingReadings(100),
    staleTime: 10_000,
  });

  const markSynced = useCallback(
    async (clientId: string) => {
      await markReadingSynced(clientId);
      queryClient.invalidateQueries({ queryKey: ['waterQualityReadingsPending'] });
    },
    [queryClient],
  );

  return {
    readings,
    isLoading,
    refetch,
    markSynced,
    count: readings.length,
  };
}