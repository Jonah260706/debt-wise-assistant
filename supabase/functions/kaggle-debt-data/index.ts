
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const KAGGLE_USERNAME = Deno.env.get("KAGGLE_USERNAME");
    const KAGGLE_KEY = Deno.env.get("KAGGLE_KEY");

    if (!KAGGLE_USERNAME || !KAGGLE_KEY) {
      throw new Error("Missing Kaggle API credentials");
    }

    // Parse request body for parameters
    let params;
    try {
      params = await req.json();
    } catch (err) {
      params = {};
    }

    const { action, country, year, limit = 10 } = params;

    // Base64 encode the Kaggle credentials for basic auth
    const credentials = btoa(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`);

    if (action === "fetchDatasets") {
      // Fetch datasets related to debt
      const response = await fetch(
        "https://www.kaggle.com/api/v1/datasets/list?search=global+debt",
        {
          headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "importData") {
      // This would typically download and process a specific dataset
      // For this example, we'll return mock data that would be inserted into the database
      
      // In a real implementation, you would:
      // 1. Download the dataset using Kaggle API
      // 2. Process the CSV/data file
      // 3. Insert the data into the Supabase database
      
      const mockDataToImport = [
        { country: "USA", year: 2023, debt_to_gdp_ratio: 120.5, household_debt_ratio: 78.3, government_debt_ratio: 102.4, corporate_debt_ratio: 85.1 },
        { country: "Japan", year: 2023, debt_to_gdp_ratio: 234.2, household_debt_ratio: 65.2, government_debt_ratio: 215.8, corporate_debt_ratio: 102.3 },
        { country: "Germany", year: 2023, debt_to_gdp_ratio: 69.8, household_debt_ratio: 58.1, government_debt_ratio: 66.7, corporate_debt_ratio: 78.4 },
        // Add more mock data as needed
      ];

      return new Response(JSON.stringify({ success: true, dataToImport: mockDataToImport }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "queryData") {
      // This would query the database for global debt data
      // In a real implementation, you would query the Supabase database directly
      
      let filterClause = "";
      const queryParams: any[] = [];
      
      if (country) {
        filterClause += " AND country = $1";
        queryParams.push(country);
      }
      
      if (year) {
        filterClause += ` AND year = $${queryParams.length + 1}`;
        queryParams.push(year);
      }
      
      // In a production implementation, you would execute this SQL query against your database
      const mockSql = `
        SELECT * FROM global_debt_data 
        WHERE 1=1 ${filterClause}
        ORDER BY year DESC, country ASC
        LIMIT ${limit}
      `;
      
      console.log("Would execute SQL:", mockSql, "with params:", queryParams);
      
      // For now, return mock data
      const mockResults = [
        { country: "USA", year: 2023, debt_to_gdp_ratio: 120.5, household_debt_ratio: 78.3, government_debt_ratio: 102.4, corporate_debt_ratio: 85.1 },
        { country: "Global Average", year: 2023, debt_to_gdp_ratio: 94.8, household_debt_ratio: 64.2, government_debt_ratio: 86.7, corporate_debt_ratio: 92.5 },
      ];

      return new Response(JSON.stringify({ success: true, data: mockResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
