import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "@/shared/plugins"
import { SocketActionsEnum } from "@/shared/types"
import { VButton } from "@/shared/ui"
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
      <main className="page__container">
        <div className="page__btn">
          <VButton title="Create New Room" clickValue={createRoomHandler} />
        </div>

        <h1 className="page__title">Available Rooms Below</h1>

        <ul className="page__list">
          {rooms.map((roomId) => (
            <li className="page__list-point" key={roomId}>
              <p>
                <strong>Room:</strong> {roomId}
              </p>
              <VButton title="Join Room" clickValue={() => joinRoomHandler(roomId)} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default MainWidget
