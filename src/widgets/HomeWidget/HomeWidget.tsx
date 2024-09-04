import { useActions } from "@/shared/hooks"
import { VButton } from "@/shared/ui"

const HomeWidget = () => {
  const { setUserLogin } = useActions()

  const logoutAction = () => {
    setUserLogin(false)
  }

  return (
    <div className="page">
      <h1>Home Page</h1>

      <br />

      <VButton title="Logout Action" clickValue={logoutAction} />
    </div>
  )
}

export default HomeWidget
