import freeice from "freeice"
import { SocketActionsEnum, ISessionDescription, VideoContentTypeEnum } from "../types"

export const createPeerConnection = (
  peerID: string,
  peerConnections: React.MutableRefObject<{ [key: string]: RTCPeerConnection }>,
  socket: any
) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: freeice(),
  })

  peerConnections.current[peerID] = peerConnection

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit(SocketActionsEnum.RELAY_ICE, {
        peerID,
        iceCandidate: event.candidate,
      })
    }
  }

  return peerConnection
}

const waitForElement = (
  peerID: string,
  remoteStream: MediaStream,
  peerMediaElements: React.MutableRefObject<{ [key: string]: HTMLMediaElement | null }>
) => {
  const observer = new MutationObserver(() => {
    if (peerMediaElements.current[peerID]) {
      peerMediaElements.current[peerID]!.srcObject = remoteStream
      observer.disconnect()
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

export const handleTrackEvent =
  (
    peerID: string,
    addNewClient: (id: string, cb: () => void) => void,
    peerMediaElements: React.MutableRefObject<{ [key: string]: HTMLMediaElement | null }>
  ) =>
  (event: RTCTrackEvent) => {
    const [remoteStream] = event.streams

    if (remoteStream) {
      addNewClient(peerID, () => {
        if (peerMediaElements.current[peerID]) {
          peerMediaElements.current[peerID]!.srcObject = remoteStream
        } else {
          waitForElement(peerID, remoteStream, peerMediaElements)
        }
      })
    }
  }

export const setRemoteDescription = async (
  peerID: string,
  sessionDescription: ISessionDescription,
  peerConnections: React.MutableRefObject<{ [key: string]: RTCPeerConnection }>
) => {
  const peerConnection = peerConnections.current[peerID]

  if (!peerConnection) {
    console.warn(`Peer connection not found for ${peerID}`)
    return
  }

  await peerConnection.setRemoteDescription(
    new RTCSessionDescription({
      ...sessionDescription,
      type: sessionDescription.type as RTCSdpType,
    })
  )

  if (sessionDescription.type === "offer") {
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    return answer
  }

  return null
}

export const startMediaCapture = async (localMediaStream: React.MutableRefObject<MediaStream | null>) => {
  localMediaStream.current = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1280,
      height: 720,
    },
  })

  return localMediaStream.current
}

export const addLocalVideo = (
  peerMediaElements: React.MutableRefObject<{ [key: string]: HTMLMediaElement | null }>,
  localMediaStream: MediaStream | null,
  addNewClient: (id: string, cb: () => void) => void
) => {
  addNewClient(VideoContentTypeEnum.LOCAL_VIDEO, () => {
    const localVideoElement = peerMediaElements.current[VideoContentTypeEnum.LOCAL_VIDEO]

    if (localVideoElement && localMediaStream) {
      localVideoElement.volume = 0
      localVideoElement.srcObject = localMediaStream
    }
  })
}

export const stopMediaTracks = (localMediaStream: React.MutableRefObject<MediaStream | null>) => {
  localMediaStream.current?.getTracks().forEach((track) => track.stop())
}
