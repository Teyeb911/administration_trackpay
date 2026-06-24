import { NextRequest } from "next/server"

import { getPartnerApiBaseUrl } from "@/lib/partner-portal/api"

export const dynamic = "force-dynamic"

type PartnerApiContext = {
  params: Promise<{
    path: string[]
  }>
}

function getFetchErrorDetail(error: unknown) {
  if (!(error instanceof Error)) {
    return "Upstream request failed"
  }

  const cause = "cause" in error ? error.cause : undefined

  if (cause && typeof cause === "object" && "code" in cause) {
    return `Upstream request failed: ${String(cause.code)}`
  }

  return error.message || "Upstream request failed"
}

async function proxyPartnerRequest(request: NextRequest, context: PartnerApiContext) {
  const apiKey = request.headers.get("x-api-key")

  if (!apiKey) {
    return Response.json({ detail: "Missing X-API-Key header" }, { status: 401 })
  }

  const { path } = await context.params
  const upstreamUrl = new URL(`/${path.join("/")}/`, getPartnerApiBaseUrl())
  upstreamUrl.search = request.nextUrl.search
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text()

  let upstream: Response

  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        "X-API-Key": apiKey,
      },
      body,
      cache: "no-store",
    })
  } catch (error) {
    return Response.json(
      {
        detail: getFetchErrorDetail(error),
        upstream: upstreamUrl.origin,
      },
      { status: 502 }
    )
  }

  const responseBody = await upstream.arrayBuffer()
  const headers = new Headers()
  const contentType = upstream.headers.get("content-type")

  if (contentType) {
    headers.set("content-type", contentType)
  }

  return new Response(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}

export async function GET(request: NextRequest, context: PartnerApiContext) {
  return proxyPartnerRequest(request, context)
}

export async function POST(request: NextRequest, context: PartnerApiContext) {
  return proxyPartnerRequest(request, context)
}

export async function PUT(request: NextRequest, context: PartnerApiContext) {
  return proxyPartnerRequest(request, context)
}

export async function DELETE(request: NextRequest, context: PartnerApiContext) {
  return proxyPartnerRequest(request, context)
}
