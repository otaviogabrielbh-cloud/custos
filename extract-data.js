const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'c:\\Users\\otavio.gabriel\\Downloads\\incentivo.xlsx';
const outputPath = './data.json';

try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log('Dados convertidos com sucesso para data.json');
    console.log('Número de registros:', data.length);
    if (data.length > 0) {
        console.log('Colunas encontradas:', Object.keys(data[0]));
    }
} catch (error) {
    console.error('Erro ao ler o arquivo Excel:', error.message);
}
