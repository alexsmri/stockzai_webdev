import RadialScore from "./components/RadialScore";

function App() {
  return (
    <>
      <RadialScore score={8.5} scoreKPI="financial_score" />
      <RadialScore score={7.2} scoreKPI="valuation_score" />
    </>
  );
}

export default App;
