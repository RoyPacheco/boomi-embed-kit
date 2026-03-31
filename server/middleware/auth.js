/**
 * Returns the Boomi API headers required for every outbound REST request.
 * Credentials are read from environment variables — never from the client.
 * Env vars match the official embedkit-examples naming convention.
 */
export function boomiHeaders() {
  const { API_TOKEN, API_ACCOUNT_ID } = process.env
  if (!API_TOKEN || !API_ACCOUNT_ID) {
    throw new Error('API_TOKEN and API_ACCOUNT_ID must be set in server/.env')
  }
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    AccountID: API_ACCOUNT_ID,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}
