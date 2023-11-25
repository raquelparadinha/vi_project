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

function lineChart(product) {
    document.getElementById('chart').innerHTML = '';
    
    const dataSources = [
        'data/Exportações-dos-produtos-de-origem-florestal.xlsx',
        'data/Importações-dos-produtos-de-origem-florestal.xlsx',
        'data/Saldo-da-balança-dos-produtos-de-origem-florestal.xlsx'
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
            visualizeLinePlot(datasets, ['Export', 'Import', 'Balance'], product);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function visualizeLinePlot(datasets, titles, product) {
    const labels = datasets[0].slice(0, 1);
    const product_id = labels[0].indexOf(product);  // index of the product
    console.log('product_id: ', product_id);
    const years = datasets[0].slice(1).map(d => d[0]);
    const totalData = datasets[0].slice(2).map(d => d[product_id]).concat(datasets[1].slice(2).map(d => d[product_id]), datasets[2].slice(2).map(d => d[product_id]));
    console.log('Totals: ', totalData);

    // Set up the SVG and its dimensions
    const margin = { top: 100, right: 20, bottom: 30, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Create an SVG container
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up the scales
    const xScale = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([0, width]);
    const yScale = d3.scaleLinear().domain([d3.min(totalData), d3.max(totalData)]).range([height, 0]);
    console.log('yScale domain: ', yScale.domain());
    // Define the line generator
    let line = d3.line()
        .x((d, i) => xScale(years[i]))
        .y(d => yScale(d));

    // Add lines for each dataset
    datasets.forEach((data, index) => {
        // Extracting values for the current dataset
        const values = data.slice(1).map(d => d[product_id]); // Assuming the product values are at index 3
        console.log(`Values for dataset ${index + 1}: `, values);
        // Add the line to the chart
        
        svg.append("path")
            .attr("class", "line")
            .attr("d", line(values))
            .attr("fill", "none")
            .attr("stroke", getColor(index))
            .attr("stroke-width", 2); 

        // Add a legend for the current dataset
        svg.append("text")
            .attr("x", width - 100)
            .attr("y", index * 20)
            .attr("text-anchor", "end")
            .style("fill", getColor(index))
            .text(titles[index]);
    });

    // Add the X Axis with formatted ticks
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Comparison of Exportation, Importation and Balance (Thousands of Euros)  - ${product}`);
}

// Function to get different colors for each line
function getColor(index) {
    const colors = ["green", "red", "blue"]; // Add more colors as needed
    return colors[index % colors.length];
}