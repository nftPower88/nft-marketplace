import { Button, Col, Row, Spin, Tabs, Card, Badge, Input } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import styles from './style.module.css';

export const EditProfileView = () => {
    const [file, setFile] = useState(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
    const inputRef = React.useRef(null)

    const _handleImageChange = e => {
        e.preventDefault()
        
        let reader = new FileReader();
        let selected = e.target.files[0];
        
        reader.onloadend = () => {
            setFile(selected)
            setImagePreviewUrl(reader.result)
        }
    
        reader.readAsDataURL(selected)
    }

    return (
        <div className={styles.editProfileContainer}>
        <h1>Edit Profile</h1>
        <p className={styles.description}>
            You can set preferred display name, create your branded profile URL and
            manage other personal settings
        </p>
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Display name</div>
                <Input
                className={styles.customInput}
                placeholder="Enter your display name"
                ></Input>
            </div>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Custom Url</div>
                <Input
                className={styles.customInput}
                placeholder="Enter your custom url"
                ></Input>
            </div>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Bio</div>
                <Input
                className={styles.customInput}
                placeholder="Tell about yourself in a few words"
                ></Input>
            </div>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Twitter Username</div>
                <div className={styles.labelDescription}>
                Link your Twitter accout to gain more trust on the marketplace
                </div>
                <Input
                className={styles.customInput}
                placeholder="Enter your in Twitter"
                ></Input>
            </div>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Personal site or portfolio</div>
                <Input
                className={styles.customInput}
                placeholder="https://"
                ></Input>
            </div>
            <div className={styles.inputContainer}>
                <div className={styles.customLabel}>Email</div>
                <div className={styles.labelDescription}>
                Your email for marketplace notifications
                </div>
                <Input
                className={styles.customInput}
                placeholder="Enter your email"
                ></Input>
            </div>
            <div className={styles.verifyContainer}>
                <div>
                <p className={styles.verifyTitle}>Verification</p>
                <p className={styles.verifyContent}>
                    Proceed with verification processes to get more visibility and
                    gain trust on Rarible Marketplace. Please allow up to several
                    weeks for the process.
                </p>
                </div>
                <div>
                <Button className={styles.verifyBtn}>Get verified</Button>
                </div>
            </div>
            <div className={styles.updateBtnContainer}>
                <Button className={styles.updateBtn}>Update profile</Button>
            </div>
            </div>
            <div className={styles.rightContainer}>
            <input
                className={styles.fileInput}
                type="file"
                ref={inputRef}
                onChange={e => _handleImageChange(e)}
            />

            {!imagePreviewUrl && <div className={styles.preview}></div>}
            {imagePreviewUrl && <img src={imagePreviewUrl} className={styles.preview} />}
            <p className={styles.imageDescription}>
                We recommended an image of at least 300 * 300. Gifs works too. Max
                5mb
            </p>
            <Button className={styles.fileButton} onClick={() => inputRef.current.click()}>Choose file</Button>
            </div>
        </div>
        </div>
    );
};
