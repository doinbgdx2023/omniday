"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { MOCK_PHOTO, MOCK_RESULT_GAME } from "./types"

type Props = {
  photo: string | null
  onPick: (src: string) => void
  onTriggerFilePicker: () => void
}

export function ImageStage({
  photo,
  onPick,
  onTriggerFilePicker,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewing, setPreviewing] = useState(false)

  /** 释放旧的 blob URL，防止内存泄漏 */
  useEffect(() => {
    return () => {
      if (photo && photo !== MOCK_PHOTO && photo.startsWith("blob:")) {
        URL.revokeObjectURL(photo)
      }
    }
  }, [photo])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onPick(URL.createObjectURL(file))
    e.target.value = ""
  }

  return (
    <div className="flex w-full items-center justify-center gap-3 px-5 py-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
      />

      <motion.button
        type="button"
        layout
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onClick={onTriggerFilePicker}
        className={`relative shrink-0 overflow-hidden rounded-3xl border border-border bg-card shadow-sm ${
          previewing ? "w-[86px] p-1 opacity-45" : "w-[240px] p-3"
        }`}
        aria-label={photo ? "更换图片" : "导入图片"}
      >
        <motion.div
          layout
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted"
        >
          <img
            src={photo ?? MOCK_PHOTO}
            alt="待转换的生活照"
            className="h-full w-full object-cover"
          />
          {!photo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40">
              <span className="flex size-9 items-center justify-center rounded-full bg-[oklch(0.62_0.2_295)]/15 text-[oklch(0.55_0.2_295)]">
                <Plus className="size-5" />
              </span>
              {!previewing && (
                <span className="text-sm font-medium text-foreground">
                  导入图片
                </span>
              )}
            </div>
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence mode="popLayout" initial={false}>
        {previewing ? (
          <motion.div
            key="result"
            layout
            initial={{ opacity: 0, x: 24, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative w-[212px] rounded-3xl border border-border bg-card p-2 shadow-sm"
          >
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-card">
              <img
                src={MOCK_RESULT_GAME}
                alt="示例生成结果"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setPreviewing(false)}
              className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-muted/90 text-muted-foreground"
              aria-label="关闭预览"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="hint"
            type="button"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewing(true)}
            className="flex shrink-0 flex-col items-center gap-1 px-1 text-[oklch(0.55_0.2_295)]"
          >
            <span className="text-lg leading-none tracking-tighter">{">>"}</span>
            <span className="text-xs">预览</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
