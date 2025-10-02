import COM_Sidebar from '../components/COM_Sidebar';
import COM_Footer from '../components/COM_Footer';

function PAG_TopStocks() {
  return (
    <div
      className="area-flex-row mod-gap-none mod-padding-none"
      style={{ minHeight: '100vh', alignItems: 'stretch' }}
    >
      <COM_Sidebar />
      <div
        className="area-flex-col mod-gap-l mod-padding-hero mod-align-left"
        style={{ flex: 1, width: '100%' }}
      >
        <h1 className="look-text-x7">Top Stocks</h1>
        <p className="look-text-x2 look-text-subtle">Curated picks and rankings will appear here soon.</p>
        <COM_Footer />
      </div>
    </div>
  );
}

export default PAG_TopStocks;
