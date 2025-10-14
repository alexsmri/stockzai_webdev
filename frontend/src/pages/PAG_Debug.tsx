import { useState } from 'react';
import COM_MenuSelect from '../components/COM_MenuSelect';

const TEXT_VARIANTS = [
  'look-text-x8',
  'look-text-x7',
  'look-text-x6',
  'look-text-x5',
  'look-text-x4',
  'look-text-x3',
  'look-text-x2',
  'look-text-x1',
  'look-text-x0',
];

const TEXT_STATES = [
  { className: 'look-text-important', label: 'Important (80%)' },
  { className: 'look-text-normal', label: 'Normal (60%)' },
  { className: 'look-text-subtle', label: 'Subtle (40%)' },
  { className: 'look-text-disabled', label: 'Disabled (Primary 40%)' },
];

const MENU_SELECT_OPTIONS = {
  balance: 'Balance Sheet',
  cashflow: 'Cashflow Statement',
  income: 'Income Statement',
};

function PAG_Debug() {
  const [selectedMenuKey, setSelectedMenuKey] = useState('');
  const selectedMenuLabel =
    MENU_SELECT_OPTIONS[selectedMenuKey as 'balance' | 'cashflow' | 'income'];

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '48rem',
        margin: '0 auto',
      }}
    >
      <section
        className="look-div-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}
      >
        <h2 className="look-text-x3 look-text-important">Menu Select</h2>
        <COM_MenuSelect prOptions={MENU_SELECT_OPTIONS} prHandleChange={setSelectedMenuKey} />
        <p className="look-text-x1 look-text-subtle">
          Current selection:
          <span className="look-text-important" style={{ marginLeft: '0.5rem' }}>
            {selectedMenuLabel ?? 'None'}
          </span>
        </p>
      </section>

      <section
        className="look-div-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}
      >
        <h1 className="look-text-x4 look-text-important">Text Scale Showcase</h1>
        {TEXT_VARIANTS.map((variant) => (
          <p key={variant} className={`${variant} look-text-normal`}>
            {variant}
          </p>
        ))}
      </section>

      <section
        className="look-div-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}
      >
        <h2 className="look-text-x3 look-text-important">Text Emphasis States</h2>
        {TEXT_STATES.map(({ className, label }) => (
          <p key={className} className={`look-text-x2 ${className}`}>
            {label}
          </p>
        ))}
      </section>

      <section
        className="look-div-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}
      >
        <h2 className="look-text-x3 look-text-important">Container Tokens</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="look-div-subtle">
            <p className="look-text-x2 look-text-normal">
              Subtle surface, perfect for neutral panels.
            </p>
          </div>
          <div className="look-div-solid state-hover-scale">
            <p className="look-text-x2 look-text-important">
              Solid surface with hover scale applied.
            </p>
          </div>
        </div>
      </section>

      <section
        className="look-div-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}
      >
        <h2 className="look-text-x3 look-text-important">Button States</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="button" className="look-button-primary">
            Primary Button
          </button>
          <button type="button" className="look-button-primary mod-button-auth">
            Primary Auth Variant
          </button>
          <button type="button" className="look-button-primary" disabled>
            Primary Disabled
          </button>
          <button type="button" className="look-button-secondary">
            Secondary Button
          </button>
          <button type="button" className="look-button-secondary mod-button-auth">
            Secondary Auth Variant
          </button>
          <button type="button" className="look-button-secondary" disabled>
            Secondary Disabled
          </button>
          <button type="button" className="look-button-tertiary">
            Tertiary Button
          </button>
          <button type="button" className="look-button-tertiary mod-button-auth">
            Tertiary Auth Variant
          </button>
          <button type="button" className="look-button-tertiary" disabled>
            Tertiary Disabled
          </button>
          <button type="button" className="look-button-ghost">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 0.75 7.763 4.36l3.862.308-2.924 2.39.9 3.77L6 9.46l-3.601 1.368.9-3.77L.375 4.668l3.862-.308z" />
            </svg>
            <span>Ghost Button</span>
          </button>
          <button type="button" className="look-button-ghost mod-button-auth">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 0.75 7.763 4.36l3.862.308-2.924 2.39.9 3.77L6 9.46l-3.601 1.368.9-3.77L.375 4.668l3.862-.308z" />
            </svg>
            <span>Ghost Auth Variant</span>
          </button>
          <button type="button" className="look-button-ghost mod-selected">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 0.75 7.763 4.36l3.862.308-2.924 2.39.9 3.77L6 9.46l-3.601 1.368.9-3.77L.375 4.668l3.862-.308z" />
            </svg>
            <span>Ghost Selected</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default PAG_Debug;
