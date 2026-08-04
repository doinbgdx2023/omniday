"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { BottomBar } from "@/components/omniday/bottom-bar"
import { ChatStream } from "@/components/omniday/chat-stream"
import { ImageStage } from "@/components/omniday/image-stage"
import {
  MOCK_PHOTO,
  type ChatMessage,
} from "@/components/omniday/types"

/** 下载图片到本地（手机保存到相册） */
async function downloadImage(src: string, filename = "omniday-result.png") {
  try {
    const res = await fetch(src)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    // fallback: 新窗口打开
    window.open(src, "_blank")
  }
}

export default function Page() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [status, setStatus] = useState("睡觉")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [generating, setGenerating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const generatingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** 点击底部 icon 触发文件选择器 */
  const handlePickImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  const handleGenerate = useCallback(async () => {
    if (generatingRef.current || !status.trim()) return
    generatingRef.current = true
    setGenerating(true)

    const src = photo ?? MOCK_PHOTO
    const waitId = `wait-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: `photo-${Date.now()}`, kind: "photo", src },
      { id: waitId, kind: "system", text: "请稍候，预计等待2分钟左右" },
    ])

    try {
      // Step 1: 准备文件 — 用户上传了图片就用上传的，否则用默认 sample
      let imageFile: File
      if (photo) {
        const res = await fetch(photo)
        const blob = await res.blob()
        imageFile = new File([blob], "photo.png", { type: blob.type })
      } else {
        const res = await fetch(MOCK_PHOTO)
        const blob = await res.blob()
        imageFile = new File([blob], "sample-life.webp", { type: blob.type })
      }

      // Step 2: 上传图片 → 获取 file_id
      const uploadForm = new FormData()
      uploadForm.append("file", imageFile)

      const uploadRes = await fetch("/api/coze/v1/files/upload", {
        method: "POST",
        body: uploadForm,
      })

      if (!uploadRes.ok) {
        const { error } = await uploadRes.json().catch(() => ({ error: "上传失败" }))
        throw new Error(error || `图片上传失败 (${uploadRes.status})`)
      }

      const { file_id } = await uploadRes.json()
      if (!file_id) {
        throw new Error("未获取到文件 ID")
      }

      // Step 3: 调用工作流
      const workflowRes = await fetch("/api/coze/v1/workflow/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: status.trim(),
          file_id,
        }),
      })

      if (!workflowRes.ok) {
        const { error } = await workflowRes.json().catch(() => ({ error: "未知错误" }))
        throw new Error(error || `工作流调用失败 (${workflowRes.status})`)
      }

      const { image } = await workflowRes.json()

      if (!image) {
        throw new Error("生成结果为空")
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== waitId),
        {
          id: `result-${Date.now()}`,
          kind: "result",
          src: image,
          label: "完成",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== waitId),
        {
          id: `error-${Date.now()}`,
          kind: "system",
          text: "生成失败，稍后再试",
        },
      ])
    } finally {
      generatingRef.current = false
      setGenerating(false)
      setPhoto(null)
    }
  }, [status, photo])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/50 sm:p-6">
      <div className="flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-background sm:h-[860px] sm:rounded-[2.5rem] sm:shadow-xl">
        <header className="shrink-0 relative flex items-center justify-center pt-8 pb-2">
          <h1 className="text-base font-bold tracking-[0.18em] text-foreground">
            OMNIDAY
          </h1>
        </header>

        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto overscroll-y-contain scrollbar-none">
          {/* 全局 file input，始终存在于 DOM 中 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setPhoto(URL.createObjectURL(file))
              e.target.value = ""
            }}
            className="hidden"
            aria-hidden="true"
          />

          {/* 首次使用显示 ImageStage，有聊天记录后永久隐藏 */}
          {messages.length === 0 && (
            <motion.div
              key="stage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className="my-auto"
            >
              <ImageStage
                photo={photo}
                onPick={(src) => {
                  setPhoto(src)
                }}
                onTriggerFilePicker={handlePickImage}
              />
            </motion.div>
          )}

          <ChatStream
            messages={messages}
            onDownload={(src) => downloadImage(src)}
          />
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0">
          <BottomBar
            status={status}
            onStatusChange={setStatus}
            onGenerate={handleGenerate}
            generating={generating}
            hasPhoto={photo !== null}
            onPickImage={handlePickImage}
          />
        </div>
      </div>
    </main>
  )
}
