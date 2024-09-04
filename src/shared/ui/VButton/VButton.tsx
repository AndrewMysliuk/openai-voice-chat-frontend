import { FC } from "react"
import "./VButton.scss"

interface VButtonProps {
  type?: "button" | "submit" | "reset"
  title: string
  clickValue?: () => void
}

const VButton: FC<VButtonProps> = ({ type = "button", title, clickValue }) => {
  return (
    <button onClick={clickValue} type={type} className={`v-button`}>
      <div className="v-button__title">{title}</div>
    </button>
  )
}

export default VButton
