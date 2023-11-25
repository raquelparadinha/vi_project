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

function scatterPlot(year) {
    const filePath = 'data/Área-ardida-e-incêndios-rurais.xlsx';

    // Fetch data from all sources concurrently
    const fetchData = fetchDataAndVisualize(filePath);
    console.log('fetchData: ', fetchData);

    Promise.all(fetchDataPromises)
        .then(datasets => {
            console.log('All data fetched successfully');
            datasets.forEach((data, index) => {
                console.log(`Dataset ${index + 1}: `, data);
            });

            // Continue with your visualization
            visualizeScatterPlot(datasets, year);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function visualizeScatterPlot(data, year) {
    console.log('data: ', data);

}

function draft() {
    // Set up dimensions for the scatter plot
    const width = 500;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Create SVG container for the scatter plot
    const svg = d3.select('#scatter-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales for X and Y axes
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.fires)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.burnedArea)])
        .range([height, 0]);

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
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'scatter-point')
        .attr('cx', d => xScale(d.fires))
        .attr('cy', d => yScale(d.burnedArea))
        .attr('r', 5);  // Adjust the radius based on your preference
}