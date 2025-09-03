import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function COM_LightboxTimed() {
  const [stOpen, setStOpen] = useState(false);
  const utFeedbackLink = '/feedback';
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setStOpen(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  if (!stOpen) return null;

  return (
    <>
      <div className="area-lightbox" onClick={() => setStOpen(false)}>
        <div className="look-div-container" style={{ width: '70%' }}>
          <div className="area-flex-col mod-gap-l">
            <h1 className="look-text-x6">Your Input Matters.</h1>
            <p className="mod-align-center">
              As a Beta user, you get the opportunity to test stockz.ai before anybody else. With
              one minute of your time, you can help me a great deal by filling out the feedback
              form.
            </p>
            <button
              className="look-button-primary"
              onClick={() => {
                navigate(utFeedbackLink);
              }}
            >
              Give Feedback
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
