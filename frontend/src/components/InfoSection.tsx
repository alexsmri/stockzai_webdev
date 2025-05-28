import RadialScore from "./RadialScore"

interface InfoSectionProps {
    info_role: "scores" | "basics" | "financials" 
    info: JSON
}

function InfoSection(props: InfoSectionProps) {
    const info = props.info

    return (
    <>
    <div>
        <RadialScore score={8} scoreKPI="financial_score"/>
        <RadialScore score={8} scoreKPI="valuation_score"/>
    </div>
    </>
    )
}

export default InfoSection;