import { NextResponse } from 'next/server';
import crypto from 'crypto';

const generatedSignature = (
 razorpayOrderId,
 razorpayPaymentId
) => {
 const keySecret = process.env.RAZORPAY_KEY_SECRET;
 if (!keySecret) {
  throw new Error(
   'Razorpay key secret is not defined in environment variables.'
  );
 }
 const sig = crypto
  .createHmac('sha256', keySecret)
  .update(razorpayOrderId + '|' + razorpayPaymentId)
  .digest('hex');
 return sig;
};


const verifyHandler = async (req) => {
 try {
  const { orderCreationId, razorpayPaymentId, razorpaySignature } =
   await req.json();

  if (!orderCreationId || !razorpayPaymentId || !razorpaySignature) {
   return NextResponse.json(
    { message: 'payment verification payload is incomplete', isOk: false },
    { status: 400 }
   );
  }

  const signature = generatedSignature(orderCreationId, razorpayPaymentId);
  if (signature !== razorpaySignature) {
   return NextResponse.json(
    { message: 'payment verification failed', isOk: false },
    { status: 400 }
   );
  }
  return NextResponse.json(
   { message: 'payment verified successfully', isOk: true },
   { status: 200 }
  );
 } catch (error) {
  return NextResponse.json(
   { message: 'payment verification is unavailable', isOk: false },
   { status: 503 }
  );
 }
}

export { verifyHandler as POST }
