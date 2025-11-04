export default function COM_Footer() {
  const legalLinks = [
    { href: 'https://stockz.ai/contact', label: 'Contact' },
    { href: 'https://stockz.ai/refund-policy', label: 'Refund Policy' },
    { href: 'https://stockz.ai/terms-conditions', label: 'Terms & Conditions' },
    { href: 'https://stockz.ai/payment-dispatch', label: 'Payment & Dispatch' },
    { href: 'https://stockz.ai/data-protection', label: 'Data Protection' },
    { href: 'https://stockz.ai/disclaimer', label: 'Disclaimer' },
  ];

  return (
    <div className="area-flex-col mod-bottom mod-centersides mod-gap-s">
      <p className="look-text-x0 look-text-subtle">No investment advice - see disclaimer.</p>
      <div className="area-flex-wrap mod-center mod-gap-l">
        <a href="/companies/search" className="look-button-subtle">
          Search
        </a>
        {legalLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="look-button-subtle"
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
