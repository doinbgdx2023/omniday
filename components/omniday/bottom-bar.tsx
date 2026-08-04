"use client"

import { ChevronDown, ImagePlus } from "lucide-react"
import { STATUS_WORDS } from "./types"

type Props = {
  status: string
  onStatusChange: (v: string) => void
  onGenerate: () => void
  generating: boolean
  hasPhoto: boolean
  onPickImage: () => void
}

export function BottomBar({
  status,
  onStatusChange,
  onGenerate,
  generating,
  hasPhoto,
  onPickImage,
}: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 pb-5">
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {STATUS_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onStatusChange(w)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              status === w
                ? "border-[oklch(0.55_0.2_295)] bg-[oklch(0.62_0.2_295)]/10 text-[oklch(0.5_0.2_295)]"
                : "border-border bg-card text-foreground"
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
        <input
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              onGenerate()
            }
          }}
          placeholder="现在在做什么？"
          className="w-full bg-transparent px-1 py-1 text-base text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="状态词"
        />
        <div className="flex items-center justify-between gap-2 pt-3">
          <button
            type="button"
            onClick={onPickImage}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              hasPhoto
                ? "bg-[oklch(0.62_0.2_295)]/15 text-[oklch(0.55_0.2_295)]"
                : "bg-muted text-muted-foreground"
            }`}
            aria-label="重新导入图片"
          >
            <ImagePlus className="size-4" />
          </button>
          <button
            type="button"
            className="mr-auto flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-xs text-foreground"
          >
            Omniday-workflow 1.0
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="rounded-full bg-[oklch(0.58_0.23_295)] px-7 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-45"
          >
            生成
          </button>
        </div>
      </div>
    </div>
  )
}
