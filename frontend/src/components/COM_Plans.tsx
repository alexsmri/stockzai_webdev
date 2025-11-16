import type { ReactNode } from 'react';
import { scale } from '../utils/functions';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface PlansProps {
  prTitle?: string;
  prSubtitle?: string;
  prPriceValue?: string;
  prPriceSuffix?: string;
  prFeatures?: string[];
  prButtonLabel?: string;
  prButtonVariant?: ButtonVariant;
  prOnAction?: () => void;
  prDisabled?: boolean;
  prIsLoading?: boolean;
  prFooter?: ReactNode;
}

const DEFAULT_FEATURES = [
  '20.000+ companies',
  'Sector Leaderboards',
  'Access to all KPIs',
];

const BUTTON_CLASS_MAP: Record<ButtonVariant, string> = {
  primary: 'look-button-primary',
  secondary: 'look-button-secondary',
  tertiary: 'look-button-tertiary',
};

function COM_Plans({
  prTitle = 'Pro',
  prSubtitle = 'Unlock everything for just',
  prPriceValue = '$10',
  prPriceSuffix = '/month',
  prFeatures = DEFAULT_FEATURES,
  prButtonLabel,
  prButtonVariant = 'primary',
  prOnAction,
  prDisabled,
  prIsLoading,
  prFooter,
}: PlansProps) {
  const liStyle = { marginBottom: scale(0.5) };
  const buttonLabel = prIsLoading ? 'Please wait...' : prButtonLabel ?? 'Unlock now';
  const buttonClass = [
    BUTTON_CLASS_MAP[prButtonVariant] ?? BUTTON_CLASS_MAP.primary,
    'mod-button-auth',
    'mod-margin-t-xl',
  ].join(' ');

  const handleClick = () => {
    if (prDisabled || prIsLoading) {
      return;
    }
    prOnAction?.();
  };

  return (
    <div className="area-flex-col mod-align-left">
      <h2 className="look-text-x3 mod-left look-priority-medium">{prTitle}</h2>
      <h2 className="look-text-x3 mod-align-left look-priority-low">
        {prSubtitle} <br />
        <span className="look-priority-high">{prPriceValue}</span>
        {prPriceSuffix}
      </h2>
      <ul className="mod-padding-s">
        {prFeatures.map((feature) => (
          <li key={feature} className="look-text-x1 look-priority-normal" style={liStyle}>
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={buttonClass}
        type="button"
        onClick={handleClick}
        disabled={prDisabled || prIsLoading}
      >
        {buttonLabel}
      </button>
      {prFooter ? <div className="mod-margin-t-m">{prFooter}</div> : null}
    </div>
  );
}

export default COM_Plans;
