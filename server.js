import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const app = express()
const port = process.env.PORT || 8080

// ES Module에서 __dirname 사용을 위한 설정
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "dist")))

// 헬스체크 엔드포인트 (EB용)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  })
})

// SPA를 위한 fallback - Vue Router 지원
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"))
})

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({ error: "Internal Server Error" })
})

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📁 Serving from: ${path.join(__dirname, "dist")}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
})
