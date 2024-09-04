import { useActions } from "@/shared/hooks"
import { VButton } from "@/shared/ui"

const LoginWidget = () => {
  const { setUserLogin } = useActions()

  const loginAction = () => {
    setUserLogin(true)
  }

  return (
    <div className="page">
      <h1>Login Page</h1>

      <br />

      <VButton title="Login Action" clickValue={loginAction} />
    </div>
  )
}

export default LoginWidget
