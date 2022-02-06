import React, { useEffect, useRef, useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css'; // messed up the GUI
import { SendOutlined } from '@ant-design/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import io from 'socket.io-client';
import PixelStreamer from '../../components/PixelStreamer';
import { useHistory } from "react-router-dom";
import { fetchJson } from '../../utils';
import { ArrowDownOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/themecontext';
import { notify } from '../../components/util/notification';
import { WalletAvatar } from '../../components/util/walletAvatar';
import { MessageContent } from '../../components/Message';

const serverHost = 'http://localhost:8080/api'

export const MessageView = () => {
  const [offset, setOffset] = useState(0);
  const [messages, setMessages]: any[] = useState([]);
  const [scrollbtn, setScrollbtn] = useState(false);
  const [btnStatus, setBtnStatus] = useState(false);
  const [address, setAddress] = useState('');
  const [text, setText] = useState("");
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { publicKey } = useWallet();
  const history = useHistory();
  const [scrollH, setScrollH] = useState(0);
  const scrollDiv: any = useRef<HTMLHeadingElement>(null);
  const input: any = useRef<HTMLHeadingElement>(null);
  const socket = io(`http://localhost:8889`);
  const [nmsg, setNmsg] = useState(null);
  useEffect(() => {
    if (publicKey?.toString()) {
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
    } else {
      notify({
        message: 'Warning',
        description: 'You must sign in!',
      });
      history.push('/signin');
    }
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
            <PixelStreamer focus={focus} activeFocus={() => input.current.focus()} strConfig={setLoading} />
          </div>
          <div className='message-body' ref={scrollDiv} onScroll={handleScroll} style={loading ? { zIndex: -1 } : { zIndex: 0 }}>
            {
              messages && messages.length > 0 && messages.map((m: any, index: number) =>
                <MessageContent
                  index={index}
                  width={60}
                  info={m}
                />
              )
            }
          </div>
          <div className='message-send' style={loading ? { zIndex: -1 } : { zIndex: 0 }}>
            <input
              ref={input}
              type="text"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              className="message-insert"
              placeholder="Type a message"
              value={text}
              style={theme === 'Light' ? { color: 'black', borderColor: 'black' } : { color: 'white', borderColor: 'white', outline: 'none' }}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.which === 13 && text && handleMessage()}
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
                bottom: 85,
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