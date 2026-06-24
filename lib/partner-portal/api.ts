function getApiOrigin(value: string | undefined) {
  if (!value) {
    return undefined
  }

  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

export const PARTNER_API_BASE_URL =
  process.env.NEXT_PUBLIC_PARTNER_API_BASE_URL ??
  getApiOrigin(process.env.NEXT_PUBLIC_API_URL) ??
  "https://trackpay.mr"
export const PARTNER_API_PROXY_PREFIX = "/partner-api"
export const PARTNER_KEY_STORAGE = "partner_key"

export function getPartnerApiBaseUrl() {
  return (
    process.env.PARTNER_API_BASE_URL ??
    process.env.NEXT_PUBLIC_PARTNER_API_BASE_URL ??
    getApiOrigin(process.env.NEXT_PUBLIC_API_URL) ??
    PARTNER_API_BASE_URL
  )
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: unknown
}

type PartnerApiErrorPayload = {
  detail?: string
  upstream?: string
}

async function readErrorPayload(response: Response) {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return null
  }

  try {
    return (await response.json()) as PartnerApiErrorPayload
  } catch {
    return null
  }
}

export async function partnerRequest<T>(
  path: string,
  apiKey: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`${PARTNER_API_PROXY_PREFIX}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const payload = await readErrorPayload(response)
    const error = new Error(payload?.detail ?? (response.status === 401 ? "unauthorized" : "request_failed"))
    error.name = String(response.status)
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function getPartnerKey() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem(PARTNER_KEY_STORAGE)
}

export function setPartnerKey(apiKey: string) {
  window.localStorage.setItem(PARTNER_KEY_STORAGE, apiKey)
}

export function clearPartnerKey() {
  window.localStorage.removeItem(PARTNER_KEY_STORAGE)
}
