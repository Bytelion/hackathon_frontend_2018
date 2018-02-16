// Chart.js scripts
// -- Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// -- Socket URL
var baseURL = 'http://ec2-34-203-202-182.compute-1.amazonaws.com:8080/';
var socket = io.connect(baseURL + 'bytecoin');

// -- Trade Chart
var ctx = document.getElementById("myAreaChart");
var timeLabels = [];
var volume = [];
var myLineChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: timeLabels,
    datasets: [{
      label: " Volume",
      lineTension: 0.0,
      backgroundColor: "rgba(2,117,216,0.2)",
      borderColor: "rgba(2,117,216,1)",
      pointRadius: 5,
      pointBackgroundColor: "rgba(2,117,216,1)",
      pointBorderColor: "rgba(255,255,255,0.8)",
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(2,117,216,1)",
      pointHitRadius: 20,
      pointBorderWidth: 2,
      data: volume,
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'date'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 16000,
          maxTicksLimit: 5
        },
        gridLines: {
          color: "rgba(0, 0, 0, .125)",
        }
      }],
    },
    legend: {
      display: false
    }
  }
});

function addData(chart, label, data) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach(function(dataset) {
    dataset.data.push(data);
  });
  chart.update();
}

function removeData(chart) {
  chart.data.labels.shift();
  chart.data.datasets.forEach(function(dataset) {
    dataset.data.shift();
  });
  chart.update();
}

function format(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

(function() {
  socket.on('connect', function() {
    console.log('connected');
  });
  socket.on('stats', function(response) {
    console.log(response);
    // -- Time Stamp
    var now = new Date($.now());
    var time = now.toLocaleTimeString();
    var elements = document.getElementsByClassName('time-stamp');
    for(var i=0; i < elements.length; i++) { 
      elements[i].innerHTML = 'Updated today at ' + time;
    }
    document.getElementById('current-price').innerHTML = '$' + format(response.bytecoin_price);
    document.getElementById('miner-count').innerHTML = response.miner_count;
    document.getElementById('total-work').innerHTML = response.total_work + ' kH/s';
    if (volume.length >= 10) {
      removeData(myLineChart)
    }
    addData(myLineChart, time, response.bytecoin_price);
  });
})();

function mine() {
  document.getElementById('start-mine').disabled = true;
  document.getElementById('stop-mine').disabled = false;
  socket.emit('add_miner');
}

function stopMine() {
  document.getElementById('start-mine').disabled = false;
  document.getElementById('stop-mine').disabled = true;
  socket.emit('subtract_miner');
}
