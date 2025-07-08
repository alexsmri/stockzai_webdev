import { useEffect, useState } from "react";
import { sleep } from "../utils/functions";

// I need an AlertStore to manage Alerts across my Site

interface PRI_Alert {
    prSignal: boolean
    prMessage: string;
    prType?: "success" | "neutral" | "failure";

}

function COM_Alert({prSignal, prMessage, prType = "neutral"}: PRI_Alert) {

    const [stIsOpen, setStIsOpen] = useState(false)

    useEffect(() => {
    if (prSignal) {
        (async () => {
            setStIsOpen(true);
            await sleep(3000);
            setStIsOpen(false);
        })();
    }
    }, [prSignal]);

    return (
        <>
        {stIsOpen && 
        <div className={`look-alert-${prType} mod-z-top`}>
            <p>{prMessage}</p>
        </div>
        }
        </>
    )
}

export default COM_Alert;