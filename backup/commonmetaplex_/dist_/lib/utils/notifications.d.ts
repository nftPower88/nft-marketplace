import { ArgsProps, NotificationApi } from 'antd/lib/notification';
export declare function notify({ type, txid, message, description, placement, ...rest }: {
    type?: keyof NotificationApi;
    txid?: string;
} & ArgsProps): void;
//# sourceMappingURL=notifications.d.ts.map