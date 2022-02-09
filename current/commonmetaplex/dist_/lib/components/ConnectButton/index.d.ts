import { ButtonProps, PopoverProps } from 'antd';
import React from 'react';
export interface ConnectButtonProps extends ButtonProps, React.RefAttributes<HTMLElement> {
    popoverPlacement?: PopoverProps['placement'];
    allowWalletChange?: boolean;
}
export declare const ConnectButton: ({ onClick, children, disabled, allowWalletChange, popoverPlacement, ...rest }: ConnectButtonProps) => JSX.Element;
//# sourceMappingURL=index.d.ts.map