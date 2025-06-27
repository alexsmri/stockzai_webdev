import CO_Navbar from "../components/CO_Navbar";
import CO_Hero from "../components/CO_Hero";

function Home () {
    return (
    <>
    <CO_Navbar />
    <CO_Hero>
    <h1 className="look-text-x7">Master the Market. Effortlessly.</h1>
    <div className="area-flex-row look-div-container">
        <div className="area-flex-col look-div-container">
            <p className="look-text-x4">AAPL</p>
        </div>
        <div className="area-flex-col look-div-container">
            <p className="look-text-x4">AAPL</p>
        </div>
        <div className="area-flex-col look-div-container">
            <p className="look-text-x4">AAPL</p>
        </div>
    </div>
    </CO_Hero>
    </>
)
}

export default Home;