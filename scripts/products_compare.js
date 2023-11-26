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
            visualizeRadarPlot(datasets, ['Export', 'Import'], year);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function visualizeRadarPlot(datasets, titles, year) {
    const svg = d3.select("#chart");

    // Define chart dimensions
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    // Set up the radar chart properties
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    // Create a group for the chart
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left + chartWidth / 2}, ${margin.top + chartHeight / 2})`);
}

