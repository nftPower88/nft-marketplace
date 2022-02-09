import CheckOutModal from './CheckOutModal';
import { Drawer } from 'antd';
import React from 'react';
import { NextPageContext } from 'next';

interface Props {
  show: boolean;
  hide: (value: any) => void;
  id: string;
  placement: 'top' | 'bottom' | 'right' | 'left';
  mobileMode: boolean;
}

const DrawerWrapper: React.FC<Props> = ({
  show,
  hide,
  id,
  placement,
  mobileMode,
}: Props) => {
  // const promisedModal = new Promise(resolve =>
  //   resolve(<CheckOutModal show={show} hide={hide} id={id} />),
  // );

  return (
    <Drawer
      size="large"
      placement={placement}
      closable={false}
      onClose={hide}
      visible={show}
      key="right"
      width={470}
    >
      <CheckOutModal show={show} hide={hide} id={id} mobile={mobileMode} />
    </Drawer>
  );
};
export default DrawerWrapper;
