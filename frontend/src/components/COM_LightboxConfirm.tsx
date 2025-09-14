import { useState } from 'react';

function COM_UnsubscribeNewsletter({
  prOpen,
  prHandleSubmit,
}: {
  prOpen: boolean;
  prHandleSubmit: () => void;
}) {
  const [stOpen, setStOpen] = useState(prOpen);
  if (!stOpen) return null;

  return (
    <>
      <div className="area-lightbox" onClick={() => setStOpen(false)}>
        <div className="look-div-container" style={{ width: '70%' }}>
          <div className="area-flex-col mod-gap-l">
            <h1 className="look-text-x6">Are you sure?</h1>
            <p className="mod-align-center">
              By proceeding, you cancel your stockz.ai newsletter subscription. This can be undone
              at any time.
            </p>
            <button onClick={() => setStOpen(false)} className="look-button-primary">
              Abort
            </button>
            <button onClick={prHandleSubmit} className="look-button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default COM_UnsubscribeNewsletter;
