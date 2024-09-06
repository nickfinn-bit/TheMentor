const chartElement = document.getElementById('chartDiv')

Chart.defaults.plugins.tooltip = false;

new Chart(chartElement, {
  type: 'bar',
  data: {
    labels: ['With our service', 'Without our service'],
    datasets: [{
      label: 'Students getting into target uni',
      data: [85, 63],
      backgroundColor: '#7E1633, rgb(240, 240, 240)',
    }]
  },
  options: {
    indexAxis: 'y',
    showTooltips: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 24,
            family: '"Merriweather", serif, times',
            weight: 600,
          }
        }
      }
    }
  }
});
