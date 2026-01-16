import axios from 'axios';
import moment from 'moment';
import https from 'https'; // Import https to force security options

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST allowed' });

  const { checkoutRequestID } = req.body;

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const businessShortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  // --- 1. FIREWALL BYPASS HEADERS ---
  // Safaricom blocks Vercel unless we look like a real browser
  const bypassHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  };

  // Create an HTTPS agent that ignores some SSL strictness (helps with sandbox)
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false
  });

  try {
    // --- 2. GENERATE TOKEN (With Headers) ---
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    const tokenResponse = await axios.get(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { 
        headers: { 
            Authorization: `Basic ${auth}`,
            ...bypassHeaders // Add the fake browser headers
        },
        httpsAgent: httpsAgent,
        validateStatus: () => true 
      }
    );

    if (tokenResponse.status !== 200) {
        // If we still get HTML, it's a hard block
        console.error("Token Blocked:", tokenResponse.data);
        return res.status(200).json({ 
            ResultCode: "ERR", 
            ResultDesc: "Safaricom Firewall Blocked Vercel IP (Token)"
        });
    }

    const accessToken = tokenResponse.data.access_token;

    // --- 3. QUERY (With Headers) ---
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    const queryResponse = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID 
      },
      { 
        headers: { 
            Authorization: `Bearer ${accessToken}`,
            ...bypassHeaders // Add the fake browser headers
        },
        httpsAgent: httpsAgent,
        validateStatus: () => true 
      }
    );

    // Check if query was blocked
    if (String(queryResponse.data).includes("Incapsula")) {
         return res.status(200).json({ 
            ResultCode: "ERR", 
            ResultDesc: "Safaricom Firewall Blocked Vercel IP (Query)"
        });
    }

    res.status(200).json(queryResponse.data);

  } catch (error) {
    console.error("System Error:", error.message);
    res.status(200).json({ ResultCode: "ERR", ResultDesc: "System: " + error.message });
  }
}