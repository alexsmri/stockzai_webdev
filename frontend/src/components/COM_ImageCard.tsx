import type { CSSProperties } from 'react';

type COM_ImageCardProps = {
  image: string;
  title: string;
  subtitle: string;
  handleClick: (symbol: string) => void;
};

export default function COM_ImageCard({ image, title, subtitle, handleClick }: COM_ImageCardProps) {
  const style: CSSProperties = {
    backgroundImage: `url(${image})`,
  };

  return (
    <article
      className="area-image-card state-hover-up mod-postion-relative"
      style={style}
      onClick={() => handleClick(title)}
    >
      <div className="mod-wh-full look-gradient-image" style={{ position: 'absolute', inset: 0 }} />
      <div
        className="area-flex-col mod-align-left mod-bottomleft"
        style={{ position: 'relative', width: 'calc(var(--default-font-size) * 10)' }}
      >
        <span className="look-text-x2">{title}</span>
        <span className="look-text-x1 look-priority-medium">{subtitle}</span>
      </div>
    </article>
  );
}
