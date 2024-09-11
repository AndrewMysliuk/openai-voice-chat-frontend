import { useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useStateWithCallback } from "./useStateWithCallback"
import { socket } from "@/shared/plugins"
import { SocketActionsEnum, ISessionDescription, IIceCandidate, VideoContentTypeEnum } from "@/shared/types"
import {
  createPeerConnection,
  handleTrackEvent,
  setRemoteDescription,
  startMediaCapture,
  addLocalVideo,
  stopMediaTracks,
} from "@/shared/utils/webRTCHelper"

export function useWebRTC(roomID: string) {
  const navigate = useNavigate()
  const [clients, updateClients] = useStateWithCallback<string[]>([])
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({})
  const localMediaStream = useRef<MediaStream | null>(null)
  const peerMediaElements = useRef<{ [key: string]: HTMLMediaElement | null }>({
    [VideoContentTypeEnum.LOCAL_VIDEO]: null,
  })

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

  useEffect(() => {
    const handleNewPeer = async ({ peerID, createOffer }: { peerID: string; createOffer: boolean }) => {
      if (peerConnections.current[peerID]) {
        console.warn(`Already connected to peer ${peerID}`)
        return
      }

      const peerConnection = createPeerConnection(peerID, peerConnections, socket)

      peerConnection.ontrack = handleTrackEvent(peerID, addNewClient, peerMediaElements)

      if (localMediaStream.current) {
        localMediaStream.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localMediaStream.current!)
        })
      }

      if (createOffer) {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        socket.emit(SocketActionsEnum.RELAY_SDP, {
          peerID,
          sessionDescription: offer,
        })
      }
    }

    const handleSessionDescription = async ({
      peerID,
      sessionDescription,
    }: {
      peerID: string
      sessionDescription: ISessionDescription
    }) => {
      const answer = await setRemoteDescription(peerID, sessionDescription, peerConnections)

      if (answer) {
        socket.emit(SocketActionsEnum.RELAY_SDP, {
          peerID,
          sessionDescription: answer,
        })
      }
    }

    const handleIceCandidate = ({ peerID, iceCandidate }: { peerID: string; iceCandidate: IIceCandidate }) => {
      peerConnections.current[peerID]?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

    const handleRemovePeer = ({ peerID }: { peerID: string }) => {
      if (peerConnections.current[peerID]) {
        peerConnections.current[peerID].close()
        delete peerConnections.current[peerID]
      }

      if (peerMediaElements.current[peerID]) {
        delete peerMediaElements.current[peerID]
      }

      updateClients((list) => list.filter((c) => c !== peerID))
    }

    socket.on(SocketActionsEnum.ADD_PEER, handleNewPeer)
    socket.on(SocketActionsEnum.SESSION_DESCRIPTION, handleSessionDescription)
    socket.on(SocketActionsEnum.ICE_CANDIDATE, handleIceCandidate)
    socket.on(SocketActionsEnum.REMOVE_PEER, handleRemovePeer)

    return () => {
      socket.off(SocketActionsEnum.ADD_PEER, handleNewPeer)
      socket.off(SocketActionsEnum.SESSION_DESCRIPTION, handleSessionDescription)
      socket.off(SocketActionsEnum.ICE_CANDIDATE, handleIceCandidate)
      socket.off(SocketActionsEnum.REMOVE_PEER, handleRemovePeer)
    }
  }, [addNewClient, updateClients])

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        await startMediaCapture(localMediaStream)

        addLocalVideo(peerMediaElements, localMediaStream.current, addNewClient)

        socket.emit(SocketActionsEnum.JOIN, { room: roomID })
      } catch (e) {
        console.error("Error getting userMedia:", e)
      }
    }

    initializeMedia()

    return () => {
      stopMediaTracks(localMediaStream)
      socket.emit(SocketActionsEnum.LEAVE)
    }
  }, [roomID, addNewClient])

  const toggleAudio = useCallback(() => {
    if (localMediaStream.current) {
      const audioTrack = localMediaStream.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
      }
    }
  }, [])

  const toggleVideo = useCallback(() => {
    if (localMediaStream.current) {
      const videoTrack = localMediaStream.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
      }
    }
  }, [])

  const leaveRoom = useCallback(() => {
    socket.emit(SocketActionsEnum.LEAVE)
    localMediaStream.current?.getTracks().forEach((track) => track.stop())

    navigate("/")
  }, [navigate])

  const provideMediaRef = useCallback((id: string, node: HTMLMediaElement | null) => {
    peerMediaElements.current[id] = node
  }, [])

  return {
    clients,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    provideMediaRef,
  }
}
