import { useState, useEffect, useRef } from "react";
import io from "socket.io-client"
import ENVIRONMENT from "../../../utils/ENVIRONMENT";

// graphics
import sound from "./sound.svg";
import micro from "./micro.svg";
import cameraIcon from "./cameraIcon.svg";
import fullScreen from "./fullScreen.svg";

// styles
import "./UIConsultationVideo.scss";

let UIConsultationVideo = (props) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const [videoError, setVideoError] = useState("");
  const [valueSound, setValueSound] = useState(50);
  const [valueSoundColor, setValueSoundColor] = useState({});
  const [microIsMute, setMicroIsMute] = useState(false);
  const [videoIsHide, setVideoIsHide] = useState(false);

  // ON PROP "CALL IS ALLOWED": set sockets, capture media, set local strean
  useEffect(() => {
    if(!props.callIsAllowed) return;

    // connect to server
    setSocket(io.connect(ENVIRONMENT.backendURL+"/video", {withCredentials: 'true'}));

    // capture video&audio
    navigator.mediaDevices.getUserMedia({ video: !videoIsHide, audio: !microIsMute ? {echoCancellation: true, noiseSuppression: true} : false })
    .then(stream => {
      setLocalStream(stream);
      // show local video
      let videoOnly = new MediaStream(stream.getVideoTracks());
      localVideo.current.srcObject = videoOnly;
      localVideo.current.play();
    })
    .catch(error => console.log(error));

  }, [props.callIsAllowed])
  // END OF ON PROP "CALL IS ALLOWED"


  // INIT CONNECTION WHEN LOCALSTREAM AND SOCKETS ARE READY
  useEffect(() => {
    if(!localStream || !socket) return;

  	// start a peer connection
    initConnection();

    return () => {
      localStream.getTracks().forEach(function(track) {
        track.stop();
      });
      socket.disconnect();
    }
  }, [localStream, socket])
  // END OF INIT CONNECTION WHEN LOCALSTREAM AND SOCKETS ARE READY


  // INIT FUNCTION
  const initConnection = () => {
    let referrer = false;
    let localConnection;
    let remoteConnection;

    socket.emit("readyToVideoCall", {link: props.link});

    // iceServers configuration
    let configuration = {
      iceServers: [
        {
          urls: "turn:45.84.225.247:3478",
          username: "username",
          credential: "password"
        }, {
          urls: ["stun:45.84.225.247:3478", "stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun2.l.google.com:19302","stun:stun3.l.google.com:19302","stun:stun4.l.google.com:19302"]
        }
      ]
    };


    // Start a RTCPeerConnection to each client
    socket.on('other-users', (otherUsers) => {
      referrer = true;

      // Ignore when not exists other users connected
      if (!otherUsers || !otherUsers.length) return;
      const socketId = otherUsers[0];

      // Ininit peer connection
      localConnection = new RTCPeerConnection(configuration);

      // Add all tracks from stream to peer connection
      localStream.getTracks().forEach(track => localConnection.addTrack(track, localStream));

      // Send Candidtates to establish a channel communication to send stream and data
      localConnection.onicecandidate = ({ candidate }) => {
        candidate && socket.emit('candidate', socketId, candidate);
      };
    
      // Receive stream from remote client and add to remote video area
      localConnection.ontrack = ({ streams: [ stream ] }) => {
        setVideoError("");
        remoteVideo.current.srcObject = stream;
        setTimeout(() => remoteVideo.current.play(), 1);
      };


      // Create Offer, Set Local Description and Send Offer to other users connected
      localConnection
        .createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => {
          socket.emit('offer', socketId, localConnection.localDescription);
        });
    });

    // Receive Offer From Other Client
    socket.on('offer', (socketId, description) => {
      referrer = false;
      // Ininit peer connection
      remoteConnection = new RTCPeerConnection(configuration);

      // Add all tracks from stream to peer connection
      localStream.getTracks().forEach(track => remoteConnection.addTrack(track, localStream));

      // Send Candidtates to establish a channel communication to send stream and data
      remoteConnection.onicecandidate = ({ candidate }) => {
        candidate && socket.emit('candidate', socketId, candidate);
      };
    
      // Receive stream from remote client and add to remote video area
      remoteConnection.ontrack = ({ streams: [ stream ] }) => {
        setVideoError("");
        remoteVideo.current.srcObject = stream;
        setTimeout(() => remoteVideo.current.play(), 1);
      };

      if (description && description.sdp && description.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
        description.sdp = description.sdp.split('\n').filter(function (line) {
        return line.trim() !== 'a=extmap-allow-mixed';
        }).join('\n');
      }

      // Set Local And Remote description and create answer
      remoteConnection
        .setRemoteDescription(description)
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => {
          socket.emit('answer', socketId, remoteConnection.localDescription);
        });
    });

    // Receive Answer to establish peer connection
    socket.on('answer', (description) => {
    	console.log('answered');

      if (description && description.sdp && description.sdp.indexOf('\na=extmap-allow-mixed') !== -1) {
        description.sdp = description.sdp.split('\n').filter(function (line) {
        return line.trim() !== 'a=extmap-allow-mixed';
        }).join('\n');
      }
      
      localConnection.setRemoteDescription(description);
    });

    // Receive candidates and add to peer connection
    socket.on('candidate', (candidate) => {
      try {
        // GET Local or Remote Connection
        const conn = referrer ? localConnection : remoteConnection;
        conn.addIceCandidate(new RTCIceCandidate(candidate));
      } catch(e) {}    
    });

    socket.on('other-disconnected', () => {
      try {
        remoteVideo.current.srcObject = new MediaStream();
        //remoteVideo.current.play();
      } catch (e) {}
      
      setVideoError("Ваш собеседник вышел из сети. Подождите...");
    })

    socket.on('you-disconnected', () => {
      console.log("you disconnected");
      try {
        remoteVideo.current.srcObject = new MediaStream();
        localVideo.current.srcObject = new MediaStream();
        // stop camera and video
        localStream.getTracks().forEach(function(track) {
          track.stop();
        });
      } catch(e){}
      setVideoError("Больше нет доступа к видеопотоку");
    })
  }
  // END OF INIT FUNCTION


  // MUTE MICRO
  let microMute = () => {
    setMicroIsMute(actual => {
      try {
        if(!actual) localStream.getAudioTracks()[0].enabled = false;
        else localStream.getAudioTracks()[0].enabled = true;
        let videoOnly = new MediaStream(localStream.getVideoTracks());
        localVideo.current.srcObject = videoOnly;
        localVideo.current.play();
      } catch(e){}
      return !actual;
    });
  }
  // END OF MUTE MICRO


  // HIDE VIDEO
  let videoHide = () => {
    setVideoIsHide(actual => {
      try {
        if(!actual) localStream.getVideoTracks()[0].enabled = false;
        else localStream.getVideoTracks()[0].enabled = true;
        let videoOnly = new MediaStream(localStream.getVideoTracks());
        localVideo.current.srcObject = videoOnly;
        localVideo.current.play();
      } catch(e){}
      return !actual;
    });
  }
  // END OF HIDE VIDEO


  // GO FULL SCREEN
  let maximiseStream = () => {
    try {
      remoteVideo.current.requestFullscreen() || remoteVideo.current.mozRequestFullScreen() || remoteVideo.current.webkitRequestFullscreen() || remoteVideo.current.msRequestFullscreen();
    } catch(e) {};
    try {
      remoteVideo.current.webkitEnterFullscreen();
    } catch(e) {};
  }
  // END OF GO FULL SCREEN


  // VOLUME CHANGE
  let handleChange = (event) => {
  	setValueSound(actual => event.target.value)
  }
  useEffect(() => {
  	setValueSoundColor({background: "linear-gradient(90deg, rgba(226, 227, 250, 1)" + valueSound + "%, rgba(226, 227, 250, .1)" + valueSound +"%)"});
  }, []);

  useEffect(() => {
  	remoteVideo.current.volume = valueSound / 100;
    console.log("remoteVideo.current.volume", remoteVideo.current.volume);
  	setValueSoundColor({background: "linear-gradient(90deg, rgba(226, 227, 250, 1)" + valueSound + "%, rgba(226, 227, 250, .1)" + valueSound +"%)"});
  }, [valueSound]);
  // END OF VOLUME CHANGE

	return (
		<div className="UIConsultationVideo">
			<div className="position-relative">
        {videoError ? <span className="video-error position-absolute p-3 mt-3 ml-3">{videoError}</span> : ""}
				<video className="main-video remote-video" ref={remoteVideo} onPause={(e) => e.target.play()} playsInline></video>
				<div className="remote-video-controls control d-flex justify-content-between position-absolute">
					<div className="d-flex">
						<div className="sound d-flex align-items-center">
							<img src={sound} alt="" />
							<input type="range" min="0" max="100" step="1" value={valueSound} onChange={handleChange} className="sound-range" style={valueSoundColor} />
						</div>
						<div className={`micro ${microIsMute ? "muted" : ""}`} onClick={() => microMute()}>
							<img src={micro} alt="" />
						</div>
						<div className={`camera ${videoIsHide ? "hide-video" : ""}`} onClick={() => videoHide()}>
							<img src={cameraIcon} alt="" />
						</div>
					</div>
					<div className="full-screen expand-remote-video" onClick={() => maximiseStream()}>
						<img src={fullScreen} alt="" />
					</div>
				</div>
				<div className="me-video position-absolute">
					<video className="local-video other-video" ref={localVideo} volume="0" playsInline muted></video>
				</div>
			</div>
		</div>
		);
}

export default UIConsultationVideo;