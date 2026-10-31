import { ServiceUnavailableError } from '../../errors/HttpErrors.js';

/**
 * Provider boundary: gateway SDKs and credentials remain server-side.  A real
 * provider must implement initiatePayment and verifyWebhook before it is
 * registered here; this implementation intentionally never fabricates a
 * successful payment.
 */
export function getPaymentProvider(name) {
  throw new ServiceUnavailableError(
    `Payment provider "${name}" is not configured. Configure a verified server-side provider before initiating gateway payments.`
  );
}
