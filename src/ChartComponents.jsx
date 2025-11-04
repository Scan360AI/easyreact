import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  LineController,
  BarController,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  LineController,
  BarController,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Componente base per Chart
const ChartWrapper = ({ type, data, options, className = '' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    // Distruggi il grafico esistente se presente
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Crea il nuovo grafico
    chartInstance.current = new ChartJS(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options
      }
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className={`chart-container ${className}`}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

// Grafico Trend Economico
export const EconomicTrendChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      borderWidth: 3,
      tension: 0.3,
      pointRadius: 5,
      pointBackgroundColor: ds.borderColor
    }))
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Valore (Mâ‚¬)',
          font: { family: 'Titillium Web' }
        },
        ticks: { font: { family: 'Titillium Web' } }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Percentuale %',
          font: { family: 'Titillium Web' }
        },
        grid: { drawOnChartArea: false },
        ticks: { font: { family: 'Titillium Web' } }
      },
      x: {
        ticks: { font: { family: 'Titillium Web' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      }
    }
  };

  return <ChartWrapper type="line" data={data} options={options} />;
};

// Grafico SostenibilitÃ  del Debito
export const DebtSustainabilityChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      borderWidth: ds.type === 'line' ? 2 : 1
    }))
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Multiplo',
          font: { family: 'Titillium Web' }
        },
        ticks: { font: { family: 'Titillium Web' } }
      },
      x: {
        ticks: { font: { family: 'Titillium Web' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      }
    }
  };

  return <ChartWrapper type="bar" data={data} options={options} />;
};

// Grafico Capitale Circolante
export const WorkingCapitalChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets
  };

  const options = {
    scales: {
      y: {
        title: {
          display: true,
          text: 'Giorni',
          font: { family: 'Titillium Web' }
        },
        ticks: { font: { family: 'Titillium Web' } }
      },
      x: {
        ticks: { font: { family: 'Titillium Web' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      }
    }
  };

  return <ChartWrapper type="bar" data={data} options={options} />;
};

// Grafico Stress Test
export const StressTestChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      borderWidth: ds.borderDash ? 2 : 3,
      tension: ds.borderDash ? 0 : 0.3,
      fill: ds.fill || false,
      pointRadius: ds.borderDash ? 0 : 4
    }))
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'DSCR (x)',
          font: { family: 'Titillium Web' }
        },
        ticks: { font: { family: 'Titillium Web' } }
      },
      x: {
        title: {
          display: true,
          text: 'Variazione Ricavi',
          font: { family: 'Titillium Web' }
        },
        ticks: { font: { family: 'Titillium Web' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      }
    }
  };

  return <ChartWrapper type="line" data={data} options={options} />;
};

// Grafico Radar Benchmark
export const BenchmarkRadarChart = ({ chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(ds => ({
      ...ds,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: ds.borderColor
    }))
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          font: {
            size: 12,
            family: 'Titillium Web'
          }
        },
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const labels = ['', 'Basso', '', 'Medio', '', 'Alto'];
            return labels[value];
          },
          font: { family: 'Titillium Web' }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const labels = ['Molto basso', 'Basso', 'Sotto media', 'Medio', 'Sopra media', 'Eccellente'];
            const value = context.raw;
            return `${context.dataset.label}: ${labels[value-1] || ''} (Q${value})`;
          }
        }
      }
    }
  };

  return <ChartWrapper type="radar" data={data} options={options} className="radar-container" />;
};

// Grafico Evoluzione Rating
export const RatingEvolutionChart = ({ chartData }) => {
  const { ratingMap, scoreMap } = chartData;
  
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((ds, idx) => ({
      ...ds,
      borderWidth: 3,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: ds.borderColor,
      yAxisID: idx === 0 ? 'y' : 'y1'
    }))
  };

  const options = {
    scales: {
      y: {
        reverse: true,
        min: 1,
        max: 10,
        position: 'left',
        title: {
          display: true,
          text: 'Rating',
          font: { family: 'Titillium Web' }
        },
        ticks: {
          callback: function(value) {
            return ratingMap[value] || value;
          },
          font: { family: 'Titillium Web' }
        }
      },
      y1: {
        reverse: true,
        min: 1,
        max: 5,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: 'Risk Score',
          font: { family: 'Titillium Web' }
        },
        ticks: {
          callback: function(value) {
            return scoreMap[value] || value;
          },
          font: { family: 'Titillium Web' }
        }
      },
      x: {
        ticks: { font: { family: 'Titillium Web' } }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Titillium Web' }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Rating') {
              return `Rating: ${ratingMap[context.raw]}`;
            } else {
              const scoreDescMap = {
                1: 'ottimale', 2: 'nella media', 3: 'superiore alla media',
                4: 'elevato', 5: 'molto elevato'
              };
              return `Risk Score: ${scoreMap[context.raw]} (${scoreDescMap[context.raw]})`;
            }
          }
        }
      }
    }
  };

  return <ChartWrapper type="line" data={data} options={options} />;
};

export default ChartWrapper;
