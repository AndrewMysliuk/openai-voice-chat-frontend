import { useParams } from "react-router-dom"
import { useWebRTC } from "@/shared/hooks"

interface ILayoutStyle {
  width: string
  height: string
}

function layout(clientsNumber = 1): ILayoutStyle[] {
  const pairs = Array.from({ length: clientsNumber }).reduce<ILayoutStyle[][]>((acc, _, index, arr) => {
    if (index % 2 === 0) {
      acc.push(arr.slice(index, index + 2) as unknown as ILayoutStyle[])
    }
    return acc
  }, [])

  const rowsNumber = pairs.length
  const height = `${100 / rowsNumber}%`

  return pairs
    .map((row, index, arr) => {
      if (index === arr.length - 1 && row.length === 1) {
        return [
          {
            width: "100%",
            height,
          },
        ]
      }

      return row.map(() => ({
        width: "50%",
        height,
      }))
    })
    .flat()
}

const RoomWidget = () => {
  const { id: roomId } = useParams<string>()
  const { clients, provideMediaRef } = useWebRTC(String(roomId))
  const videoLayout = layout(clients.length)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        height: "100vh",
      }}
    >
      {clients.map((clientID, index) => {
        return (
          <div key={clientID} style={videoLayout[index]} id={clientID}>
            <video
              width="100%"
              height="100%"
              ref={(instance) => {
                provideMediaRef(clientID, instance)
              }}
              autoPlay
              playsInline
              muted={clientID === "LOCAL_VIDEO"}
            />
          </div>
        )
      })}
    </div>
  )
}

export default RoomWidget
