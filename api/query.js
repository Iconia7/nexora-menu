import axios from 'axios';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST allowed' });

  const { checkoutRequestID } = req.body;

  // --- CREDENTIALS ---
  const consumerKey = "4I0cuGBM1KngCMP6zWAavhWOLI2LMatWA6axE2mp5cyoUKd9"; 
  const consumerSecret = "xDAdv3KxtWiKHwm7UsGkB3OL0Xlv0A0jAOr07XNDHsMZkdKOIc0owkh2Gi5SodBL";
  const businessShortCode = "174379";
  const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; 

  try {
    // 1. GENERATE TOKEN (Now protected against crashes)
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { 
        headers: { Authorization: `Basic ${auth}` },
        validateStatus: () => true // <--- PREVENT CRASH HERE
      }
    );

    // If token failed, stop here and tell frontend
    if (tokenResponse.status !== 200) {
        console.error("Token Error:", tokenResponse.data);
        return res.status(200).json({ 
            ResultCode: "ERR", 
            ResultDesc: "Token Gen Failed: " + (tokenResponse.data.errorMessage || tokenResponse.status)
        });
    }

    const accessToken = tokenResponse.data.access_token;

    // 2. PREPARE PASSWORD
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // 3. QUERY STATUS (Protected)
    const queryResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID 
      },
      { 
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: () => true // <--- PREVENT CRASH HERE
      }
    );

    // 4. LOGGING FOR DEBUGGING (Check Vercel Logs if this happens again)
    if (queryResponse.status !== 200) {
        console.log("Safaricom Query Failed:", queryResponse.data);
    }

    // Send the raw answer back
    res.status(200).json(queryResponse.data);

  } catch (error) {
    console.error("Critical System Error:", error.message);
    res.status(200).json({ ResultCode: "ERR", ResultDesc: "System: " + error.message });
  }
}