import COM_ImageCard from '../components/COM_ImageCard';

import IMG_Apple from '../assets/media/IMG_Apple.webp';
import IMG_Nvidia from '../assets/media/IMG_Nvidia.webp';
import IMG_Google from '../assets/media/IMG_Google.webp';
import IMG_Amazon from '../assets/media/IMG_Amazon.webp';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scale } from '../utils/functions';
import { useUserStore } from '../context/CTX_UserStore';

const REDIRECT_URL = '/companies/page/free/';
const CARD_CONFIG = [
  { symbol: 'AAPL', name: 'Apple Inc.', image: IMG_Apple },
  { symbol: 'NVDA', name: 'Nvidia Corporation', image: IMG_Nvidia },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', image: IMG_Google },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', image: IMG_Amazon },
] as const;

export default function PAG_ChooseTicker() {
  const navigate = useNavigate();
  const userStore = useUserStore();
  useEffect(() => {
    const tokens = userStore.read('ActionLogin') as { access?: unknown } | null;
    console.log(tokens);
    const isLoggedIn = Boolean(tokens && typeof tokens.access === 'string');
    if (!isLoggedIn) {
      userStore.set('PropertyNewUser', true);
    } else {
      userStore.set('PropertyNewUser', false);
      navigate('/companies/search', { replace: true });
    }
  }, [navigate, userStore]);
  const handleClick = (symbol: string) => {
    navigate(`${REDIRECT_URL}${symbol}?t=true`);
  };
  return (
    <main
      className="area-flex-col mod-align-center"
      style={{
        minHeight: '100vh',
        justifyContent: 'center',
        gap: '2.5rem',
        backgroundColor: 'var(--color-primary)',
      }}
    >
      <h1 className="look-text-x5 look-priority-low" style={{ textAlign: 'center' }}>
        Which company <span className="look-priority-high">interests you</span> most?
      </h1>
      <section
        className="area-flex-wrap mod-centersides mod-gap-l"
        style={{
          width: `clamp(${scale(11)}, 70%, 90%)`,
          height: `clamp(${scale(30)}, 30vh, ${scale(50)})`,
        }}
      >
        {CARD_CONFIG.map(({ symbol, name, image }) => (
          <COM_ImageCard
            key={symbol}
            image={image}
            title={symbol}
            subtitle={name}
            handleClick={handleClick}
          />
        ))}
      </section>
    </main>
  );
}
