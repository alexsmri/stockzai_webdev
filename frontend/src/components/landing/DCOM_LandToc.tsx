import type { ITF_TocItem } from '../../hooks/hooks';

interface LandTocProps {
  prItems: ITF_TocItem[];
  prActiveId: string | null;
  prOnSelect: (id: string) => void;
}

function DCOM_LandToc({ prItems, prActiveId, prOnSelect }: LandTocProps) {
  if (prItems.length === 0) return null;
  const minLevel = Math.min(...prItems.map((item) => item.level));

  return (
    <aside className="lp-toc">
      <nav aria-label="Table of contents">
        <p className="lp-toc-title">Content</p>
        <ul>
          {prItems.map(({ id, text, level }) => {
            const classes = ['lp-toc-item'];
            if (level > minLevel) classes.push('lp-toc-item-sub');
            if (id === prActiveId) classes.push('lp-toc-item-active');
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={classes.join(' ')}
                  aria-current={id === prActiveId ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    prOnSelect(id);
                  }}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default DCOM_LandToc;
