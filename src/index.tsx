import ReactDOM from "react-dom/client"
import "@/app/styles/main.scss"
import App from "@/app/App"
import { Provider } from "react-redux"
import { store } from "@/shared/store"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
