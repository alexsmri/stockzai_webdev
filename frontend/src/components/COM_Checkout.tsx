import { initializePaddle, type Paddle } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';

export function Checkout() {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: 'test_e4619c03702e45e5baa7af4102a',
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId: 'PRICE_ID_GOES_HERE', quantity: 1 }],
    });
  };

  return openCheckout();
}
