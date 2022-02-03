import { Button, Col, Row, Spin, Tabs, Card, Badge, Input } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSignIn } from '../../hooks';
import { useWallet } from '@solana/wallet-adapter-react';

export const EditProfileView = () => {
  const { connected, publicKey } = useWallet();
  const { signInConfirm } = useSignIn();
  const history = useHistory();
  !signInConfirm(publicKey?.toBase58()) && history.push('/');

  const [file, setFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const _handleImageChange = (e: any) => {
    e.preventDefault();

    const reader = new FileReader();
    const selected = e.target.files[0];

    reader.onloadend = () => {
      setFile(selected);
      reader.result && typeof reader.result == 'string' && setImagePreviewUrl(reader.result);
    };

    reader.readAsDataURL(selected);
  };

  return (
    <div className="editProfileContainer">
      <h1>Edit Profile</h1>
      <p className="description">
        You can set preferred display name, create your branded profile URL and
        manage other personal settings
      </p>
      <div className="mainContainer">
        <div className="leftContainer">
          <div className="inputContainer">
            <div className="customLabel">Display name</div>
            <Input
              className="customInput"
              placeholder="Enter your display name"
            ></Input>
          </div>
          <div className="inputContainer">
            <div className="customLabel">Custom Url</div>
            <Input
              className="customInput"
              placeholder="Enter your custom url"
            ></Input>
          </div>
          <div className="inputContainer">
            <div className="customLabel">Bio</div>
            <Input
              className="customInput"
              placeholder="Tell about yourself in a few words"
            ></Input>
          </div>
          <div className="inputContainer">
            <div className="customLabel">Twitter Username</div>
            <div className="labelDescription">
              Link your Twitter accout to gain more trust on the marketplace
            </div>
            <Input
              className="customInput"
              placeholder="Enter your in Twitter"
            ></Input>
          </div>
          <div className="inputContainer">
            <div className="customLabel">Personal site or portfolio</div>
            <Input className="customInput" placeholder="https://"></Input>
          </div>
          <div className="inputContainer">
            <div className="customLabel">Email</div>
            <div className="labelDescription">
              Your email for marketplace notifications
            </div>
            <Input
              className="customInput"
              placeholder="Enter your email"
            ></Input>
          </div>
          <div className="verifyContainer">
            <div>
              <p className="verifyTitle">Verification</p>
              <p className="verifyContent">
                Proceed with verification processes to get more visibility and
                gain trust on Rarible Marketplace. Please allow up to several
                weeks for the process.
              </p>
            </div>
            <div>
              <Button className="verifyBtn">Get verified</Button>
            </div>
          </div>
          <div className="updateBtnContainer">
            <Button className="updateBtn">Update profile</Button>
          </div>
        </div>
        <div className="rightContainer">
          <input
            className="fileInput"
            type="file"
            ref={inputRef}
            onChange={e => _handleImageChange(e)}
          />

          {!imagePreviewUrl && <div className="preview"></div>}
          {imagePreviewUrl && <img src={imagePreviewUrl} className="preview" />}
          <p className="imageDescription">
            We recommended an image of at least 300 * 300. Gifs works too. Max
            5mb
          </p>
          <Button
            className="fileButton"
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            Choose file
          </Button>
        </div>
      </div>
    </div>
  );
};
