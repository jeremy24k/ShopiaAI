import pkg from '@paypal/paypal-server-sdk';
const { Client, Environment, LogLevel } = pkg;

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error('PayPal credentials not found in environment variables');
}

// Determinar el entorno (sandbox o live)
const environment = process.env.PAYPAL_MODE === 'live' 
  ? Environment.Production 
  : Environment.Sandbox;

// Crear el cliente con la nueva sintaxis
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret,
  },
  timeout: 0,
  environment: environment,
  logging: {
    logLevel: LogLevel.Info,
  },
});

console.log(`✅ PayPal configurado en modo: ${process.env.PAYPAL_MODE || 'sandbox'}`);

export { client };