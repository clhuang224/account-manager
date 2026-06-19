import { computed, ref, shallowRef, unref } from 'vue'
import type { ComputedRef, Ref, ShallowRef } from 'vue'

export interface ValidatorResult {
  valid: boolean
  message?: string
  key?: string
}

export type ValidatorReturn = boolean | ValidatorResult
export type GuardReturn = boolean | ValidatorResult
export type Validator<TPayload> = (payload?: TPayload) => ValidatorReturn
export type Guard<TPayload> = (payload?: TPayload) => GuardReturn
export type ActionConcurrency = 'exhaust' | 'latest'
export type ActionDebounce = number | Ref<number> | ComputedRef<number>

type MaybePromise<T> = T | Promise<T>

export interface ActionOptions<TResult, TPayload> {
  action: (payload: TPayload) => MaybePromise<TResult>
  guards?: ReadonlyArray<Guard<TPayload>>
  validators?: ReadonlyArray<Validator<TPayload>>
  onValidateError?: (errors: ValidatorResult[], payload?: TPayload) => void
  onSuccess?: (result: TResult, payload?: TPayload) => MaybePromise<void>
  onError?: (error: unknown, payload?: TPayload) => MaybePromise<void>
  debounce?: ActionDebounce
  concurrency?: ActionConcurrency
}

export type ActionDispatch<TResult, TPayload> = [TPayload] extends [void]
  ? () => Promise<TResult | undefined>
  : (payload: TPayload) => Promise<TResult | undefined>

export interface ActionReturns<TResult, TPayload> {
  dispatch: ActionDispatch<TResult, TPayload>
  canDispatch: (payload?: TPayload) => boolean
  disabled: ComputedRef<boolean>
  loading: Ref<boolean>
  error: ShallowRef<unknown>
  currentPayload: ShallowRef<TPayload | undefined>
  lastPayload: ShallowRef<TPayload | undefined>
  isCurrentPayload: (payload?: TPayload | ((currentPayload?: TPayload) => boolean)) => boolean
  getErrors: (payload?: TPayload) => ValidatorResult[]
  validatorErrors: Ref<ValidatorResult[]>
}

function normalizeValidationResult(result: ValidatorReturn): ValidatorResult {
  if (typeof result === 'boolean') {
    return result ? { valid: true } : { valid: false, message: 'Invalid' }
  }

  return {
    valid: Boolean(result.valid),
    message: result.message,
    key: result.key,
  }
}

export function useAction<TResult, TPayload = void>({
  action,
  onSuccess,
  onError,
  guards = [],
  validators = [],
  onValidateError,
  debounce = 0,
  concurrency = 'exhaust',
}: ActionOptions<TResult, TPayload>): ActionReturns<TResult, TPayload> {
  const loading = ref(false)
  const error = shallowRef<unknown>()
  const lastPayload = shallowRef<TPayload>()
  const currentPayload = shallowRef<TPayload>()
  const validatorErrors = ref<ValidatorResult[]>([])

  const getGuardErrors = (payload?: TPayload) =>
    guards.map((guard) => normalizeValidationResult(guard(payload))).filter(({ valid }) => !valid)

  const getErrors = (payload?: TPayload) =>
    validators
      .map((validator) => normalizeValidationResult(validator(payload)))
      .filter(({ valid }) => !valid)

  const canDispatch = (payload?: TPayload) => {
    const isBlockedByLoading = concurrency === 'exhaust' && loading.value
    return (
      !isBlockedByLoading && getGuardErrors(payload).length === 0 && getErrors(payload).length === 0
    )
  }

  const disabled = computed(() => !canDispatch())

  const isCurrentPayload: ActionReturns<TResult, TPayload>['isCurrentPayload'] = (payload) => {
    if (!loading.value) return false
    if (typeof payload === 'function') {
      const predicate = payload as (currentPayload?: TPayload) => boolean
      return predicate(currentPayload.value)
    }
    if (payload === undefined) return true
    return currentPayload.value === payload
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  let resolvePending: ((result: TResult | undefined) => void) | undefined
  let currentId = 0

  const run = async (payload?: TPayload): Promise<TResult | undefined> => {
    lastPayload.value = payload

    if (concurrency === 'exhaust' && loading.value) return undefined
    if (getGuardErrors(payload).length > 0) return undefined

    validatorErrors.value = getErrors(payload)
    if (validatorErrors.value.length > 0) {
      onValidateError?.(validatorErrors.value, payload)
      return undefined
    }

    const id = ++currentId
    loading.value = true
    error.value = undefined
    currentPayload.value = payload

    try {
      const result = await action(payload as TPayload)
      if (id !== currentId) return undefined

      await onSuccess?.(result, payload)
      return result
    } catch (caughtError) {
      if (id !== currentId) return undefined

      error.value = caughtError
      await onError?.(caughtError, payload)
      return undefined
    } finally {
      if (id === currentId) {
        loading.value = false
        currentPayload.value = undefined
      }
    }
  }

  const dispatch = (payload?: TPayload): Promise<TResult | undefined> => {
    const wait = unref(debounce)
    if (!wait) return run(payload)

    if (timer) clearTimeout(timer)
    resolvePending?.(undefined)

    return new Promise((resolve) => {
      resolvePending = resolve
      timer = setTimeout(async () => {
        timer = undefined
        resolvePending = undefined
        resolve(await run(payload))
      }, wait)
    })
  }

  return {
    loading,
    error,
    lastPayload,
    currentPayload,
    isCurrentPayload,
    getErrors,
    canDispatch,
    disabled,
    validatorErrors,
    dispatch: dispatch as ActionDispatch<TResult, TPayload>,
  }
}
