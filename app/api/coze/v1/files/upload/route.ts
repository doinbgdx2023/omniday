import { NextResponse } from "next/server"

const COZE_BASE = "https://api.coze.cn"

/** 通用 Coze 请求转发，自动注入 Token */
async function cozeFetch(path: string, options: RequestInit = {}) {
  const apiToken = process.env.COZE_API_TOKEN
  if (!apiToken) {
    return NextResponse.json(
      { error: "服务端配置缺失，请联系管理员" },
      { status: 500 }
    )
  }

  const res = await fetch(`${COZE_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      ...(options.headers ?? {}),
    },
  })

  const text = await res.text()
  let json: Record<string, unknown>
  try {
    json = JSON.parse(text)
  } catch {
    return NextResponse.json(
      { error: `Coze 返回非 JSON 响应 (${res.status})` },
      { status: 502 }
    )
  }

  if (res.status !== 200 || (json as { code?: number }).code !== 0) {
    console.error(`❌ Coze ${path} error:`, { status: res.status, body: json })
    return NextResponse.json(
      { error: (json as { msg?: string }).msg || `Coze 请求失败 (${res.status})` },
      { status: 502 }
    )
  }

  return json
}

/**
 * 第一步：上传图片文件，返回 file_id
 * POST /api/coze/v1/files/upload
 */
export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "缺少文件参数" },
        { status: 400 }
      )
    }

    const cozeFormData = new FormData()
    cozeFormData.append("file", file)

    const result = await cozeFetch("/v1/files/upload", {
      method: "POST",
      body: cozeFormData,
    })

    if (result instanceof NextResponse) return result // error

    return NextResponse.json({ file_id: (result as { data: { id: string } }).data.id })
  } catch {
    return NextResponse.json(
      { error: "图片上传失败，请稍后再试" },
      { status: 500 }
    )
  }
}
