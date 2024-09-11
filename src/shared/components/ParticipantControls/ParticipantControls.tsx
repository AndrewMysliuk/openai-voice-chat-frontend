import { FC, useState } from "react"
import "./ParticipantControls.scss"

interface ParticipantControlsProps {
  clientID: string
  onMute: (clientID: string, isMuted: boolean) => void
  onDisableCamera: (clientID: string, isCameraDisabled: boolean) => void
  onExitCall: (clientID: string) => void
}

const ParticipantControls: FC<ParticipantControlsProps> = ({ clientID, onMute, onDisableCamera, onExitCall }) => {
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraDisabled, setIsCameraDisabled] = useState(false)

  const handleMute = () => {
    setIsMuted(!isMuted)
    onMute(clientID, !isMuted)
  }

  const handleDisableCamera = () => {
    setIsCameraDisabled(!isCameraDisabled)
    onDisableCamera(clientID, !isCameraDisabled)
  }

  const handleExitCall = () => {
    onExitCall(clientID)
  }

  return (
    <div className="participant-controls">
      <button type="button" className={`participant-controls__btn --microphone ${isMuted ? "--active" : ""}`} onClick={handleMute} />
      <button
        type="button"
        className={`participant-controls__btn --video ${isCameraDisabled ? "--active" : ""}`}
        onClick={handleDisableCamera}
      />
      <button type="button" className="participant-controls__btn --exit --active" onClick={handleExitCall} />
    </div>
  )
}

export default ParticipantControls
