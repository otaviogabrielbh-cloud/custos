const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

// O primeiro item contém os subtítulos que vamos usar para compor os nomes das colunas
const headers = rawData[0];
const data = rawData.slice(1);

const columnMap = {
    "__EMPTY": "codigo",
    "__EMPTY_1": "descricao",
    "tabela SES": "ses_sh",
    "__EMPTY_2": "ses_sp",
    "__EMPTY_3": "ses_total",
    "Tabela SMSA_original": "smsa_orig_sh",
    "__EMPTY_4": "smsa_orig_sp",
    "__EMPTY_5": "smsa_orig_total",
    "Tabela SMSA vigente 2025": "smsa_vigente_sh",
    "__EMPTY_6": "smsa_vigente_sp",
    "__EMPTY_7": "smsa_vigente_total",
    "MAIOR TABELA 2025": "maior_2025_sh",
    "__EMPTY_8": "maior_2025_sp",
    "__EMPTY_9": "maior_2025_total",
    "FAEC": "faec_sh",
    "__EMPTY_10": "faec_sp",
    "__EMPTY_11": "faec_total",
    "MAIOR TABELA 2025_1": "maior_ref_sh",
    "__EMPTY_12": "maior_ref_sp",
    "__EMPTY_13": "maior_ref_total",
    " SIGTAP_2025": "sigtap_sh",
    "__EMPTY_14": "sigtap_sp",
    "__EMPTY_15": "sigtap_total"
};

const processedData = data.map(item => {
    let newItem = {};
    for (let key in columnMap) {
        let value = item[key];

        // Limpeza básica: converter zeros para null ou manter se for numérico relevante
        if (value === 0 || value === "0") value = 0;

        newItem[columnMap[key]] = value;
    }
    return newItem;
}).filter(item => item.codigo && item.descricao); // Remover linhas vazias ou sem código/descrição

fs.writeFileSync('./processed_data.json', JSON.stringify(processedData, null, 2));
console.log('Dados processados com sucesso. Total de registros úteis:', processedData.length);
