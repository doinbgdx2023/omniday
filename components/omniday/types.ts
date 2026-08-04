export type ChatMessage =
  | { id: string; kind: "photo"; src: string }
  | { id: string; kind: "system"; text: string }
  | { id: string; kind: "result"; src: string; label: string }

export const STATUS_WORDS = [
  "睡觉",
  "打游戏",
  "沐浴",
  "贴贴",
  "运动",
  "通勤",
  "免打扰",
  "摸鱼",
  "学习",
] as const

export const MOCK_PHOTO = "/sample-bg.png"
export const MOCK_RESULT_GAME = "/sample-result-game.png"
export const MOCK_RESULT_SLEEP = "/mock-result-sleep.png"

export function pickResult(status: string) {
  return status.includes("游戏") || status.includes("摸鱼")
    ? MOCK_RESULT_GAME
    : MOCK_RESULT_SLEEP
}
