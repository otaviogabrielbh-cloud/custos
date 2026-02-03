let allData = [];
let filteredData = [];
let currentFilter = 'all';

const searchInput = document.getElementById('searchInput');
const resultsGrid = document.getElementById('resultsGrid');
const resultCount = document.getElementById('resultCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('detailsModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-btn');

console.log('App iniciado. Verificando ambiente...');

// Verificar se está rodando via arquivo local
if (window.location.protocol === 'file:') {
    alert('Atenção: Para o buscador funcionar, você precisa usar o link http://localhost:8080 ou abrir através de um servidor. O navegador bloqueia o carregamento de dados quando o arquivo é aberto diretamente.');
}

// Carregar dados
async function loadData() {
    console.log('Tentando carregar data.json...');
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        allData = await response.json();
        console.log(`Dados carregados: ${allData.length} registros.`);

        filteredData = [...allData];
        renderResults();
    } catch (error) {
        console.error('Erro detalhado ao carregar dados:', error);
        resultsGrid.innerHTML = `
            <div class="error-container">
                <i data-lucide="alert-circle"></i>
                <p>Erro ao carregar os dados: ${error.message}</p>
                <p>Certifique-se de que o servidor está rodando em http://localhost:8080</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// Renderizar resultados
function renderResults() {
    resultsGrid.innerHTML = '';

    // Pegar apenas os primeiros 50 resultados que batem com a busca para performance
    const displayData = filteredData.slice(0, 50);

    if (filteredData.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <p>Nenhum procedimento encontrado para "${searchInput.value}"</p>
            </div>
        `;
    } else {
        displayData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => showDetails(item);

            const price = formatCurrency(item.maior_2025_total || item.sigtap_total || 0);

            card.innerHTML = `
                <span class="card-code">${item.codigo}</span>
                <h3 class="card-title">${item.descricao}</h3>
                <div class="card-footer">
                    <span class="card-price">${price}</span>
                    <span class="card-tag">${getBestTable(item)}</span>
                </div>
            `;
            resultsGrid.appendChild(card);
        });

        if (filteredData.length > 50) {
            const moreInfo = document.createElement('div');
            moreInfo.className = 'more-info';
            moreInfo.textContent = `Mostrando 50 de ${filteredData.length} resultados. Refine sua busca...`;
            resultsGrid.appendChild(moreInfo);
        }
    }

    resultCount.textContent = `${filteredData.length} registros`;
}

// Lógica de Busca Aprimorada
function handleSearch() {
    const rawQuery = searchInput.value.toLowerCase().trim();
    const queryTerms = rawQuery.split(' ').filter(t => t.length > 0);

    filteredData = allData.filter(item => {
        const itemCode = item.codigo ? item.codigo.toString() : '';
        const itemDesc = item.descricao ? item.descricao.toLowerCase() : '';

        // Deve conter todos os termos da busca (AND)
        const matchSearch = queryTerms.every(term =>
            itemCode.includes(term) || itemDesc.includes(term)
        );

        let matchFilter = true;
        if (currentFilter === 'ses') matchFilter = Number(item.ses_total) > 0;
        if (currentFilter === 'smsa') matchFilter = Number(item.smsa_vigente_total) > 0;
        if (currentFilter === 'sigtap') matchFilter = Number(item.sigtap_total) > 0;

        return matchSearch && matchFilter;
    });

    renderResults();
}

// Filtros
filterBtns.forEach(btn => {
    btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        handleSearch();
    };
});

// Modal de Detalhes
function showDetails(item) {
    modalBody.innerHTML = `
        <h2 class="modal-title">${item.descricao}</h2>
        <div class="details-grid">
            <div class="detail-item">
                <div class="detail-label">Código</div>
                <div class="detail-value">${item.codigo}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Maior Tabela 2025 (Total)</div>
                <div class="detail-value" style="color: #4ade80; font-weight: bold;">${formatCurrency(item.maior_2025_total)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">SES (SH/SP)</div>
                <div class="detail-value">${formatCurrency(item.ses_sh)} / ${formatCurrency(item.ses_sp)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">SMSA 2025 (SH/SP)</div>
                <div class="detail-value">${formatCurrency(item.smsa_vigente_sh)} / ${formatCurrency(item.smsa_vigente_sp)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">SIGTAP 2025 (Total)</div>
                <div class="detail-value">${formatCurrency(item.sigtap_total)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Referência Maior Valor</div>
                <div class="detail-value">${item.maior_ref_total || 'N/A'}</div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Utilitários
function formatCurrency(value) {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getBestTable(item) {
    if (item.maior_ref_total && item.maior_ref_total !== 'N/A') return item.maior_ref_total;
    if (Number(item.ses_total) > 0) return 'SES';
    if (Number(item.smsa_vigente_total) > 0) return 'SMSA';
    return 'SIGTAP';
}

// Eventos
searchInput.oninput = handleSearch;
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Iniciar
loadData();
