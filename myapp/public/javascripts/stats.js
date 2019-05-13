window.onload = function() {
  axios.get(`/stats/coordinates`);

  var ctx = document.getElementById('myChart');
  var ctx2 = document.getElementById('ownedChart');
  var ctx3 = document.getElementById('wishedChart');
  var ctx4 = document.getElementById('exchangedChart');

  drawnBarChart = (response, myCtx, myLabel, myText) => {
    new Chart(myCtx, {
      type: 'bar',
      data: {
        labels: response.data[2].slice(0,5),
        datasets: [
          {
            label: myLabel,
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: response.data[0].slice(0,5)
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          fontSize: 40,
          fontColor: "rgb(9, 85, 15)",
          text: myText
        },
        scales: {
          yAxes: [{
              ticks: {
                  fontColor: "rgb(9, 85, 15)",
                  fontSize: 24
              }
          }],
          xAxes: [{
              ticks: {
                  fontColor: "rgb(9, 85, 15)",
                  fontSize: 28
              }
          }]
      }
      }
    })
  }
  
  axios.get(`/stats/ages`)
    .then( response => {
        const counts = response.data;
        
        var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["Less 20 years", "Between 20 and 30 years", "Between 30 and 40 years", "Above 40 years"],
                datasets: [
                  {
                    label: "Age (years)",
                    backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
                    data: counts
                  }
                ]
              },
            options: {
              title: {
                display: true,
                fontSize: 40,
                fontColor: "rgb(9, 85, 15)",
                text: 'Users Age'
              },
              legend:{
                labels:{
                  fontSize: 40
                }
              }
            }
        });
    })
    .catch(console.log)

    Chart.scaleService.updateScaleDefaults('linear', {
      ticks: {
          min: 0,
          stepSize: 1,
      }
    });

    axios.get(`/stats/ownedMost`)
      .then( response => {
        var ownedChart = drawnBarChart(response, ctx2, "Owned Times", 'Most Owned Games');
      })
      .catch(console.log)

      axios.get(`/stats/wishedMost`)
      .then( response => {
        var wishedChart = drawnBarChart(response, ctx3, "Wished Times", 'Most Wished Games');
      })
      .catch(console.log)

      axios.get(`/stats/exchangedMost`)
      .then( response => {
        var exchangedChart = drawnBarChart(response, ctx4, "Exchanged Times", 'Most Exchanged Games');
      })
      .catch(console.log)

}

