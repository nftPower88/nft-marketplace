import React, { useEffect, useRef, useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css'; // messed up the GUI
import { SendOutlined } from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import io from 'socket.io-client';
import PixelStreamer from '../../components/PixelStreamer';
import { useRouter } from 'next/router';
import { fetchJson } from '../../utils';
import { ArrowDownOutlined } from '@ant-design/icons';

const serverHost = 'http://localhost:8080/api'

export const MessageView = () => {
  const [offset, setOffset] = useState(0);
  const [messages, setMessages]: any[] = useState([]);
  const [scrollbtn, setScrollbtn] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);
  const [address, setAddress] = useState('');
  const [text, setText] = useState("");
  const router = useRouter()
  const { publicKey } = useWallet();
  const [scrollH, setScrollH] = useState(0);
  const scrollDiv: any = useRef<HTMLHeadingElement>(null);
  const socket = io(`http://localhost:8889`);
  const [nmsg, setNmsg] = useState(null)
  useEffect(() => {
    fetchJson(`${serverHost}/message/${offset}`).then(res => {
      if (res.type === 'success') {
        setMessages(res.data.reverse());
      }
    })
    socket.on('message-receive', (res: any) => {
      if (res.type === 'success') {
        setNmsg(res.data);
      }
    });
  }, []);
  useEffect(() => {
    if (nmsg) {
      setMessages([...messages, nmsg]);
      setText("");
      setScrollH(0);
    }
  }, [nmsg]);
  useEffect(() => {
    text ? setBtnStatus(true) : setBtnStatus(false);
  }, [text]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleMessage = () => {
    socket.emit('message-send', {
      text,
      walletAddress: publicKey?.toString()
    });
  };
  const scrollToBottom = () => {
    const scrollHeight = scrollDiv.current.scrollHeight - scrollH;
    const height = scrollDiv.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  };
  const handleScroll = async () => {
    setScrollbtn(true);
    const scrollTop = scrollDiv.current.scrollTop;
    const scrollHeight = scrollDiv.current.scrollHeight;
    const height = scrollDiv.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    const newScrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    if (newScrollTop === scrollTop) setScrollbtn(false);
    if (scrollTop === 0) {
      fetchJson(`${serverHost}/message/${1 + offset}`).then(res => {
        if (res.type === 'success') {
          setMessages([...res.data.reverse(), ...messages]);
          setOffset(1 + offset);
          setScrollH(scrollHeight);
        }
      })
    }
  };

  return (
    <React.Fragment>
      <div className='message'>
        <div className='message_content'>
          <div className='background-stream'>
            <PixelStreamer />
          </div>
          <div className='message-body' onScroll={handleScroll} ref={scrollDiv}>
            {
              messages && messages.length > 0 && messages.map((m: any, index: number) =>
                <div key={index} style={{ padding: '1.5rem 0' }} className={`d-flex ${m.walletAddress === publicKey?.toString() ? 'justify-content-end' : 'justify-content-start'}`}>
                  <p className='messages'>{m.text}</p>
                </div>
              )
            }
          </div>
          <div className='message-send'>
            <input
              type="text"
              className="message-insert"
              placeholder="Type a message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.which === 13 && handleMessage()}
            />
            {
              btnStatus && <button onClick={handleMessage} type="button" className="btn-send"><SendOutlined style={{ fontSize: 26 }} /></button>
            }
          </div>
          {
            scrollbtn &&
            <div
              style={{
                position: 'absolute',
                right: 50,
                bottom: 65,
                display: 'flex'
              }}
            >
              <button
                style={{
                  borderRadius: '50%',
                  border: 'none',
                  textAlign: 'center',
                  backgroundColor: '#5d2d9d',
                  padding: "8px 12px"
                }}
                onClick={() => {
                  const scrollHeight = scrollDiv.current.scrollHeight;
                  const height = scrollDiv.current.clientHeight;
                  const maxScrollTop = scrollHeight - height;
                  scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
                }}
              >
                <ArrowDownOutlined />
              </button>
            </div>
          }
        </div>
      </div>
    </React.Fragment>
  );
};