import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    settings: {
      react: { version: '19.0' },
    },
  },
];

export default config;
