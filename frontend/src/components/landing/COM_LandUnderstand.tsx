import { LANDING_IMAGES } from '../../assets/landing';
import DCOM_LandText from './DCOM_LandText';
import { LANDING_UNDERSTAND } from './landingContent';

function COM_LandUnderstand() {
  return (
    <section className="lp-section lp-understand">
      <div className="lp-understand-text lp-reveal">
        {LANDING_UNDERSTAND.map((line, index) => (
          <p key={index} className="lp-title lp-title-m">
            <DCOM_LandText prSegments={line} />
          </p>
        ))}
      </div>
      <img
        className="lp-understand-image lp-tilt-dashboard lp-shadow lp-reveal lp-reveal-d2"
        src={LANDING_IMAGES.understandDashboard}
        alt="stockz.ai company page for Microsoft"
      />
    </section>
  );
}

export default COM_LandUnderstand;
