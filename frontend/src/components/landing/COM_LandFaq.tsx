import { useState } from 'react';
import { LANDING_FAQ } from './landingContent';

function COM_LandFaq() {
  const [stOpenIndex, setStOpenIndex] = useState<number | null>(null);

  return (
    <section className="lp-section lp-faq">
      <p className="lp-title lp-title-m lp-reveal">
        <span className="lp-dim">Your</span> <span className="lp-bright">time matters.</span>
        <br />
        <span className="lp-dim">Don't waste it analyzing.</span>
      </p>
      <h2 className="lp-title lp-title-l lp-faq-title lp-reveal">FAQ</h2>
      <div className="lp-faq-list lp-reveal lp-reveal-d1">
        {LANDING_FAQ.map(({ question, answer }, index) => {
          const isOpen = stOpenIndex === index;
          return (
            <div key={question} className={isOpen ? 'lp-faq-item lp-faq-item-open' : 'lp-faq-item'}>
              <button
                type="button"
                className="lp-faq-question"
                aria-expanded={isOpen}
                onClick={() => setStOpenIndex(isOpen ? null : index)}
              >
                <span className="lp-faq-icon" aria-hidden="true" />
                {question}
              </button>
              {isOpen && <p className="lp-faq-answer">{answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default COM_LandFaq;
