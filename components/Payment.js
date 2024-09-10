'use client';
import Script from 'next/script';
import { useState } from 'react';


export default function Payment({existingName, existingEmail, existingAmount}) {
    const [name, setName] = useState(existingName || '');
    const [email, setEmail] = useState(existingEmail || '');
    const [amount, setAmount] = useState(existingAmount || '');
    const [currency, setCurrency] = useState('INR');
    const [loading, setLoading] = useState(false);

    const createOrderId = async () => {
        try {
         const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json',
          },
          body: JSON.stringify({
           amount: parseFloat(amount) * 100,
           currency: currency,
          }),
         });
      
         if (!response.ok) {
          throw new Error('Network response was not ok');
         }
      
         const data = await response.json();
         return data.orderId;
        } catch (error) {
         console.error('There was a problem with your fetch operation:', error);
        }
       };

      const processPayment = async (e) => {
        e.preventDefault();
        try {
         const orderId = await createOrderId();
         const options = {
          key: "rzp_test_EeBvhQSCp2JzGQ",
          amount: parseFloat(amount) * 100,
          currency: currency,
          name: name,
          description: 'description',
          order_id: orderId,
          handler: async function (response) {
           const data = {
            orderCreationId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
           };

           console.log(data);
      
           const result = await fetch('/api/verify', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
           });
           const res = await result.json();
           if (res.isOk) {
            alert("payment succeed");
           }
           else {
            alert(res.message);
           }
          },
          prefill: {
           name: name,
           email: email,
          },
          theme: {
           color: '#3399cc',
          },
         };
         const paymentObject = new window.Razorpay(options);
         paymentObject.on('payment.failed', function (response) {
          alert(response.error.description);
         });
         paymentObject.open();
        } catch (error) {
         console.log(error);
        }
       };
      
       
       return (
        <>
         <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
         />
         <section className="flex">
          <form
           className="flex flex-col"
           onSubmit={processPayment}
          >
           <button className='bg-primary py-2 px-4 font-semibold text-white rounded-md' type='submit'>Donate Us</button>
          </form>
         </section>
        </>
       );
}

