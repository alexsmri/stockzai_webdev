import { useEffect } from 'react';

export default function COM_FormFeedback() {
  useEffect(() => {
    if (!document.querySelector('script[data-typeform]')) {
      const s = document.createElement('script');
      s.src = 'https://embed.typeform.com/next/embed.js';
      s.async = true;
      s.setAttribute('data-typeform', '1');
      document.body.appendChild(s);
    }
  }, []);
  return <div data-tf-live="01K3V01H014RXF2S5TWRAVANMB"></div>;
}
