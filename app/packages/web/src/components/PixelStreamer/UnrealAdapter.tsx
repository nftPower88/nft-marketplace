import { WebRtcPlayer } from './WebRtcPlayer';
import { UnrealAdapterHook } from './UnrealAdapterHook';
import React from 'react';

interface SocketMessage {
  type: 'config' | 'playerCount' | 'answer' | 'iceCandidate';
  peerConnectionOptions?: RTCConfiguration;
  candidate?: RTCIceCandidateInit;
}
interface Props {
  onChangeLoading: any,
  focus: boolean,
  activeFocus: any
}
interface State { loading: boolean }

export interface UnrealAdapterOptions {
  container: HTMLElement;
  host: string;
  port: number;
  useSSL?: boolean;
  useMic?: boolean;
  matchViewPort?: boolean;
}

const WS_OPEN_STATE = 1;

const ToClientMessageType = {
  QualityControlOwnership: 0,
  Response: 1,
  Command: 2,
  FreezeFrame: 3,
  UnfreezeFrame: 4,
  VideoEncoderAvgQP: 5,
  LatencyTest: 6,
  InitialSettings: 7,
};
const MessageType = {
  /**********************************************************************/

  /*
   * Control Messages. Range = 0..49.
   */
  IFrameRequest: 0,
  RequestQualityControl: 1,
  MaxFpsRequest: 2,
  AverageBitrateRequest: 3,
  StartStreaming: 4,
  StopStreaming: 5,
  LatencyTest: 6,
  RequestInitialSettings: 7,

  /**********************************************************************/

  /*
   * Input Messages. Range = 50..89.
   */

  // Generic Input Messages. Range = 50..59.
  UIInteraction: 50,
  Command: 51,

  // Keyboard Input Message. Range = 60..69.
  KeyDown: 60,
  KeyUp: 61,
  KeyPress: 62,

  // Mouse Input Messages. Range = 70..79.
  MouseEnter: 70,
  MouseLeave: 71,
  MouseDown: 72,
  MouseUp: 73,
  MouseMove: 74,
  MouseWheel: 75,

  // Touch Input Messages. Range = 80..89.
  TouchStart: 80,
  TouchEnd: 81,
  TouchMove: 82,

  // Gamepad Input Messages. Range = 90..99
  GamepadButtonPressed: 90,
  GamepadButtonReleased: 91,
  GamepadAnalog: 92,

  /**************************************************************************/
};

// Must be kept in sync with JavaScriptKeyCodeToFKey C++ array. The index of the
// entry in the array is the special key code given below.
const SpecialKeyCodes = {
  BackSpace: 8,
  Shift: 16,
  Control: 17,
  Alt: 18,
  RightShift: 253,
  RightControl: 254,
  RightAlt: 255
};

const ControlSchemeType = {
  // A mouse can lock inside the WebRTC player so the user can simply move the
  // mouse to control the orientation of the camera. The user presses the
  // Escape key to unlock the mouse.
  LockedMouse: 0,

  // A mouse can hover over the WebRTC player so the user needs to click and
  // drag to control the orientation of the camera.
  HoveringMouse: 1
};

let inputOptions = {
  // The control scheme controls the behaviour of the mouse when it interacts
  // with the WebRTC player.
  controlScheme: ControlSchemeType.LockedMouse,

  // Browser keys are those which are typically used by the browser UI. We
  // usually want to suppress these to allow, for example, UE4 to show shader
  // complexity with the F5 key without the web page refreshing.
  suppressBrowserKeys: true,

  // UE4 has a faketouches option which fakes a single finger touch when the
  // user drags with their mouse. We may perform the reverse; a single finger
  // touch may be converted into a mouse drag UE4 side. This allows a
  // non-touch application to be controlled partially via a touch device.
  fakeMouseWithTouches: false
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const MouseButton = {
  MainButton: 0, // Left button.
  AuxiliaryButton: 1, // Wheel button.
  SecondaryButton: 2, // Right button.
  FourthButton: 3, // Browser Back button.
  FifthButton: 4 // Browser Forward button.
};

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const MouseButtonsMask = {
  PrimaryButton: 1, // Left button.
  SecondaryButton: 2, // Right button.
  AuxiliaryButton: 4, // Wheel button.
  FourthButton: 8, // Browser Back button.
  FifthButton: 16 // Browser Forward button.
};

export enum BusinessMessageType {
  init = '0',
}

export class UnrealAdapter extends React.Component<Props, State> {
  private unrealAdapterOption: UnrealAdapterOptions;
  // @ts-ignore
  public player: WebRtcPlayer;
  // @ts-ignore
  private ws: WebSocket;
  private videoResizeTimeout: any;
  private normalizeAndQuantizeUnsigned: any;
  private normalizeAndQuantizeSigned: any;
  private styleWidth: any;
  private styleHeight: any;
  private styleTop: any;
  private styleLeft: any;
  private styleCursor = 'default';
  private styleAdditional: any;

  constructor(props: any) {
    super(props);
    this.unrealAdapterOption = props.options;
    this.state = {
      loading: true,
    };
  }
  unrealAdapterHook = new UnrealAdapterHook;
  public load(videoRef?: React.RefObject<HTMLVideoElement>) {
    console.log('loading UnrealAdapter');

    this.ws = new WebSocket(
      this.unrealAdapterOption.useSSL
        ? 'wss://' + this.unrealAdapterOption.host + ':' + this.unrealAdapterOption.port
        : 'ws://' + this.unrealAdapterOption.host + ':' + this.unrealAdapterOption.port,
    );

    this.ws.onmessage = (event) => {
      const data: SocketMessage = JSON.parse(event.data);
      console.log(`onmessage: ${data.type}`);

      switch (data.type) {
        case 'answer':
          this.player.handleReceiveAnswer(data);
          if (this.unrealAdapterHook.onAnswer) {
            this.unrealAdapterHook.onAnswer(data);
          }
          break;
        case 'config':
          if (data.peerConnectionOptions) {
            this.onPlayerConfig(data.peerConnectionOptions, videoRef);
          }
          break;
        case 'iceCandidate':
          if (this.player && data.candidate) {
            this.player.handleCandidateFromServer(data.candidate);
          }
          if (this.unrealAdapterHook.onIceCandidate) {
            this.unrealAdapterHook.onIceCandidate(data.candidate);
          }
          break;
        case 'playerCount':
        default:
      }
    };
    window.addEventListener('orientationchange', () => {
      this.onOrientationChange();
    });
    // this.registerKeyboardEvents();
  }
  
  public connectionConfig() {
    this.ws = new WebSocket(
      this.unrealAdapterOption.useSSL
        ? 'wss://' + this.unrealAdapterOption.host + ':' + this.unrealAdapterOption.port
        : 'ws://' + this.unrealAdapterOption.host + ':' + this.unrealAdapterOption.port,
    );
    this.ws.onopen = () => {
      if(this.ws.OPEN) {
        this.props.onChangeLoading(false);
      }
      console.log('WebSocket Client Connected');
    }
  }

  resizeVideo() {
    if (this.unrealAdapterOption.matchViewPort) {
      const descriptor = {
        Console:
          'setres ' +
          this.unrealAdapterOption.container.clientWidth +
          'x' +
          this.unrealAdapterOption.container.clientHeight,
      };
      this.emitDescriptor(MessageType.UIInteraction, descriptor);
    }
  }

  private onOrientationChange() {
    if (this.videoResizeTimeout) {
      clearTimeout(this.videoResizeTimeout);
      this.videoResizeTimeout = setTimeout(() => {
        this.resizeVideo();
      }, 500);
    }
  }

  private async onPlayerConfig(peerConnectionOptions: RTCConfiguration, videoRef?: any) {
    this.player = new WebRtcPlayer({
      peerConnectionOptions,
      videoContainer: this.unrealAdapterOption.container,
      useMic: this.unrealAdapterOption.useMic ? this.unrealAdapterOption.useMic : false,
      videoRef
    });
    this.player.onWebRtcOffer = (o) => {
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        const offerStr = JSON.stringify(o);
        this.ws.send(offerStr);
      }
    };
    this.player.onWebRtcCandidate = (o) => {
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        this.ws.send(
          JSON.stringify({
            type: 'iceCandidate',
            candidate: o,
          }),
        );
      }
    };
    this.player.onVideoInitialised = () => {
      console.log('onVideoInitialised');
    };
    this.player.onDataChannelConnected = () => {
      console.log('datachannel connected');
      if (this.ws && this.ws.readyState === WS_OPEN_STATE) {
        if (this.player.video && this.player.video.srcObject && this.player.onVideoInitialised) {
          this.player.onVideoInitialised();
        }
      }

      // this.resizePlayerStyle()
      this.setupNormalizeAndQuantize();
      this.registerInputs(videoRef.current);
      switch (inputOptions.controlScheme) {
        case ControlSchemeType.HoveringMouse:
          this.registerHoveringMouseEvents(videoRef.current);
          break;
        case ControlSchemeType.LockedMouse:
          this.registerLockedMouseEvents(videoRef.current);
          break;
        default:
          console.log(`ERROR: Unknown control scheme ${inputOptions.controlScheme}`);
          this.registerLockedMouseEvents(videoRef.current);
          break;
      }
    };
    this.player.onDataChannelMessage = (o) => {
      const view = new Uint8Array(o);
      const res = new TextDecoder('utf-16').decode(o.slice(1));
      if (view[0] === ToClientMessageType.Response) {
        if (this.unrealAdapterHook.onMessage) {
          try {
            this.unrealAdapterHook.onMessage(JSON.parse(res));
          } catch {
            this.unrealAdapterHook.onMessage(undefined);
          }
        }
      }
    };
    await this.player.setupWrbRtcPlayer();
    if (this.unrealAdapterHook.onConfig) {
      this.unrealAdapterHook.onConfig(peerConnectionOptions);
    }
  }
  emitUIInteraction(descriptor: any, type: string) {
    Object.assign(descriptor, { _message: 'true', _type: type });
    console.log(descriptor);
    this.emitDescriptor(MessageType.UIInteraction, descriptor);
  }

  emitDescriptor(messageType: number, descriptor: any) {
    // Convert the descriptor object into a JSON string.
    const descriptorAsString = JSON.stringify(descriptor);
    // Add the UTF-16 JSON string to the array byte buffer, going two bytes at
    // a time.
    const data = new DataView(new ArrayBuffer(1 + 2 + 2 * descriptorAsString.length));
    let byteIdx = 0;
    data.setUint8(byteIdx, messageType);
    byteIdx++;
    data.setUint16(byteIdx, descriptorAsString.length, true);
    byteIdx += 2;
    for (let i = 0; i < descriptorAsString.length; i++) {
      data.setUint16(byteIdx, descriptorAsString.charCodeAt(i), true);
      byteIdx += 2;
    }
    this.sendInputData(data.buffer);
  }

  sendInputData(data: ArrayBuffer) {
    if (this.player) {
      this.player.send(data);
    }
  }

  registerInputs(playerElement: any) {
    if (!playerElement)
      return;

    this.registerMouseEnterAndLeaveEvents(playerElement);
    // registerTouchEvents(playerElement);
  }

  private registerMouseEnterAndLeaveEvents(playerElement: any) {
    playerElement.onmouseenter = (e: any) => {
      // if (print_inputs) {
      console.log('mouse enter');
      // }
      let Data = new DataView(new ArrayBuffer(1));
      Data.setUint8(0, MessageType.MouseEnter);
      this.sendInputData(Data.buffer);
      this.pressMouseButtons(e.buttons, e.x, e.y);
    };

    playerElement.onmouseleave = (e: any) => {
      // if (print_inputs) {
      console.log('mouse leave');
      // }
      let Data = new DataView(new ArrayBuffer(1));
      Data.setUint8(0, MessageType.MouseLeave);
      this.sendInputData(Data.buffer);
      // playerElement.releaseMouseButtons(e);
    };
  }

  private getKeyCode(e: any) {
    if (e.keyCode === SpecialKeyCodes.Shift && e.code === 'ShiftRight') return SpecialKeyCodes.RightShift;
    else if (e.keyCode === SpecialKeyCodes.Control && e.code === 'ControlRight') return SpecialKeyCodes.RightControl;
    else if (e.keyCode === SpecialKeyCodes.Alt && e.code === 'AltRight') return SpecialKeyCodes.RightAlt;
    else return e.keyCode;
  }

  // Browser keys do not have a charCode so we only need to test keyCode.
  private isKeyCodeBrowserKey(keyCode: number) {
    // Function keys or tab key.
    return keyCode >= 112 && keyCode <= 123 || keyCode === 9;
  }

  public registerKeyboardEvents(videoRef?: React.RefObject<HTMLVideoElement>) {
    document.onkeydown = (e) => {
      console.log(`key down ${e.keyCode}, repeat = ${e.repeat}`);
      this.sendInputData(new Uint8Array([MessageType.KeyDown, this.getKeyCode(e), e.repeat]).buffer);
      // Backspace is not considered a keypress in JavaScript but we need it
      // to be so characters may be deleted in a UE4 text entry field.
      if (inputOptions.suppressBrowserKeys && this.isKeyCodeBrowserKey(e.keyCode)) {
        e.preventDefault();
      }
    };

    document.onkeyup = (e) => {
      console.log(`key up ${e.keyCode}`);
      this.sendInputData(new Uint8Array([MessageType.KeyUp, this.getKeyCode(e)]).buffer);
      if (inputOptions.suppressBrowserKeys && this.isKeyCodeBrowserKey(e.keyCode)) {
        e.preventDefault();
      }
    };

    document.onkeypress = (e) => {
      console.log(e);
      if(e.charCode === 99) {
        this.props.activeFocus();
        this.registerLockedMouseEvents(videoRef?.current);
      }
      console.log(`key press ${e.charCode}`);
      let data = new DataView(new ArrayBuffer(3));
      data.setUint8(0, MessageType.KeyPress);
      data.setUint16(1, e.charCode, true);
      this.sendInputData(data.buffer);
    };
  }

  public registerLockedKeyboardEvents() {
    document.onkeyup = (e) => {
      e.stopPropagation();
    }
    document.onkeydown = (e) => {
      e.stopPropagation();
    }
    document.onkeypress = (e) => {
      e.stopPropagation();
    }
  }

  // If the user has any mouse buttons pressed then press them again.
  pressMouseButtons(buttons: any, x: any, y: any) {
    if (buttons & MouseButtonsMask.PrimaryButton) {
      this.emitMouseDown(MouseButton.MainButton, x, y);
    }
    if (buttons & MouseButtonsMask.SecondaryButton) {
      this.emitMouseDown(MouseButton.SecondaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.AuxiliaryButton) {
      this.emitMouseDown(MouseButton.AuxiliaryButton, x, y);
    }
    if (buttons & MouseButtonsMask.FourthButton) {
      this.emitMouseDown(MouseButton.FourthButton, x, y);
    }
    if (buttons & MouseButtonsMask.FifthButton) {
      this.emitMouseDown(MouseButton.FifthButton, x, y);
    }
  }

  resizePlayerStyleToActualSize(playerElement: any) {
    let videoElement = document.getElementById("player");

    if (videoElement) {
      // Display image in its actual size
      // @ts-ignore
      this.styleWidth = videoElement.videoWidth;
      // @ts-ignore
      this.styleHeight = videoElement.videoHeight;
      let Top = Math.floor((window.innerHeight - this.styleHeight) * 0.5);
      let Left = Math.floor((window.innerWidth - this.styleWidth) * 0.5);
      this.styleTop = (Top > 0) ? Top : 0;
      this.styleLeft = (Left > 0) ? Left : 0;
      //Video is now 100% of the playerElement, so set the playerElement style
      playerElement.style = "top: " + this.styleTop + "px; left: " + this.styleLeft + "px; width: " + this.styleWidth + "px; height: " + this.styleHeight + "px; cursor: " + this.styleCursor + "; " + this.styleAdditional;
    }
  }

  resizePlayerStyle(event?: any) {
    let playerElement = document.getElementById('player-container');

    if (!playerElement)
      return;

    // @ts-ignore
    let windowSmallerThanPlayer = window.innerWidth < playerElement.videoWidth || window.innerHeight < playerElement.videoHeight;
    if (windowSmallerThanPlayer) {
      this.resizePlayerStyleToFillWindow(playerElement);
    } else {
      this.resizePlayerStyleToActualSize(playerElement);
    }
  }

  setupNormalizeAndQuantize() {
    let playerElement = document.getElementById('player-container');
    let videoElement = document.getElementById("player");

    if (playerElement && videoElement) {
      // @ts-ignore
      this.styleWidth = videoElement.videoWidth;
      // @ts-ignore
      this.styleHeight = videoElement.videoHeight;
      let playerAspectRatio = playerElement!.clientHeight / playerElement!.clientWidth;
      // @ts-ignore
      let videoAspectRatio = videoElement.videoHeight / videoElement.videoWidth;

      // Unsigned XY positions are the ratio (0.0..1.0) along a viewport axis,
      // quantized into an uint16 (0..65536).
      // Signed XY deltas are the ratio (-1.0..1.0) along a viewport axis,
      // quantized into an int16 (-32767..32767).
      // This allows the browser viewport and client viewport to have a different
      // size.
      // Hack: Currently we set an out-of-range position to an extreme (65535)
      // as we can't yet accurately detect mouse enter and leave events
      // precisely inside a video with an aspect ratio which causes mattes.
      if (playerAspectRatio > videoAspectRatio) {
        // if (print_inputs) {
        console.log('Setup Normalize and Quantize for playerAspectRatio > videoAspectRatio');
        // }
        let ratio = playerAspectRatio / videoAspectRatio;
        // Unsigned.
        this.normalizeAndQuantizeUnsigned = (x: number, y: number) => {
          let normalizedX = x / playerElement!.clientWidth;
          let normalizedY =
            ratio * (y / playerElement!.clientHeight - 0.5) + 0.5;
          if (normalizedX < 0.0 || normalizedX > 1.0 || normalizedY < 0.0 || normalizedY > 1.0) {
            return {
              inRange: false,
              x: 65535,
              y: 65535
            };
          } else {
            return {
              inRange: true,
              x: normalizedX * 65536,
              y: normalizedY * 65536
            };
          }
        };
        const unquantizeAndDenormalizeUnsigned = (x: number, y: number) => {
          let normalizedX = x / 65536;
          let normalizedY = (y / 65536 - 0.5) / ratio + 0.5;
          return {
            x: normalizedX * playerElement!.clientWidth,
            y: normalizedY * playerElement!.clientHeight
          };
        };
        // Signed.
        this.normalizeAndQuantizeSigned = (x: number, y: number) => {
          let normalizedX = x / (0.5 * playerElement!.clientWidth);
          let normalizedY = (ratio * y) / (0.5 * playerElement!.clientHeight);
          return {
            x: normalizedX * 32767,
            y: normalizedY * 32767
          };
        };
      } else {
        // if (print_inputs) {
        console.log('Setup Normalize and Quantize for playerAspectRatio <= videoAspectRatio');
        // }
        let ratio = videoAspectRatio / playerAspectRatio;
        // Unsigned.
        this.normalizeAndQuantizeUnsigned = (x: number, y: number) => {
          let normalizedX = ratio * (x / playerElement!.clientWidth - 0.5) + 0.5;
          let normalizedY = y / playerElement!.clientHeight;
          if (normalizedX < 0.0 || normalizedX > 1.0 || normalizedY < 0.0 || normalizedY > 1.0) {
            return {
              inRange: false,
              x: 65535,
              y: 65535
            };
          } else {
            return {
              inRange: true,
              x: normalizedX * 65536,
              y: normalizedY * 65536
            };
          }
        };
        const unquantizeAndDenormalizeUnsigned = (x: number, y: number) => {
          let normalizedX = (x / 65536 - 0.5) / ratio + 0.5;
          let normalizedY = y / 65536;
          return {
            x: normalizedX * playerElement!.clientWidth,
            y: normalizedY * playerElement!.clientHeight
          };
        };
        // Signed.
        this.normalizeAndQuantizeSigned = (x: number, y: number) => {
          let normalizedX = (ratio * x) / (0.5 * playerElement!.clientWidth);
          let normalizedY = y / (0.5 * playerElement!.clientHeight);
          return {
            x: normalizedX * 32767,
            y: normalizedY * 32767
          };
        };
      }
    }
  }

  emitMouseMove(x: number, y: number, deltaX: number, deltaY: number) {
    // if (print_inputs) {
    console.log(`x: ${x}, y:${y}, dX: ${deltaX}, dY: ${deltaY}`);
    // }
    let coord = this.normalizeAndQuantizeUnsigned(x, y);
    let delta = this.normalizeAndQuantizeSigned(deltaX, deltaY);
    let Data = new DataView(new ArrayBuffer(9));
    Data.setUint8(0, MessageType.MouseMove);
    Data.setUint16(1, coord.x, true);
    Data.setUint16(3, coord.y, true);
    Data.setInt16(5, delta.x, true);
    Data.setInt16(7, delta.y, true);
    this.sendInputData(Data.buffer);
  }

  emitMouseDown(button: any, x: number, y: number) {
    // if (print_inputs) {
    console.log(`mouse button ${button} down at (${x}, ${y})`);
    // }
    let coord = this.normalizeAndQuantizeUnsigned(x, y);
    let Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseDown);
    Data.setUint8(1, button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
    this.sendInputData(Data.buffer);
  }

  emitMouseUp(button: any, x: number, y: number) {
    // if (print_inputs) {
    console.log(`mouse button ${button} up at (${x}, ${y})`);
    // }
    let coord = this.normalizeAndQuantizeUnsigned(x, y);
    let Data = new DataView(new ArrayBuffer(6));
    Data.setUint8(0, MessageType.MouseUp);
    Data.setUint8(1, button);
    Data.setUint16(2, coord.x, true);
    Data.setUint16(4, coord.y, true);
    this.sendInputData(Data.buffer);
  }

  registerLockedMouseEvents(playerElement: any) {
    let x = playerElement.width / 2;
    let y = playerElement.height / 2;

    playerElement.requestPointerLock = playerElement.requestPointerLock || playerElement.mozRequestPointerLock;
    // @ts-ignore
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    playerElement.onclick = function () {
      playerElement.requestPointerLock();
    };

    // Respond to lock state change events
    document.addEventListener('pointerlockchange', lockStateChange, false);
    document.addEventListener('mozpointerlockchange', lockStateChange, false);

    function lockStateChange() {
      if (document.pointerLockElement === playerElement ||
        // @ts-ignore
        document.mozPointerLockElement === playerElement) {
        console.log('Pointer locked');
        document.addEventListener("mousemove", updatePosition, false);
      } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", updatePosition, false);
      }
    }

    const updatePosition = (e: any) => {
      x += e.movementX;
      y += e.movementY;
      if (x > this.styleWidth) {
        x -= this.styleWidth;
      }
      if (y > this.styleHeight) {
        y -= this.styleHeight;
      }
      if (x < 0) {
        x = this.styleWidth + x;
      }
      if (y < 0) {
        y = this.styleHeight - y;
      }
      this.emitMouseMove(x, y, e.movementX, e.movementY);
    }

    playerElement.onmousedown = (e: any) => {
      this.emitMouseDown(e.button, x, y);
    };

    playerElement.onmouseup = (e: any) => {
      this.emitMouseUp(e.button, x, y);
    };

    playerElement.onmousewheel = (e: any) => {
      // this.emitMouseWheel(e.wheelDelta, x, y);
    };

    playerElement.pressMouseButtons = (e: any) => {
      this.pressMouseButtons(e.buttons, x, y);
    };

    playerElement.releaseMouseButtons = (e: any) => {
      // this.releaseMouseButtons(e.buttons, x, y);
    };
  }

  // A hovering mouse works by the user clicking the mouse button when they want
  // the cursor to have an effect over the video. Otherwise the cursor just
  // passes over the browser.
  registerHoveringMouseEvents(playerElement: any) {
    this.styleCursor = 'none'; // We will rely on UE4 client's software cursor.
    //styleCursor = 'default';  // Showing cursor

    playerElement.onmousemove = (e: any) => {
      this.emitMouseMove(e.offsetX, e.offsetY, e.movementX, e.movementY);
      e.preventDefault();
    };

    playerElement.onmousedown = (e: any) => {
      this.emitMouseDown(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    playerElement.onmouseup = (e: any) => {
      this.emitMouseUp(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    // When the context menu is shown then it is safest to release the button
    // which was pressed when the event happened. This will guarantee we will
    // get at least one mouse up corresponding to a mouse down event. Otherwise
    // the mouse can get stuck.
    // https://github.com/facebook/react/issues/5531
    playerElement.oncontextmenu = (e: any) => {
      this.emitMouseUp(e.button, e.offsetX, e.offsetY);
      e.preventDefault();
    };

    if ('onmousewheel' in playerElement) {
      playerElement.onmousewheel = (e: any) => {
        // this.emitMouseWheel(e.wheelDelta, e.offsetX, e.offsetY);
        e.preventDefault();
      };
    } else {
      playerElement.addEventListener('DOMMouseScroll', (e: any) => {
        // emitMouseWheel(e.detail * -120, e.offsetX, e.offsetY);
        e.preventDefault();
      }, false);
    }

    playerElement.pressMouseButtons = (e: any) => {
      this.pressMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };

    playerElement.releaseMouseButtons = (e: any) => {
      // releaseMouseButtons(e.buttons, e.offsetX, e.offsetY);
    };
  }

  resizePlayerStyleToFillWindow(playerElement: any) {
    let videoElement = document.getElementById("player");

    // Fill the player display in window, keeping picture's aspect ratio.
    let windowAspectRatio = window.innerHeight / window.innerWidth;
    let playerAspectRatio = playerElement.clientHeight / playerElement.clientWidth;
    // We want to keep the video ratio correct for the video stream
    // @ts-ignore
    let videoAspectRatio = videoElement?.videoHeight / videoElement?.videoWidth;
    if (isNaN(videoAspectRatio)) {
      //Video is not initialised yet so set playerElement to size of window
      this.styleWidth = window.innerWidth;
      this.styleHeight = window.innerHeight;
      this.styleTop = 0;
      this.styleLeft = 0;
      playerElement.style = "top: " + this.styleTop + "px; left: " + this.styleLeft + "px; width: " + this.styleWidth + "px; height: " + this.styleHeight + "px; cursor: " + this.styleCursor + "; " + this.styleAdditional;
    } else if (windowAspectRatio < playerAspectRatio) {
      // Window height is the constraining factor so to keep aspect ratio change width appropriately
      this.styleWidth = Math.floor(window.innerHeight / videoAspectRatio);
      this.styleHeight = window.innerHeight;
      this.styleTop = 0;
      this.styleLeft = Math.floor((window.innerWidth - this.styleWidth) * 0.5);
      //Video is now 100% of the playerElement, so set the playerElement style
      playerElement.style = "top: " + this.styleTop + "px; left: " + this.styleLeft + "px; width: " + this.styleWidth + "px; height: " + this.styleHeight + "px; cursor: " + this.styleCursor + "; " + this.styleAdditional;
    } else {
      // Window width is the constraining factor so to keep aspect ratio change height appropriately
      this.styleWidth = window.innerWidth;
      this.styleHeight = Math.floor(window.innerWidth * videoAspectRatio);
      this.styleTop = Math.floor((window.innerHeight - this.styleHeight) * 0.5);
      this.styleLeft = 0;
      //Video is now 100% of the playerElement, so set the playerElement style
      playerElement.style = "top: " + this.styleTop + "px; left: " + this.styleLeft + "px; width: " + this.styleWidth + "px; height: " + this.styleHeight + "px; cursor: " + this.styleCursor + "; " + this.styleAdditional;
    }
  }

  resizePlayerStyleToArbitrarySize(playerElement: any) {
    let videoElement = document.getElementById("player");
    //Video is now 100% of the playerElement, so set the playerElement style
    playerElement.style = "top: 0px; left: 0px; width: " + this.styleWidth + "px; height: " + this.styleHeight + "px; cursor: " + this.styleCursor + "; " + this.styleAdditional;
  }

}
