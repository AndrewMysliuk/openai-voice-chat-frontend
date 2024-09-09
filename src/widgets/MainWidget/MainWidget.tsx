import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "@/shared/plugins"
import { SocketActionsEnum } from "@/shared/types"
import { v4 } from "uuid"

const MainWidget = () => {
  const navigate = useNavigate()
  const [rooms, updateRooms] = useState([])
  const rootNode = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    socket.on(SocketActionsEnum.SHARE_ROOMS, ({ rooms = [] } = {}) => {
      if (rootNode.current) {
        updateRooms(rooms)
      }
    })
  }, [])

  const createRoomHandler = () => {
    navigate(`/room/${v4()}`)
  }

  const joinRoomHandler = (roomId: string) => {
    navigate(`/room/${roomId}`)
  }

  return (
    <div className="page" ref={rootNode}>
      <h1>Available Rooms</h1>
      <button type="button" onClick={createRoomHandler}>
        Create New Room
      </button>

      <ul>
        {rooms.map((roomId) => (
          <li key={roomId}>
            {roomId}
            <button type="button" onClick={() => joinRoomHandler(roomId)}>
              Join Room
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MainWidget
