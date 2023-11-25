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

