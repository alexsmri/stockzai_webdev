import COM_ImageCard from '../components/COM_ImageCard';

import IMG_Apple from '../assets/media/IMG_Apple.webp';
import IMG_Nvidia from '../assets/media/IMG_Nvidia.webp';
import IMG_Google from '../assets/media/IMG_Google.webp';
import IMG_Amazon from '../assets/media/IMG_Amazon.webp';
import { useNavigate } from 'react-router-dom';

const REDIRECT_URL = '/companies/page/free/';
const CARD_CONFIG = [
  { symbol: 'AAPL', name: 'Apple Inc.', image: IMG_Apple },
  { symbol: 'NVDA', name: 'Nvidia Corporation', image: IMG_Nvidia },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', image: IMG_Google },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', image: IMG_Amazon },
] as const;

export default function PAG_ChooseTicker() {
  const navigate = useNavigate();
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
          width: 'clamp(calc(var(--default-font-size) * 11), 70%, 90%)',
          height:
            'clamp(calc(var(--default-font-size) * 30), 30vh, calc(var(--default-font-size) * 50))',
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
