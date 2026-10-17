import COM_LandDocLayout from '../components/landing/COM_LandDocLayout';

function PAG_Disclaimer() {
  return (
    <COM_LandDocLayout prTitle="Disclaimer">
      <h2>Disclaimer / No Financial Advice</h2>
      <p>The information, analyses, and scores provided on this website are for <strong>informational and educational purposes only</strong>.<br />They do <strong>not</strong> constitute investment advice, financial analysis, or a recommendation to buy or sell any financial instruments within the meaning of Section 63 (6) of the German Securities Trading Act (<em>Wertpapierhandelsgesetz</em>, WpHG) or any equivalent international regulations.</p>
      <p>All data, metrics, and scores are generated automatically based on publicly available information (primarily by Yahoo Finance's public API) and may be incomplete, inaccurate, or outdated.<br />While the operator of this website takes reasonable care to ensure the accuracy and reliability of the displayed information, <strong>no guarantee is given</strong> regarding its completeness, correctness, or timeliness.</p>
      <p>The presented scores and analyses do <strong>not</strong> consider the individual financial situation, investment objectives, or risk tolerance of any user.<br />Before making any investment decisions, users should consult a licensed financial advisor or another qualified professional.</p>
      <p>The operator of this website <strong>assumes no liability</strong> for any direct or indirect losses, damages, or lost profits resulting from the use of, reliance upon, or interpretation of the information provided on this platform.<br />All use of the website and its data is at the user’s own risk.</p>
      <p>The content and calculations are subject to change without notice and may be modified, removed, or updated at any time.</p>
    </COM_LandDocLayout>
  );
}

export default PAG_Disclaimer;
