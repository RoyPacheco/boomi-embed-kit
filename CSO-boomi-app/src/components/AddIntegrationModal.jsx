import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, ChevronDown } from 'lucide-react'
import { createIntegration, getAvailableIntegrations, getEnvironments } from '../services/api.js'

// Note: EmbedKitProvider / useFetchEnvironments / useEmbedKit are NOT exported by the
// @boomi-demo/embedkit-cdn CDN build. Environment and integration pack data is fetched
// via the Express proxy routes (/api/environments, /api/available-integrations) instead.

// ── Styled select wrapper ──────────────────────────────────────────
function SelectField({ id, value, onChange, onBlur, disabled, placeholder, options, isLoading, error }) {
  const empty = !value

  return (
    <div style={{ position: 'relative' }}>
      <select
        id={id}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled || isLoading}
        style={{
          width: '100%',
          padding: '13px 44px 13px 16px',
          border: `1.5px solid ${error ? '#EF4444' : '#BFDBFE'}`,
          borderRadius: '8px',
          fontSize: '15px',
          color: empty || disabled ? '#9CA3AF' : '#111827',
          backgroundColor: disabled ? '#EFF6FF' : '#FFFFFF',
          outline: 'none',
          fontFamily: 'inherit',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          transition: 'border-color 150ms ease, background-color 150ms ease',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#3B82F6' }}
        onBlurCapture={(e) => { e.target.style.borderColor = error ? '#EF4444' : '#BFDBFE' }}
      >
        <option value="" disabled>
          {isLoading ? 'Loading…' : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: disabled ? '#9CA3AF' : '#3B82F6',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ChevronDown size={18} strokeWidth={2.5} />
      </div>
    </div>
  )
}

// ── Field label ────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '8px',
      }}
    >
      {children}
      {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

// ── Modal ──────────────────────────────────────────────────────────
export default function AddIntegrationModal({ onClose, onToast, defaultValues }) {
  const queryClient = useQueryClient()

  const { control, register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { integrationId: '', environmentId: '', name: '', ...(defaultValues || {}) },
  })

  const selectedIntegration = watch('integrationId')

  // ── Fetch available integration packs via Express proxy ────────────
  const { data: packsData, isLoading: loadingPacks } = useQuery({
    queryKey: ['available-integrations'],
    queryFn: getAvailableIntegrations,
  })

  // ── Fetch environments via Express proxy ───────────────────────────
  const { data: envsData, isLoading: loadingEnvs, error: envsError } = useQuery({
    queryKey: ['environments'],
    queryFn: getEnvironments,
  })

  const integrationOptions = normaliseOptions(packsData, 'id', 'name')
  const environmentOptions = normaliseOptions(envsData, 'id', 'name')

  // ── Create integration mutation ────────────────────────────────────
  const mutation = useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      onToast({ type: 'success', message: 'Integration created successfully.' })
      onClose()
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to create integration.'
      onToast({ type: 'error', message: msg })
    },
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(100,116,139,.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 8px 40px rgba(0,0,0,.18)',
          border: '1.5px solid #BFDBFE',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
          }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', lineHeight: 1.2 }}>
            Add Integration
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#3B82F6',
              padding: '2px',
              display: 'flex',
              borderRadius: '4px',
              marginTop: '2px',
            }}
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.55', marginBottom: '28px' }}>
          Add a new integration to your environment. Note: This will not deploy the
          integration, it will only create the integration instance.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Available Integration */}
          <div>
            <FieldLabel htmlFor="integrationId" required>
              Available Integration
            </FieldLabel>
            <Controller
              name="integrationId"
              control={control}
              rules={{ required: 'Please select an integration' }}
              render={({ field }) => (
                <SelectField
                  id="integrationId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Please select"
                  options={integrationOptions}
                  isLoading={loadingPacks}
                  error={errors.integrationId}
                />
              )}
            />
            {errors.integrationId && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>
                {errors.integrationId.message}
              </p>
            )}
          </div>

          {/* Environment — disabled until an integration pack is chosen */}
          <div>
            <FieldLabel htmlFor="environmentId" required>
              Environment
            </FieldLabel>
            <Controller
              name="environmentId"
              control={control}
              rules={{ required: 'Please select an environment' }}
              render={({ field }) => (
                <SelectField
                  id="environmentId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Please select"
                  options={environmentOptions}
                  isLoading={loadingEnvs}
                  disabled={!selectedIntegration}
                  error={errors.environmentId}
                />
              )}
            />
            {envsError && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>
                Failed to load environments.
              </p>
            )}
            {errors.environmentId && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>
                {errors.environmentId.message}
              </p>
            )}
          </div>

          {/* Integration Name */}
          <div>
            <FieldLabel htmlFor="name" required>
              Integration Name
            </FieldLabel>
            <input
              id="name"
              {...register('name', { required: 'Integration name is required' })}
              style={{
                width: '100%',
                padding: '13px 16px',
                border: `1.5px solid ${errors.name ? '#EF4444' : '#BFDBFE'}`,
                borderRadius: '8px',
                fontSize: '15px',
                color: '#111827',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = errors.name ? '#EF4444' : '#BFDBFE')}
            />
            {errors.name && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '5px' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '4px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '11px 24px',
                backgroundColor: '#EFF6FF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                padding: '11px 24px',
                backgroundColor: mutation.isPending ? '#93C5FD' : '#1E3A8A',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#FFFFFF',
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (!mutation.isPending) e.currentTarget.style.backgroundColor = '#1E40AF'
              }}
              onMouseLeave={(e) => {
                if (!mutation.isPending) e.currentTarget.style.backgroundColor = '#1E3A8A'
              }}
            >
              {mutation.isPending ? 'Creating…' : 'Create Integration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Helper: normalise various Boomi API response shapes ────────────
function normaliseOptions(raw, valueKey = 'id', labelKey = 'name') {
  if (!raw) return []
  const list = Array.isArray(raw)
    ? raw
    : raw.result ?? raw.data ?? raw.integrationPacks ?? raw.environments ?? []
  return list.map((item) => ({
    value: item[valueKey] ?? item.id ?? '',
    label: item[labelKey] ?? item.name ?? '',
  }))
}
