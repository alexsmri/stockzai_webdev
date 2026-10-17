import { Link } from 'react-router-dom';
import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';

function PAG_PaymentDispatch() {
  return (
    <COM_LandDocLayout prTitle="Payment and dispatch">
      <p>The following terms and conditions apply:</p>

      <h2>Provision of digital content</h2>
      <p>Digital content (data created and delivered in digital form) is not subject to shipping charges.</p>

      <h2>Accepted Payment options</h2>
      <ul>
        <li>Payment via credit card</li>
        <li>Payment via Google Pay</li>
        <li>Payment via Apple Pay</li>
      </ul>
      <p>via PayPal:</p>
      <ul>
        <li>Payment via PayPal</li>
        <li>Payment via PayPal Express</li>
      </ul>

      <h2>Further details on payment</h2>
      <p>
        If payment is made using a credit card, your credit card account is debited in conjunction with the shipping of
        the goods.
      </p>
      <p>
        In case of questions, please contact us at the contact details mentioned in the{' '}
        <Link to="/contact">Legal Notice</Link>.
      </p>
    </COM_LandDocLayout>
  );
}

export default PAG_PaymentDispatch;
