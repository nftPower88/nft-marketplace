import React from 'react';
const PixelStreamer: React.FC = () => {
    return (
        <div className="App">
            <header className="App-header">
                <Mirror></Mirror>
            </header>
        </div>
    );
}
interface Props { }
interface State { };
class Mirror extends React.Component<Props, State> {
    video_reference = React.createRef<HTMLVideoElement>()
async componentDidMount() {
        if (this.video_reference.current) {
            let video_stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
            this.video_reference.current.srcObject = video_stream
        }
    }
render() {
        return (
            <video ref={this.video_reference} id="player" autoPlay>
            </video>
        )
    }
}

export default PixelStreamer;
// const pixelStreamer = function(){
//     navigator.mediaDevices
//   .getUserMedia({ video: true, audio: false })
//   .then((stream) => (video.srcObject = stream))
//   .catch((error) => {
//     console.warn("【camera】", error);
//     return navigator.mediaDevices.getDisplayMedia({ audio: false });
//   })
//   .then((stream) => (video.srcObject = stream))
//   .catch((error) => {
//     console.warn("【screen capture】", error);
//     setupCanvas();
//   })
//   .finally(() => {
//     setupSignal();
//     window.stream = video.srcObject || canvas.captureStream();
//     stream.track = stream.getVideoTracks()[0];
//     console.log("✅ Unreal Simulator is running!");
//   });

// }