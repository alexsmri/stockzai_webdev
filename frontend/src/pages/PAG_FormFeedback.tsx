import COM_FormFeedback from '../components/COM_FormFeedback';
import COM_Sidebar from '../components/COM_Sidebar';

export default function PAG_FormFeedback() {
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
        <COM_FormFeedback />
      </div>
    </div>
  );
}
