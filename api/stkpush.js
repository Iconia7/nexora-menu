import axios from 'axios';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST requests allowed' });

  const { phone, amount } = req.body;

  // --- DARAJA SANDBOX CREDENTIALS ---
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const businessShortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // Format phone to 254...
    let formattedPhone = phone.replace('+', '').replace(/^0/, '254');

    const stkResponse = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1, // Sandbox requires 1
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://menu.nexoracreatives.co.ke/api/callback", 
        AccountReference: "Nexora Bistro",
        TransactionDesc: "Food Order"
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    res.status(200).json(stkResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate M-Pesa" });
  }
}