import React from 'react';
export type OnCreateParams = {
    name: string;
    description?: string;
    secondsUntilExpiration: number | undefined;
};
interface CreateAPIKeyFormProps {
    onCreate: (params: OnCreateParams) => void;
}
export declare const CreateAPIKeyForm: React.FC<CreateAPIKeyFormProps>;
export {};
