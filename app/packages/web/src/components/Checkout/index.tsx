import { StringPublicKey } from '@oyster/common';
import { Space } from 'antd';
import React, { useState } from 'react';
import { ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { Stripe, loadStripe } from '@stripe/stripe-js';
import { getStripe } from '../../utils/stripe';
import { Layout } from '../Stripe';
import { string } from '@hapi/joi';

import { fetchGetJSON, fetchPostJSON } from '../../utils/stripe';

import { Component } from 'react';
import { useTheme, Theme } from '../../contexts/themecontext';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CURRENCY,
  MIN_AMOUNT,
  MAX_AMOUNT,
  AMOUNT_STEP,
} from '../../config/stripe';
import { formatAmountForStripe } from '../../utils/stripe';

import { Stripe as _Stripe } from 'stripe';

import bodyParser from 'body-parser';
import compression from 'compression';
import morgan from 'morgan';
import express, { Request, Response, NextFunction } from 'express';

import getConfig from 'next/config';

import * as config from '../../config/stripe';
import { Spin, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import CardIcon from '../svgs/Card';
import CalendarIcon from '../svgs/calendar';
import LockIcon from '../svgs/lock';

import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentElement,
} from '@stripe/react-stripe-js';

import { PrintObject } from '../Stripe/PrintObject';

const CARD_OPTIONS_BLACK = {
  iconStyle: 'solid' as const,
  style: {
    base: {
      iconColor: '#030303',
      color: 'black',
      fontWeight: '500',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#030303',
      },
      '::placeholder': {
        color: '#030303',
      },
    },
    invalid: {
      iconColor: '#ef2961',
      color: '#ef2961',
    },
  },
};

const CARD_OPTIONS_WHITE = {
  iconStyle: 'solid' as const,
  style: {
    base: {
      iconColor: '#fcfdfe',
      color: '#fcfdfe',
      fontWeight: '500',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: '#fcfdfe',
      },
    },
    invalid: {
      iconColor: '#ef2961',
      color: '#ef2961',
    },
  },
};

const { publicRuntimeConfig } = getConfig();

type CheckoutState = {
  input: any;
  payment: { status: string };
  errorMessage: string;
};

type CheckoutProps = {
  setInput: string;
  setPayment: string;
  setErrorMessage: string;
};

interface StripeInterface {
  stripe?: Promise<Stripe | null>;
}

export class Checkout extends React.Component<
  CheckoutProps,
  CheckoutState,
  StripeInterface
> {
  state: CheckoutState = {
    input: '',
    payment: { status: 'initial' },
    errorMessage: '',
  };
  result: any;
  elements: any;
  stripe: Promise<Stripe | null>;

  constructor(props?: any) {
    super(props);
    this.result = null;
    this.elements = null;
    this.stripe = getStripe();
    // this.state.input;
    this.state.payment;
    this.state.errorMessage;
  }

  getPaymentStatus = ({ status }: { status: string }) => {
    const antIcon = (
      <LoadingOutlined style={{ fontSize: 24, color: '#356d9bff' }} spin />
    );
    switch (status) {
      case 'processing':
      case 'requires_payment_method':
      case 'requires_confirmation':
        return (
          <div className="payment_process">
            <h2>Processing</h2>
            <Spin indicator={antIcon} style={{ marginLeft: '10px' }} />
          </div>
        );

      case 'requires_action':
        return <h2>Authenticating...</h2>;

      case 'succeeded':
        return <h2>Payment Succeeded 🥳</h2>;

      case 'error':
        return (
          <Button
            onClick={() => location.reload()}
            type="primary"
            className="justify-content-center metaplex-fullwidth rounded-3"
          >
            Error 😭
            {this.state.errorMessage}
          </Button>
        );

      default:
        return null;
    }
  };

  doPayment = () => {
    const { theme, setTheme } = useTheme();
    const [input, setInput] = useState({
      customDonation: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
      cardholderName: '',
      cardholderZipcode: '',
      cardholderEmail: '',
    });
    // const [payment, setPayment] = useState({ status: 'initial' });
    const [errorMessage, setErrorMessage] = useState('');
    const stripe = useStripe();
    const elements = useElements();
    const antIcon = (
      <LoadingOutlined style={{ fontSize: 24, color: '#356d9bff' }} spin />
    );

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = e =>
      setInput({
        ...input,
        [e.currentTarget.name]: e.currentTarget.value,
      });

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
      e.preventDefault();
      // Abort if form isn't valid
      if (!e.currentTarget.reportValidity()) return;
      this.state.payment = { status: 'processing' };

      // Create a PaymentIntent with the specified amount.
      const response = await fetchPostJSON('/api/payment_intents', {
        amount: input.customDonation,
      });
      this.state.payment = response;

      if (response.statusCode === 500) {
        this.state.payment = { status: 'error' };
        setErrorMessage(response.message);
        return;
      }

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements!.getElement(CardNumberElement);

      // Use your card Element with other Stripe.js APIs
      const { error, paymentIntent } = await stripe!.confirmCardPayment(
        response.client_secret,
        {
          payment_method: {
            card: cardElement!,
            billing_details: {
              name: input.cardholderName,
              address: { postal_code: input.cardholderZipcode },
              email: input.cardholderEmail,
            },
          },
        },
      );

      if (error) {
        this.state.payment = { status: 'error' };
        setErrorMessage(error.message ?? 'An unknown error occured');
      } else if (paymentIntent) {
        this.state.payment = paymentIntent;
      }
    };

    return (
      <>
        <form onSubmit={handleSubmit}>
          {/* <CustomDonationInput
            className="elements-style"
            name="customDonation"
            value={input.customDonation}
            min={config.MIN_AMOUNT}
            max={config.MAX_AMOUNT}
            step={config.AMOUNT_STEP}
            currency={config.CURRENCY}
            onChange={handleInputChange}
          /> 
           <StripeTestCards />  */}
          <fieldset className="elements-style  modal_form">
            {/* <hr className="solid_line" />
            <div className="modal_header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h5
                  style={{
                    marginRight: '7px',
                    fontFamily: 'Roboto',
                    paddingTop: '5px',
                  }}
                >
                  Card &<br /> billing
                </h5>
                <img
                  src="/img/golden.png"
                  style={{ width: '62px', height: '40px' }}
                />
              </div>
              <img
                src="/img/solana-sol-logo.png"
                style={{ width: '40px', height: '40px', marginLeft: '20px' }}
              />
            </div> */}

            {/*<hr className="transparent_line" />*/}
            {/* <label htmlFor="cardholderName">First Name: </label> */}
            {/*
            <input
              placeholder="First Name"
              className="elements-style input_form"
              type="Text"
              name="cardholderName"
              onChange={handleInputChange}
              required
            />
            */}
            {/*<hr className="transparent_line" />*/}
            {/* <label htmlFor="cardholderLastName">Last Name: </label> */}
            {/*
            <input
              placeholder="Last Name"
              className="elements-style input_form"
              type="Text"
              name="cardholderLastName"
              onChange={handleInputChange}
              required
            />
            <hr className="transparent_line" />
            */}
            <input
              placeholder="Cardholder Name"
              className={
                theme === 'Light'
                  ? 'elements-style input_form_black'
                  : ' elements-style input_form_white'
              }
              type="Text"
              name="cardholderName"
              onChange={handleInputChange}
              required
            />
            <hr className="transparent_line" />
            {/* <label htmlFor="cardholderEmail">Email: </label> */}
            <input
              placeholder="Cardholder Email"
              className={
                theme === 'Light'
                  ? 'elements-style input_form_black'
                  : ' elements-style input_form_white'
              }
              type="email"
              name="cardholderEmail"
              onChange={handleInputChange}
              required
            />
            {/*<hr className="transparent_line" />*/}
            {/* <label htmlFor="cardholderAddress">Address: </label> */}
            {/*
            <input
              placeholder="Cardholder Address"
              className="elements-style input_form"
              type="text"
              name="cardholderAddress"
              onChange={handleInputChange}
              required
            />
            <hr className="transparent_line" />
            */}
            {/* <label htmlFor="cardholderAddress">Address: </label> */}
            {/*
            <input
              placeholder="Cardholder Zipcode"
              className="elements-style input_form"
              type="number"
              name="cardholderZipcode"
              onChange={handleInputChange}
              required
            />
            */}
            <hr className="transparent_line" />
            <div className=" elements-style card_panel">
              <div
                style={{
                  padding: '3px',
                  border: '1px solid',
                  display: 'flex',
                  borderRadius: '5px 5px 0 0',
                  gap: '2px',
                }}
              >
                <CardIcon />
                <div className="card_element">
                  <CardNumberElement
                    options={
                      theme === 'Light'
                        ? CARD_OPTIONS_BLACK
                        : CARD_OPTIONS_WHITE
                    }
                    onChange={e => {
                      if (e.error) {
                        this.state.payment = { status: 'error' };
                        setErrorMessage(
                          e.error.message ?? 'An unknown error occured',
                        );
                      }
                    }}
                  />
                </div>
              </div>
              <div className="d-flex">
                <div
                  className="card_items"
                  style={{ borderRadius: '0 0 0 5px' }}
                >
                  <CalendarIcon />
                  <div className="card_element">
                    <CardExpiryElement
                      options={
                        theme === 'Light'
                          ? CARD_OPTIONS_BLACK
                          : CARD_OPTIONS_WHITE
                      }
                      onChange={e => {
                        if (e.error) {
                          this.state.payment = { status: 'error' };
                          setErrorMessage(
                            e.error.message ?? 'An unknown error occured',
                          );
                        }
                      }}
                    />
                  </div>
                </div>
                <div
                  className="card_items"
                  style={{ borderRadius: '0 0 5px 0' }}
                >
                  <LockIcon />
                  <div className="card_element">
                    <CardCvcElement
                      options={
                        theme === 'Light'
                          ? CARD_OPTIONS_BLACK
                          : CARD_OPTIONS_WHITE
                      }
                      onChange={e => {
                        if (e.error) {
                          this.state.payment = { status: 'error' };
                          setErrorMessage(
                            e.error.message ?? 'An unknown error occured',
                          );
                        }
                      }}
                    />
                  </div>
                </div>
                {/*
                <div
                  className="card_items"
                  style={{ borderRadius: '0 0 5px 0' }}
                >
                /*}
                  {/*<LockIcon />*/}
                {/*
                  <div className="card_element">
                    <input
                      placeholder="Zipcode"
                      className="elements-style input_zipcode"
                      //  className ="card_element"
                      type="number"
                      name="cardholderZipcode"
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                */}
              </div>
              <div className="FormRow elements-style"></div>
            </div>
            {/*
            <CardElement
              options={CARD_OPTIONS}
              onChange={(e) => {
                if (e.error) {
                  this.state.payment = { status: 'error' };
                  setErrorMessage(e.error.message ?? 'An unknown error occured')
                }
              }}
            />
            </div>
            */}
          </fieldset>
          {this.state.payment.status === 'initial' ? (
            <Button
              htmlType="submit"
              className="purhcase_button ant-button metaplex-fullwidth"
              type="primary"
              disabled={
                !['initial', 'succeeded', 'error'].includes(
                  this.state.payment.status,
                ) || !stripe
              }
            >
              Purchase
            </Button>
          ) : (
            <this.getPaymentStatus status={this.state.payment.status} />
          )}
        </form>
        {/*<PrintObject content={this.state.payment} />*/}
      </>
    );
  };

  displayPaymentForm = () => {
    return (
      <Space
        className="metaplex-fullwidth modal_container"
        direction="vertical"
        align="center"
      >
        <Space
          className="metaplex-space-align-stretch  ant-card"
          direction="vertical"
        >
          <Layout>
            <Elements stripe={this.stripe!}>
              <this.doPayment />
            </Elements>
          </Layout>
        </Space>
      </Space>
    );
  };

  processPayment = (props: {
    nft?: {
      metadataAccount: StringPublicKey;
    };
    alert?: string;
  }) => {
    if (props.alert) {
      // TODO  - properly reset this components state on error
      console.error('payment failed');
      return (
        <Space
          className="metaplex-fullwidth"
          direction="vertical"
          align="center"
        >
          <div>
            <h2>Sorry, there was an error!</h2>
            <p>{props.alert}</p>
          </div>
        </Space>
      );
    }

    return <this.displayPaymentForm />;
  };
}
