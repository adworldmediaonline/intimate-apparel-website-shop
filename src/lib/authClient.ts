import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          defaultValue: 'user',
          type: 'string',
          input: false,
          // required: true,
          enum: ['super-admin', 'admin', 'user'],
        },
      },
    }),
    emailOTPClient(),
  ],
});

export type ClientSession = typeof authClient.$Infer.Session;
