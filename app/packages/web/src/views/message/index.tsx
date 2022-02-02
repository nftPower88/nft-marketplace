import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SendOutlined } from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import io from 'socket.io-client';

export const MessageView = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const {wallet, publicKey, disconnect} = useWallet();
  // const socket = io(`${process.env.SOCKET_STREAM_API}`);
  const socket = io(`http://localhost:8889`);
  useEffect(() => {
    const unknownWallet = wallet as any;
  }, []);
  useEffect(() => {
    socket.on('message-receive', (res) => {
      console.log(res);
    });
  }, [socket]);
  const handleMessage = () => {
    socket.emit('message-send', {
      
    });
    // console.log(`${process.env.SOCKET_STREAM_API}`);
  };

  return (
    <React.Fragment>
      <div className='message'>
        <div className='message_content'>
          <div className='message-body'>

          </div>
          <div className='message-send'>
            <input type="text" className="form-control message-insert" id="exampleFormControlInput1" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
            <button onClick={handleMessage} type="button" className="btn btn-primary btn-send"><SendOutlined style={{ fontSize: 26 }} /></button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};