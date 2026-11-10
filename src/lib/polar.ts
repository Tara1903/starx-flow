import { createPolar, type Environment } from '@polar-sh/sdk/2026-10';

const accessToken = process.env.POLAR_ACCESS_TOKEN;

export const polar = createPolar({
  accessToken: accessToken ?? '',
  environment: (process.env.POLAR_SERVER as Environment | undefined) || 'production',
});
