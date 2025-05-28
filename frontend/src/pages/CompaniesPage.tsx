import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api"
import InfoSection from "../components/InfoSection";

function CompaniesPage () {
    const { symbol } = useParams<{ symbol: string }>();
    
    const [companyJSON, setcompanyJSON] = useState({})

    const getCompany = async (symbol: string) => {
      const company = await api.get(`/api/companies/${symbol}/`)
      return company;
    }

    useEffect(() => {
      (async () => {
        if (!symbol) return;
        const company = await getCompany(symbol);
        setcompanyJSON(company.data)
      })();
    }, [symbol])
    

    return <InfoSection />
}

export default CompaniesPage;