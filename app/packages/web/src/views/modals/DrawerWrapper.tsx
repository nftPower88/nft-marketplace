import CheckOutModal from './CheckOutModal';
import { Drawer } from 'antd';
import React from 'react';
import { NextPageContext } from 'next';

interface Props {
  show: boolean;
  hide: (value: any) => void;
  id: string;
}

const DrawerWrapper: React.FC<Props> = ({ show, hide, id }: Props) => {
  const promisedModal = new Promise(resolve =>
    resolve(<CheckOutModal show={show} hide={hide} id={id} />),
  );

  return (
    <Drawer
      placement="right"
      closable={false}
      onClose={hide}
      visible={show}
      key="right"
      width={470}
    >
      <CheckOutModal show={show} hide={hide} id={id} />
    </Drawer>
  );
};
export default DrawerWrapper;
