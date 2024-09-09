import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import AppRouter from "@/app/router/AppRouter"
import { socket } from "@/shared/plugins"

const App = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server:", socket.id)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from the server")
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
