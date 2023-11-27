function fetchDataAndVisualize(filePath) {
    return fetch(filePath)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            return jsonData;
        })
        .catch(error => console.error('Error fetching the file:', error));
}

function radarPlot(year) {
    document.getElementById('chart').innerHTML = '';
    
    const dataSources = [
        'data/Exportações-dos-produtos-de-origem-florestal.xlsx',
        'data/Importações-dos-produtos-de-origem-florestal.xlsx'
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
            visualizeRadarPlot(datasets, ['Export', 'Import'], parseInt(year));
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function visualizeRadarPlot(datasets, titles, year) {

    const yearIndex = datasets[0].findIndex(row => row[0] === year);
    console.log('Year index: ', yearIndex);

    const exportData = datasets[0][yearIndex].slice(2);
    const importData = datasets[1][yearIndex].slice(2);
    console.log('Export data: ', exportData);

    const categories = datasets[0][0].slice(2); 

    // Define chart dimensions
    const margin = { top: 40, right: 10, bottom: 100, left: 10 };
    const width = 1500 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create an SVG container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 40)
        .attr("height", height + margin.top + margin.bottom + 10)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales
    const xScale = d3.scaleBand()
        .domain(categories)
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(exportData.concat(importData))])
        .range([height, 0]);

    // Create a group for the chart
    const chartGroup = svg.append("g")
        .attr("transform", `translate(50, 50)`);

    // Add bars for exportation
    chartGroup.selectAll(".bar-export")
        .data(exportData)
        .enter().append("rect")
        .attr("class", "bar bar-export")
        .attr("x", (d, i) => xScale(categories[i]) + xScale.bandwidth() / 4) // Adjust the position based on your preference
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth() / 2) // Adjust the width based on your preference
        .attr("height", d => height - yScale(d));

    // Add bars for importation
    chartGroup.selectAll(".bar-import")
        .data(importData)
        .enter().append("rect")
        .attr("class", "bar bar-import")
        .attr("x", (d, i) => xScale(categories[i]) + xScale.bandwidth() / 2) // Adjust the position based on your preference
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth() / 2) // Adjust the width based on your preference
        .attr("height", d => height - yScale(d));

    // Add axes and labels
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chartGroup.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    chartGroup.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Add labels for each bar
    chartGroup.selectAll(".bar-label")
        .data(categories)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => xScale(categories[i]) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(0) + 20) // Adjust the y position based on your preference
        .attr("text-anchor", "middle");


    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Comparison of Exportation and Importation of Forest Products in ${year}`);
}