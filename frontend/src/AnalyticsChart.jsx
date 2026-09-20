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
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsChart({ siteId }) {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/analytics/site/${siteId}`
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error(
          "Error fetching analytics:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [siteId]);

  if (loading) {
    return (
      <div className="chart-empty-state">
        <p>Loading performance data...</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No analytics data available for this site.</p>
      </div>
    );
  }

  const labels = analytics.map((item) => item.date);

  const carbonValues = analytics.map(
    (item) => item.carbon_value
  );

  const biodiversityValues = analytics.map(
    (item) => item.biodiversity_score
  );

  const latestCarbon =
    carbonValues[carbonValues.length - 1];

  const latestBiodiversity =
    biodiversityValues[
      biodiversityValues.length - 1
    ];

  const firstCarbon = carbonValues[0];

  const carbonChange =
    firstCarbon !== 0
      ? (
          ((latestCarbon - firstCarbon) /
            firstCarbon) *
          100
        ).toFixed(1)
      : "0.0";

  const data = {
    labels,

    datasets: [
      {
        label: "Carbon Value",
        data: carbonValues,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: false,
      },
      {
        label: "Biodiversity Score",
        data: biodiversityValues,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",
        align: "start",

        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },

      tooltip: {
        backgroundColor: "rgba(25, 35, 28, 0.95)",
        padding: 12,
        cornerRadius: 10,

        titleFont: {
          size: 13,
          weight: "600",
        },

        bodyFont: {
          size: 13,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 11,
          },
        },
      },

      y: {
        beginAtZero: false,

        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },

        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="analytics-chart">

      {/* SUMMARY METRICS */}

      <div className="analytics-summary">

        <div className="analytics-metric">
          <span>Latest Carbon</span>

          <strong>
            {latestCarbon}
          </strong>

          <small>
            {carbonChange >= 0 ? "+" : ""}
            {carbonChange}% since first reading
          </small>
        </div>

        <div className="analytics-metric">
          <span>Biodiversity Score</span>

          <strong>
            {latestBiodiversity}
          </strong>

          <small>
            Latest recorded score
          </small>
        </div>

        <div className="analytics-metric">
          <span>Data Points</span>

          <strong>
            {analytics.length}
          </strong>

          <small>
            Recorded measurements
          </small>
        </div>

      </div>

      {/* CHART */}

      <div className="chart-container">
        <Line
          data={data}
          options={options}
        />
      </div>

    </div>
  );
}

export default AnalyticsChart;