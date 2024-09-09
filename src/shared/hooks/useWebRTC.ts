import { useEffect, useRef, useCallback } from "react"
import freeice from "freeice"
import { useStateWithCallback } from "./useStateWithCallback"
import { socket } from "@/shared/plugins"
import { SocketActionsEnum } from "@/shared/types"

export const LOCAL_VIDEO = "LOCAL_VIDEO"

interface SessionDescription {
  type: string
  sdp: string
}

interface IceCandidate {
  candidate: string
  sdpMid?: string
  sdpMLineIndex?: number
}

export function useWebRTC(roomID: string) {
  const [clients, updateClients] = useStateWithCallback<string[]>([])

  const addNewClient = useCallback(
    (newClient: string, cb: () => void) => {
      updateClients((list) => {
        if (!list.includes(newClient)) {
          return [...list, newClient]
        }

        return list
      }, cb)
    },
    [updateClients]
  )

  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({})
  const localMediaStream = useRef<MediaStream | null>(null)
  const peerMediaElements = useRef<{ [key: string]: HTMLMediaElement | null }>({
    [LOCAL_VIDEO]: null,
  })

  useEffect(() => {
    async function handleNewPeer({ peerID, createOffer }: { peerID: string; createOffer: boolean }) {
      if (peerID in peerConnections.current) {
        return console.warn(`Already connected to peer ${peerID}`)
      }

      peerConnections.current[peerID] = new RTCPeerConnection({
        iceServers: freeice(),
      })

      peerConnections.current[peerID].onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(SocketActionsEnum.RELAY_ICE, {
            peerID,
            iceCandidate: event.candidate,
          })
        }
      }

      let tracksNumber = 0
      // @ts-ignore
      peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }: { streams: MediaStream[] }) => {
        tracksNumber++

        if (tracksNumber === 2) {
          // video & audio tracks received
          tracksNumber = 0
          addNewClient(peerID, () => {
            if (peerMediaElements.current[peerID]) {
              peerMediaElements.current[peerID]!.srcObject = remoteStream
            } else {
              let settled = false
              const interval = setInterval(() => {
                if (peerMediaElements.current[peerID]) {
                  peerMediaElements.current[peerID]!.srcObject = remoteStream
                  settled = true
                }

                if (settled) {
                  clearInterval(interval)
                }
              }, 1000)
            }
          })
        }
      }

      localMediaStream.current?.getTracks().forEach((track) => {
        peerConnections.current[peerID].addTrack(track, localMediaStream.current!)
      })

      if (createOffer) {
        const offer = await peerConnections.current[peerID].createOffer()
        await peerConnections.current[peerID].setLocalDescription(offer)

        socket.emit(SocketActionsEnum.RELAY_SDP, {
          peerID,
          sessionDescription: offer,
        })
      }
    }

    socket.on(SocketActionsEnum.ADD_PEER, handleNewPeer)

    return () => {
      socket.off(SocketActionsEnum.ADD_PEER)
    }
  }, [addNewClient])

  useEffect(() => {
    async function setRemoteMedia({ peerID, sessionDescription }: { peerID: string; sessionDescription: SessionDescription }) {
      //@ts-ignore
      await peerConnections.current[peerID]?.setRemoteDescription(new RTCSessionDescription(sessionDescription))

      if (sessionDescription.type === "offer") {
        const answer = await peerConnections.current[peerID].createAnswer()
        await peerConnections.current[peerID].setLocalDescription(answer)

        socket.emit(SocketActionsEnum.RELAY_SDP, {
          peerID,
          sessionDescription: answer,
        })
      }
    }

    socket.on(SocketActionsEnum.SESSION_DESCRIPTION, setRemoteMedia)

    return () => {
      socket.off(SocketActionsEnum.SESSION_DESCRIPTION)
    }
  }, [])

  useEffect(() => {
    socket.on(SocketActionsEnum.ICE_CANDIDATE, ({ peerID, iceCandidate }: { peerID: string; iceCandidate: IceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    })

    return () => {
      socket.off(SocketActionsEnum.ICE_CANDIDATE)
    }
  }, [])

  useEffect(() => {
    const handleRemovePeer = ({ peerID }: { peerID: string }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close()
      }

      delete peerConnections.current[peerID]
      delete peerMediaElements.current[peerID]

      updateClients((list) => list.filter((c) => c !== peerID))
    }

    socket.on(SocketActionsEnum.REMOVE_PEER, handleRemovePeer)

    return () => {
      socket.off(SocketActionsEnum.REMOVE_PEER)
    }
  }, [updateClients])

  useEffect(() => {
    async function startCapture() {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 1280,
          height: 720,
        },
      })

      addNewClient(LOCAL_VIDEO, () => {
        const localVideoElement = peerMediaElements.current[LOCAL_VIDEO]

        if (localVideoElement) {
          localVideoElement.volume = 0
          localVideoElement.srcObject = localMediaStream.current
        }
      })
    }

    startCapture()
      .then(() => socket.emit(SocketActionsEnum.JOIN, { room: roomID }))
      .catch((e) => console.error("Error getting userMedia:", e))

    return () => {
      localMediaStream.current?.getTracks().forEach((track) => track.stop())

      socket.emit(SocketActionsEnum.LEAVE)
    }
  }, [roomID, addNewClient])

  const provideMediaRef = useCallback((id: string, node: HTMLMediaElement | null) => {
    peerMediaElements.current[id] = node
  }, [])

  return {
    clients,
    provideMediaRef,
  }
}
