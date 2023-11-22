// Function to load the XLSX file and process data
function loadAndRenderChart() {
  // Path to your XLSX file
  const fileUrl = 'data/Exportações-dos-produtos-de-origem-florestal.xlsx';
  // Load the XLSX file
  fetch(fileUrl)
    .then((response) => response.arrayBuffer())
    .then((data) => {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets['Sheet1'];
      // Convert XLSX data to an array of objects
      const dataArr = XLSX.utils.sheet_to_json(sheet);
    });


    d3.XLSX('data/Exportações-dos-produtos-de-origem-florestal.xlsx')
        .then(data => {
        console.log(data);
        })
        .catch(function(err){console.log(err)});
}