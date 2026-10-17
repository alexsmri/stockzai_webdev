import { Link } from 'react-router-dom';

export default function COM_Footer() {
  const legalLinks = [
    { href: '/contact', label: 'Contact' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/terms-conditions', label: 'Terms & Conditions' },
    { href: '/payment-dispatch', label: 'Payment & Dispatch' },
    { href: '/data-protection', label: 'Data Protection' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ];

  return (
    <div className="area-flex-col mod-bottom mod-centersides mod-gap-none">
      <p className="look-text-x0 look-text-subtle">No investment advice - see disclaimer.</p>
      <div className="area-flex-wrap mod-center mod-gap-l mod-padding-s">
        <a href="/companies/search" className="look-button-subtle">
          Search
        </a>
        {legalLinks.map(({ href, label }) => (
          <Link key={href} to={href} className="look-button-subtle">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
