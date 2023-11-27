function fetchDataAndVisualize(filePath) {
    return fetch(filePath)
      .then(response => response.arrayBuffer())
      .then(data => {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log(jsonData);
          return jsonData;
      })
      .catch(error => console.error('Error fetching the file:', error));
  }

function scatterPlot() {
    // document.getElementById('chart').innerHTML = '';
    
    const dataSources = [
        'data/Área-ardida-e-incêndios-rurais.xlsx'
    ];

    // Fetch data from all sources concurrently
    const fetchDataPromises = dataSources.map(filePath => fetchDataAndVisualize(filePath));

    Promise.all(fetchDataPromises)
        .then(datasets => {
            console.log('All data fetched successfully');
            datasets.forEach((data, index) => {
                console.log(`Dataset ${index + 1}: `, data);
            });

            // Continue with your visualization
            visualizeScatterPlot(datasets);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function visualizeScatterPlot(data) {
    console.log('data: ', data);

    const years = data[0].slice(1).map(d => d[0]);
    console.log('years: ', years);  
    const fires = data[0].slice(1).map(d => d[1]);
    console.log('fires: ', fires);
    const burnedArea = data[0].slice(1).map(d => d[2]);
    console.log('burnedArea: ', burnedArea);

    const headers = ['years', 'fires', 'burnedArea'];
    const allData = data[0].slice(1).map((data, cindex) => {
        return data.reduce((obj, value, index) => {
          obj[headers[index]] = value;
          return obj;
        }, {'color': getColor(cindex)});
      });
      
    console.log(allData);

    // Set up dimensions for the scatter plot
    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 20, bottom: 30, left: 60 };

    

    // Create SVG container for the scatter plot
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + 30)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales for X and Y axes
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(fires)])
        .range([0, width]);
    console.log('xScale: ', xScale.domain());

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(burnedArea)])
        .range([height, 0]);
    console.log('yScale: ', yScale.domain());

    // Create X and Y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);


    // Create scatter plot points
    svg.selectAll('.scatter-point')
        .style('z-index', 20)
        .data(allData)
        .enter()
        .append('circle')
        .attr('fill', d => d.color)
        .attr('class', 'scatter-point')
        .attr('cx', d => xScale(d.fires))
        .attr('cy', d => yScale(d.burnedArea))
        .attr('r', 8)
        .on('mouseover', function (event, d) {
            d3.select(this).transition()
                .duration('2')
                .attr('r', '10');
    
            // Display the tooltip
            d3.select("#tooltip").style('opacity', 1)
                .html(`Fires: ${d.fires}<br>Burned Area: ${d.burnedArea}<br>`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        })
        .on('mouseout', function () {
            d3.select(this).transition()
                .duration('2')
                .attr('r', '8');
    
            // Hide the tooltip
            d3.select("#tooltip").style('opacity', 0);
        });

    // Add labels to the scatter points
    svg.selectAll('.label')
        .style('z-index', 10)
        .data(allData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.fires) + 10)
        .attr('y', d => yScale(d.burnedArea) + 4)  // Adjust label position
        .attr('fill', d => d.color)
        .text(d => d.years);

    // Add labels to the axes
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2 - 100)
        .attr('y', height + margin.top)  // Adjust label position
        .text('Total Number of Fires');

    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', -60)
        .attr('y', height + margin.bottom - 740)  // Adjust label position
        .text('Burned Area (ha)');

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Fires and burned area in Portugal from ${years[0]} to ${years[years.length - 1]}`);

}

// Function to get different colors for each line
function getColor(index) {
    const colors = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
        "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
        "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
        "#393b79", 
      ];
    return colors[index % colors.length];
}