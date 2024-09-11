import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useWebRTC } from "@/shared/hooks"
import { VideoContentTypeEnum } from "@/shared/types"
import { ParticipantControls } from "@/shared/components"

const RoomWidget = () => {
  const { id: roomId } = useParams<string>()
  const { clients, provideMediaRef, toggleAudio, toggleVideo, leaveRoom } = useWebRTC(String(roomId))

  const getRoomClass = () => {
    if (clients.length === 1) return "room --single"
    if (clients.length === 2) return "room --double"
    if (clients.length === 3) return "room --triple"
    if (clients.length >= 4) return "room --quadruple"
  }

  const localClientID = useMemo(() => {
    return clients.find((id) => id === VideoContentTypeEnum.LOCAL_VIDEO) ?? null
  }, [clients])

  return (
    <div className={getRoomClass()}>
      {clients.map((clientID) => {
        return (
          <div key={clientID} className="room__container" id={clientID}>
            <video
              className="room__video"
              ref={(instance) => {
                provideMediaRef(clientID, instance)
              }}
              autoPlay
              playsInline
              muted={clientID === localClientID}
            />
          </div>
        )
      })}

      {localClientID && (
        <ParticipantControls
          clientID={localClientID}
          onMute={() => toggleAudio()}
          onDisableCamera={() => toggleVideo()}
          onExitCall={() => leaveRoom()}
        />
      )}
    </div>
  )
}

export default RoomWidget
