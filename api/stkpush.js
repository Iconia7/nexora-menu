import axios from 'axios';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send({ message: 'Only POST requests allowed' });

  const { phone, amount } = req.body;

  // --- DARAJA SANDBOX CREDENTIALS ---
  const consumerKey = "4I0cuGBM1KngCMP6zWAavhWOLI2LMatWA6axE2mp5cyoUKd9"; 
  const consumerSecret = "xDAdv3KxtWiKHwm7UsGkB3OL0Xlv0A0jAOr07XNDHsMZkdKOIc0owkh2Gi5SodBL";
  const businessShortCode = "174379";
  const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"; 
  
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const accessToken = tokenResponse.data.access_token;

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // Format phone to 254...
    let formattedPhone = phone.replace('+', '').replace(/^0/, '254');

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 1, // Sandbox requires 1
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://your-domain.vercel.app/api/callback", 
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