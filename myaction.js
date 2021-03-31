var requestSize = 13

var pageSize = 240
var totalNum = 0
var lastPage = 0

var totalData = []
var totalOriginalData = []
var totalPredictData = []

//http://39.170.24.100:39090
//https://yun.1475ipfs.com

var domain = "https://yun.1475ipfs.com"

var settings = {
  "url": domain + "/gas/forecast/result/?page=1",
  "method": "GET",
  "timeout": 0,
  "async": false,
  "headers": {
    "Authorization": "Basic bHk6MTIzNDU2Nzg="
  },
};

$.ajax(settings).done(function (response) {
  totalNum = response.count

  lastPage = Math.ceil(totalNum / pageSize)
  prevPage = lastPage - requestSize

  console.log(prevPage, lastPage, totalNum)

  for (let i = prevPage; i < lastPage; i++) {
    var url = {
      "url": domain + "/gas/forecast/result/?page=" + i,
      "method": "GET",
      "timeout": 0,
      "async": false,
      "headers": {
        "Authorization": "Basic bHk6MTIzNDU2Nzg="
      },
    };

    $.ajax(url).done(function (response) {
      response.results.forEach(element => {
        if (element.parent_basefee > 100) {
          originData = []
          originData.push(element.epoch)
          originData.push(element.parent_basefee)

          realData = []
          realData.push(element.epoch)
          realData.push(element.retest_median)

          predictData = []
          predictData.push(element.epoch)
          predictData.push(element.prodict_median)

          totalData.push(realData)
          totalOriginalData.push(originData)
          totalPredictData.push(predictData)
        }
      });
    })
  }

  for (let i = 0; i < totalData.length; i++) {
    const element = totalData[i];
    element[0] -= 120
  }

  totalData = totalData.slice(120, totalData.length)

  console.log(totalData)
  console.log(totalOriginalData)
  console.log(totalPredictData)

  var chart = null;
  $(document).ready(function () {
    Highcharts.chart('container', {
      chart: {
        zoomType: 'x'
      },
      title: {
        text: 'Gas Prediction Graph'
      },
      subtitle: {
        text: document.ontouchstart === undefined ?
          'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Basefee'
        }
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },

      series: [{
        type: 'area',
        name: '回测120轮中位数',
        data: totalData,
      }, {
        type: 'area',
        name: '预测120轮中位数',
        data: totalPredictData
      }, {
        type: 'area',
        name: '真实ParentBaseFee',
        data: totalOriginalData
      }]
    });
  });
});