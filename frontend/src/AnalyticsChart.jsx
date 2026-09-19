import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsChart({ siteId }) {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/analytics/site/${siteId}`
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [siteId]);

  if (analytics.length === 0) {
    return <p>No analytics data available for this site.</p>;
  }

  const data = {
    labels: analytics.map((item) => item.date),

    datasets: [
      {
        label: "Carbon Value",
        data: analytics.map((item) => item.carbon_value),
        tension: 0.3,
      },
      {
        label: "Biodiversity Score",
        data: analytics.map((item) => item.biodiversity_score),
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Site Performance</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default AnalyticsChart;