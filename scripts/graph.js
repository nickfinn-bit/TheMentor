const chartElement = document.getElementById('chartDiv')

new Chart(chartElement, {
  type: 'bar',
  data: {
    labels: ['With our service', 'Without our service'],
    datasets: [{
      label: 'Students getting into target uni',
      data: [85, 63],
      backgroundColor: ['#7E1633', 'rgb(200, 200, 200)'],
      barThickness: 76,
    }]
  },
  options: {
    indexAxis: 'y',
    showTooltips: false,
    responsive: true, 
    maintainAspectRatio: false, 
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 16,
            family: '"Merriweather", serif, times',
            weight: 600,    
          },
          color: '#000'
        },
      },
      x: {
        ticks: {
          color: '#000', 
          font: {
            size: 16,
            family: '"Merriweather", serif, times',
            weight: 600,
          }
        },
        grid: {
          display: false
        },
        border: {
          display: false 
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      },
      hover: {
        mode: null
      },
    }
  }
});
