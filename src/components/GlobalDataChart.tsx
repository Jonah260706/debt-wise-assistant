import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const GlobalDataChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Parse the CSV file
        Papa.parse('/public/data/central_government_debt.csv', {
            download: true,
            header: true,
            complete: (results) => {
                setData(results.data);
            },
        });
    }, []);

    return (
        <div>
            <h2>Global Government Debt Data</h2>
            <LineChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Debt" stroke="#8884d8" />
            </LineChart>
        </div>
    );
};

export default GlobalDataChart; 