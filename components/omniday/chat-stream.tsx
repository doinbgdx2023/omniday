"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download } from "lucide-react"
import type { ChatMessage } from "./types"

type Props = {
  messages: ChatMessage[]
  onDownload?: (src: string) => void
}

export function ChatStream({ messages, onDownload }: Props) {
  return (
    <div className="flex flex-col gap-4 px-5 pb-4">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className={m.kind === "photo" ? "flex justify-end" : "flex justify-start"}
          >
            {m.kind === "photo" && (
              <div className="w-[140px] overflow-hidden rounded-2xl border-2 border-card bg-blue-50 shadow-sm">
                <img
                  src={m.src || "/placeholder.svg"}
                  alt="已发送的生活照"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            )}

            {m.kind === "system" && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1 pl-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground/50"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <p className="max-w-[240px] rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed text-foreground">
                  {m.text}
                </p>
              </div>
            )}

            {m.kind === "result" && (
              <div className="w-[200px] rounded-2xl bg-muted p-3">
                <p className="pb-2 text-sm font-medium text-foreground">
                  {m.label}
                </p>
                <div className="relative overflow-hidden rounded-xl bg-card">
                  <img
                    src={m.src || "/placeholder.svg"}
                    alt="生成的二次元形象"
                    className="aspect-square w-full object-cover"
                  />
                  {onDownload && (
                    <button
                      type="button"
                      onClick={() => onDownload(m.src)}
                      className="absolute bottom-1.5 left-1.5 flex size-5 items-center justify-center rounded-md bg-[oklch(0.62_0.2_295)]/15 text-[oklch(0.55_0.2_295)]"
                      aria-label="下载图片"
                    >
                      <Download className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
