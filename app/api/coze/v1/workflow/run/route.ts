import { NextResponse } from "next/server"

const COZE_BASE = "https://api.coze.cn"

const workflowId = process.env.COZE_WORKFLOW_ID
const prompt = process.env.COZE_PROMPT

/**
 * 第二步：调用工作流，返回生成的图片 data4
 * POST /api/coze/v1/workflow/run
 */
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { input, file_id } = body

    if (!input || !file_id) {
      return NextResponse.json(
        { error: "缺少必要参数：input 或 file_id" },
        { status: 400 }
      )
    }

    if (!workflowId) {
      return NextResponse.json(
        { error: "服务端配置缺失，请联系管理员" },
        { status: 500 }
      )
    }

    const apiToken = process.env.COZE_API_TOKEN
    const res = await fetch(`${COZE_BASE}/v1/workflow/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: {
          input,
          prompt: prompt ?? "",
          me: JSON.stringify({ file_id }),
        },
      }),
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
      console.error("❌ Coze workflow error:", { status: res.status, body: json })
      return NextResponse.json(
        { error: (json as { msg?: string }).msg || `工作流执行失败 (${res.status})` },
        { status: 502 }
      )
    }

    // 解析 data 字段（可能是字符串化的 JSON）
    const rawData = (json as { data: unknown }).data
    const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData
    const imageUrl = data?.data4

    if (!imageUrl) {
      console.error("❌ 响应缺少 data4:", JSON.stringify(json).slice(0, 500))
      return NextResponse.json(
        { error: "生成结果为空，请稍后再试" },
        { status: 502 }
      )
    }

    return NextResponse.json({ image: imageUrl })
  } catch {
    return NextResponse.json(
      { error: "服务器内部错误，请稍后再试" },
      { status: 500 }
    )
  }
}
