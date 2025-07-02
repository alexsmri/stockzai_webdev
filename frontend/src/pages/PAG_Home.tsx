import COM_Navbar from "../components/COM_Navbar";
import COM_Hero from "../components/COM_Hero";

function PAG_Home () {
    return (
    <>
    <COM_Navbar />
    <COM_Hero>
    <h1 className="look-text-x7">Master the Market. Effortlessly.</h1>
    <div className="area-flex-col look-div-container">
        <h3 className="look-text-x4">Last month's best predictions</h3>
        <div className="area-flex-row">
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
    </div>
    </COM_Hero>
    </>
)
}

export default PAG_Home;
