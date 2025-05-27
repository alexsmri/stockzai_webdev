import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api"

function CompaniesPage () {
    const symbol = useParams<{ symbol: string }>()

    const getCompany = async (symbol: any) => {
      const company = await api.get(`/api/companies/${symbol}/`)
      return company;
    }

    const [companyJSON, setcompanyJSON] = useState({})

    useEffect(() => {
      (async () => {
        if (!symbol) return;
        const company = await getCompany(symbol);
        setcompanyJSON(company.data)
      })
    }, [symbol])
    

    return <div>{JSON.stringify(companyJSON, null, 2)}</div>
}

export default CompaniesPage;