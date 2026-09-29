import React, { useState, useCallback } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PondSelector } from '../../components/PondSelector';
import { CycleSelector } from '../../components/CycleSelector';
import { ResponsibleSelector } from '../../components/ResponsibleSelector';
import { useAuth } from '../../hooks/useAuth';
import { useSync } from '../../hooks/useSync';
import { buildWaterQualityApiPayload, saveOffline, saveToCache } from '../../services/water-quality.service';
import { generateUUID } from '../../utils/uuid';
import { api } from '../../services/api';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import type { Pond, Cycle, User } from '../../types';
import { ReadingPeriod } from '../../types';
import { ScreenWrapper, Card, CardContent, NumericInput, Button, Spacer, Section, Badge } from '../../components/ui';
import { spacing, colors, typography, borderRadius } from '../../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WaterQualityForm'>;

const formSchema = z.object({
  oxygenMgL: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? parseFloat(v.replace(',', '.')) : undefined))
    .pipe(z.number().min(0).max(20).optional()),
  ph: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? parseFloat(v.replace(',', '.')) : undefined))
    .pipe(z.number().min(0).max(14).optional()),
  salinityPpt: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? parseFloat(v.replace(',', '.')) : undefined))
    .pipe(z.number().min(0).max(60).optional()),
  temperatureC: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? parseFloat(v.replace(',', '.')) : undefined))
    .pipe(z.number().min(0).max(45).optional()),
  ammoniaMgL: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? parseFloat(v.replace(',', '.')) : undefined))
    .pipe(z.number().min(0).max(10).optional()),
  measuredAt: z.string().min(1, 'Informe a data/hora'),
  origin: z.enum(['MANUAL', 'VOZ']),
  period: z.nativeEnum(ReadingPeriod).optional(),
});

type FormInput = z.input<typeof formSchema>;
type FormData = z.output<typeof formSchema>;

function nowIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WaterQualityFormScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { isOnline, syncNow } = useSync();

  const [selectedPond, setSelectedPond] = useState<Pond | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(
    user ? { id: user.id, name: user.name, role: user.role, active: true, updatedAt: '' } : null,
  );
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measuredAt: nowIso(),
      origin: 'MANUAL',
    },
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue } = methods;

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!selectedPond) {
        Alert.alert('Atenção', 'Selecione um viveiro');
        return;
      }
      if (!selectedCycle) {
        Alert.alert('Atenção', 'Selecione um ciclo');
        return;
      }
      if (!selectedUser) {
        Alert.alert('Atenção', 'Selecione o responsável');
        return;
      }

      setSubmitting(true);

      const payload = {
        pondId: selectedPond.id,
        cycleId: selectedCycle.id,
        responsibleId: selectedUser.id,
        responsibleName: selectedUser.name,
        oxygenMgL: data.oxygenMgL,
        ph: data.ph,
        salinityPpt: data.salinityPpt,
        temperatureC: data.temperatureC,
        ammoniaMgL: data.ammoniaMgL,
        measuredAt: new Date(data.measuredAt).toISOString(),
        origin: data.origin,
        period: data.period,
      };

      try {
        if (isOnline) {
          try {
            const clientId = generateUUID();
            const apiPayload = buildWaterQualityApiPayload(payload, clientId);
            await api.post('/v1/water-quality', apiPayload);
            await saveToCache({ ...payload, clientId });
            Alert.alert('Sucesso', 'Coleta registrada e sincronizada!', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
            return;
          } catch {
            // Fall through to offline save
          }
        }

        await saveOffline(payload);
        if (isOnline) {
          syncNow();
        }

        Alert.alert(
          'Registrado offline',
          'A coleta foi salva localmente e será sincronizada quando houver conexão.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } catch (err: any) {
        Alert.alert('Erro', err?.message ?? 'Não foi possível salvar a coleta');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedPond, selectedCycle, selectedUser, isOnline, navigation, syncNow],
  );

  // Watch values for NumericInput display
  const oxygenValue = watch('oxygenMgL');
  const phValue = watch('ph');
  const tempValue = watch('temperatureC');
  const salinityValue = watch('salinityPpt');
  const ammoniaValue = watch('ammoniaMgL');

  return (
    <ScreenWrapper
      keyboardAvoiding
      keyboardBehavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Card variant="outlined" padding={4} style={{ marginBottom: spacing[3] }}>
        <CardContent>
          <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.text.muted, marginBottom: spacing[1] }}>
            Identificação
          </Text>
          
          <PondSelector
            value={selectedPond}
            onChange={(pond) => {
              setSelectedPond(pond);
              setSelectedCycle(null);
            }}
          />
          <Spacer size={3} />
          <CycleSelector
            pondId={selectedPond?.id ?? null}
            value={selectedCycle}
            onChange={setSelectedCycle}
          />
        </CardContent>
      </Card>

      <Card variant="outlined" padding={4} style={{ marginBottom: spacing[3] }}>
        <CardContent>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] }}>
            <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.text.muted }}>
              Parâmetros Principais
            </Text>
            <Badge variant="info" size="sm" dot dotColor={colors.primary[400]}>
              Prioritários
            </Badge>
          </View>

          <NumericInput
            label="Oxigênio (O₂)"
            unit="mg/L"
            value={oxygenValue}
            onChange={(val) => setValue('oxygenMgL', val as any, { shouldValidate: true })}
            min={0}
            max={20}
            step={0.1}
            decimals={1}
            size="lg"
            disabled={submitting}
            error={errors.oxygenMgL?.message}
          />
          <Spacer size={3} />
          <NumericInput
            label="pH"
            unit=""
            value={phValue}
            onChange={(val) => setValue('ph', val as any, { shouldValidate: true })}
            min={0}
            max={14}
            step={0.1}
            decimals={1}
            size="lg"
            disabled={submitting}
            error={errors.ph?.message}
          />
          <Spacer size={3} />
          <NumericInput
            label="Temperatura"
            unit="°C"
            value={tempValue}
            onChange={(val) => setValue('temperatureC', val as any, { shouldValidate: true })}
            min={0}
            max={45}
            step={0.1}
            decimals={1}
            size="lg"
            disabled={submitting}
            error={errors.temperatureC?.message}
          />
        </CardContent>
      </Card>

      <Card variant="outlined" padding={4} style={{ marginBottom: spacing[3] }}>
        <CardContent>
          <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.text.muted, marginBottom: spacing[2] }}>
            Parâmetros Adicionais
          </Text>

          <NumericInput
            label="Salinidade"
            unit="ppt"
            value={salinityValue}
            onChange={(val) => setValue('salinityPpt', val as any, { shouldValidate: true })}
            min={0}
            max={60}
            step={1}
            decimals={0}
            size="md"
            disabled={submitting}
            error={errors.salinityPpt?.message}
          />
          <Spacer size={3} />
          <NumericInput
            label="Amônia"
            unit="mg/L"
            value={ammoniaValue}
            onChange={(val) => setValue('ammoniaMgL', val as any, { shouldValidate: true })}
            min={0}
            max={10}
            step={0.01}
            decimals={2}
            size="md"
            disabled={submitting}
            error={errors.ammoniaMgL?.message}
          />
        </CardContent>
      </Card>

      <Card variant="outlined" padding={4} style={{ marginBottom: spacing[3] }}>
        <CardContent>
          <Text style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: typography.letterSpacing.widest, textTransform: 'uppercase', color: colors.text.muted, marginBottom: spacing[2] }}>
            Metadados
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Responsável <Text style={styles.required}>*</Text>
            </Text>
            <ResponsibleSelector value={selectedUser} onChange={setSelectedUser} />
          </View>

          <Controller
            control={control}
            name="measuredAt"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data/Hora da Coleta</Text>
                <TextInput
                  style={[styles.input, errors.measuredAt && styles.inputError]}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholderTextColor={colors.text.muted}
                  placeholder="YYYY-MM-DDTHH:MM"
                />
                {errors.measuredAt && <Text style={styles.errorText}>{errors.measuredAt.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="origin"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Origem</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, field.value === 'MANUAL' && styles.toggleBtnActive]}
                    onPress={() => field.onChange('MANUAL')}
                  >
                    <Text style={[styles.toggleText, field.value === 'MANUAL' && styles.toggleTextActive]}>Manual</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, field.value === 'VOZ' && styles.toggleBtnActive]}
                    onPress={() => field.onChange('VOZ')}
                  >
                    <Text style={[styles.toggleText, field.value === 'VOZ' && styles.toggleTextActive]}>Voz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Período</Text>
                <View style={styles.toggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, field.value === 'MORNING' && styles.toggleBtnActive]}
                    onPress={() => field.onChange('MORNING')}
                  >
                    <Text style={[styles.toggleText, field.value === 'MORNING' && styles.toggleTextActive]}>Manhã</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, field.value === 'AFTERNOON' && styles.toggleBtnActive]}
                    onPress={() => field.onChange('AFTERNOON')}
                  >
                    <Text style={[styles.toggleText, field.value === 'AFTERNOON' && styles.toggleTextActive]}>Tarde</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </CardContent>
      </Card>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📡 Modo offline — dados serão sincronizados quando houver conexão</Text>
        </View>
      )}

      <Button
        variant="primary"
        size="xl"
        fullWidth
        loading={submitting}
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
      >
        {isOnline ? 'Registrar Coleta' : 'Salvar Offline'}
      </Button>
    </ScreenWrapper>
  );
}

const styles = {
  inputGroup: { marginBottom: spacing[4] },
  label: { color: colors.text.secondary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[1] },
  required: { color: colors.error.light },
  input: {
    backgroundColor: colors.neutral[800],
    borderWidth: 1,
    borderColor: colors.neutral[700],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
  },
  inputError: { borderColor: colors.error.light },
  errorText: { color: colors.error.light, fontSize: typography.fontSize.xs, marginTop: spacing[1] },
  toggle: { flexDirection: 'row' as const, backgroundColor: colors.neutral[800], borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.neutral[700], overflow: 'hidden' as const },
  toggleBtn: { flex: 1, paddingVertical: spacing[3], alignItems: 'center' as const },
  toggleBtnActive: { backgroundColor: colors.primary[400] },
  toggleText: { color: colors.text.muted, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  toggleTextActive: { color: colors.text.onPrimary },
  offlineBanner: { backgroundColor: colors.neutral[800], borderLeftWidth: 3, borderLeftColor: colors.warning.light, borderRadius: borderRadius.md, padding: spacing[3], marginBottom: spacing[4] },
  offlineText: { color: colors.warning.light, fontSize: typography.fontSize.sm },
};