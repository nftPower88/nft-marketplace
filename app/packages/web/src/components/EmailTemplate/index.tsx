import React, { useEffect, useState } from 'react';
import { useTheme, Theme } from '../../contexts/themecontext';
import { Button } from 'antd';
import { SocialIcon } from '../Footer/social_icon';

const TemplateHeader = () => {
    const { theme } = useTheme();

    return (
        <div className='template-header'>
            {theme == Theme.Light && < img src='/Logo/QueendomDark.png'/>}
            {theme == Theme.Dark && < img src='/Logo/QueendomLight.png'/>}
            <div className='tempate-divider'></div>
        </div>
    )
}

const TemplateFooter = () => {
    return (
        <div className='template-footer'>
            <p>Need help? If you have any questions. reach out to <span>support@queendom.io</span></p>
            <div className='tempate-divider'></div>
            <p>@2022 QUEENDOM PBC. ALL RIGHTS RESERVED.</p>
        </div>
    )
}

export const Temp1 = () => {
    return (
        <div className='template-container'>
            <TemplateHeader />
            <div className='main-container'>
                <h2 className='text-center fw-bold'>RECEIPT FROM QUEENDOM</h2>
                <p className='text-center mt-5'>Receipt #1311-0475</p>
                <div className='pay-info-container'>
                    <div>
                        <div>AMOUNT PAID</div>
                        <div>$50.00</div>
                    </div>
                    <div>
                        <div>DATE PAID</div>
                        <div>February 8, 2022</div>
                    </div>
                    <div>
                        <div>PAYMENT METHOD</div>

                    </div>
                </div>
                <div className='summary-container mt-3'>
                    <span className='mb-2'>SUMMARY</span>
                    <div className='list-container mt-2 mb-5'>
                        <div className='d-flex justify-content-between mb-2'>
                            <span>PERO</span>
                            <span>$50.00</span>
                        </div>
                        <hr/>
                        <div className='d-flex justify-content-between fw-bold mt-2'>
                            <span>Amount charged</span>
                            <span>$50.00</span>
                        </div>
                    </div>
                    <hr/>
                </div>
            </div>
            <TemplateFooter />
        </div>
    )
}

export const Temp2 = () => {

    return (
        <div className='template-container'>
            <TemplateHeader />
            <div className='main-container'>
                <h2 className='text-center fw-bold'>WELCOME TO QUEENDOM</h2>
                <p>PER YOUR REQUEST. WE CREATED A SOLANA WALLET FOR YOU:</p>
                <Button>LOGIN</Button>
                <p>USE THIS LINK IF THE BUTTON ABOVE DOESN'T WORK</p>
                <a>https://the...............................</a>
                <p>DO NOT SHARE this link with anyone!</p>
                <p>KEEP THE E-MAIL SAFE!</p>
            </div>
            <TemplateFooter />
        </div>
    )
}

export const Temp3 = () => {

    return (
        <div className='template-container'>
            <TemplateHeader />
            <div className='main-container'>
                <h2 className='text-center fw-bold'>THANK YOU FOR YOUR ORDER</h2>
                <p>YOU ARE THE OWNER OF</p>
                <img />
                <a>PRODUCT NAME</a>
                BY <a>CREATOR NAME</a>
                <Button>LOGIN</Button>
                <p>HAPPY METAVERSE SHOPPING!</p>
                <h2 className='text-center fw-bold'>SEE YOU IN QUEENDOMVERSE!</h2>
                <SocialIcon />
            </div>
            <TemplateFooter />
        </div>
    )
}