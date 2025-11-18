document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    const tableContainer = document.getElementById('table-wrapper');
    const messageContainer = document.getElementById('message-container');
    const countersContainer = document.getElementById('counters');
    const exportButton = document.getElementById('export-button');

    let allOrders = [];
    let currentOrders = [];
    let sortState = {
        column: 'created_at',
        direction: 'desc'
    };
    
    const columnConfig = [
        { key: 'id', header: 'ID' },
        { key: 'created_at', header: 'Data' },
        { key: 'customer.name', header: 'Cliente' },
        { key: 'customer.identification', header: 'Documento' }, // Corrected key
        { key: 'amount', header: 'Valor' },
        { key: 'status', header: 'Status' },
        { key: 'page_title', header: 'Página de Checkout' },
    ];

    // --- Message Handling ---
    function showMessage(type, title, message) {
        const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700';
        messageContainer.innerHTML = `
            <div class="border ${bgColor} px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">${title}</strong>
                <span class="block sm:inline">${message}</span>
            </div>
        `;
    }

    function showLoading() {
        tableContainer.innerHTML = '';
        countersContainer.innerHTML = '';
        showMessage('info', 'Carregando...', 'Buscando pedidos na API. Isso pode levar alguns instantes.');
    }
    
    function clearMessages() {
        messageContainer.innerHTML = '';
    }

    // --- Data Fetching ---
    async function fetchOrders(params = {}) {
        showLoading();
        const query = new URLSearchParams(params).toString();
        
        try {
            const response = await fetch(`/api/orders?${query}`);
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data.error || 'Erro desconhecido no servidor');
            }
            
            clearMessages();
            if (data.length === 0) {
                showMessage('info', 'Nenhum resultado', 'Nenhum pedido encontrado para os filtros aplicados.');
                tableContainer.innerHTML = '';
                allOrders = [];
                currentOrders = [];
                updateCounters();
                return;
            }

            allOrders = data;
            currentOrders = data;
            sortAndRenderTable();

        } catch (error) {
            console.error('Fetch error:', error);
            showMessage('error', 'Erro na Requisição', `Não foi possível buscar os dados. Detalhes: ${error.message}`);
            tableContainer.innerHTML = '';
        }
    }

    // --- Counters ---
    function updateCounters() {
        countersContainer.innerHTML = `
            <span class="text-sm text-gray-600">Mostrando ${currentOrders.length} de ${allOrders.length} registros</span>
        `;
    }

    // --- Table Rendering ---
    function getColumnValue(order, key) {
        // Special handling for the 'amount' key to get value from payments array
        if (key === 'amount') {
            return order.payments && order.payments.length > 0 ? order.payments[0].amount : undefined;
        }

        // Access nested properties using dot notation for other keys
        return key.split('.').reduce((obj, prop) => {
            return obj && obj[prop] !== undefined ? obj[prop] : undefined;
        }, order);
    }

    function renderTable() {
        updateCounters();
        if (currentOrders.length === 0) {
            tableContainer.innerHTML = '';
            exportButton.style.display = 'none'; // Hide export button if no data
            return;
        }
        exportButton.style.display = 'inline-flex'; // Show export button

        const dateColumns = new Set(['created_at', 'date', 'updated_at']);
        const currencyColumns = new Set(['amount', 'total', 'value', 'discount', 'installment_value', 'interest', 'total_paid']);

        let dynamicColumnConfig = [...columnConfig];
        let studentColumns = [];
        for (let i = 1; i <= 5; i++) {
            studentColumns.push(
                { key: `meta.student_name_${i}`, header: `Aluno ${i}` },
                { key: `meta.study_grade_${i}`, header: `Série ${i}` },
                { key: `meta.study_class_${i}`, header: `Turma ${i}` }
            );
        }
        // Insert student columns after 'customer.document' and 'amount'
        dynamicColumnConfig.splice(6, 0, ...studentColumns);

        const headerHtml = dynamicColumnConfig.map(({ key, header }) => {
            const isSorted = sortState.column === key;
            const icon = isSorted ? (sortState.direction === 'asc' ? '▲' : '▼') : '';
            return `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-column="${key}">
                ${header} <span class="text-gray-400">${icon}</span>
            </th>`;
        }).join('');

        const bodyHtml = currentOrders.map(order => {
            const rowHtml = dynamicColumnConfig.map(({ key }) => {
                let value = getColumnValue(order, key);
                let displayValue = value;

                if (key === 'id') {
                    // Assuming 'nova-pay-host' is a placeholder you can replace or get from config
                    displayValue = `<a href="https://tecnoeduc.pay.nova.money/orders/${value}" target="_blank" class="text-indigo-600 hover:text-indigo-900">${value}</a>`;
                } else if (key === 'customer.identification') { // Apply CPF/CNPJ formatting
                    displayValue = formatCPF(value);
                } else if (value !== null && value !== undefined) {
                    if (dateColumns.has(key)) {
                        displayValue = formatDate(value);
                    }
                } else {
                    displayValue = '---';
                }

                return `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${displayValue}</td>`;
            }).join('');
            return `<tr class="bg-white even:bg-gray-50">${rowHtml}</tr>`;
        }).join('');

        tableContainer.innerHTML = `
            <table id="data-table" class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody class="bg-white divide-y divide-200">
                    ${bodyHtml}
                </tbody>
            </table>
        `;

        // Add event listeners to new headers
        document.querySelectorAll('#table-wrapper th').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                if (sortState.column === column) {
                    sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    sortState.column = column;
                    sortState.direction = 'asc';
                }
                sortAndRenderTable();
            });
        });
    }

    // --- Sorting ---
    function sortAndRenderTable() {
        const { column, direction } = sortState;
        
        currentOrders.sort((a, b) => {
            let valA = getColumnValue(a, column);
            let valB = getColumnValue(b, column);

            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            if (typeof valA === 'number' && typeof valB === 'number') {
                return direction === 'asc' ? valA - valB : valB - valA;
            }
            
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        renderTable();
    }
    
    // --- Excel Export ---
    function exportTableToExcel() {
        const table = document.getElementById('data-table');
        if (!table) {
            showMessage('error', 'Erro de Exportação', 'A tabela de dados não foi encontrada.');
            return;
        }

        // Create a new workbook
        const wb = XLSX.utils.table_to_book(table, { sheet: "Relatório de Alunos" });

        // Write the workbook and trigger download
        XLSX.writeFile(wb, 'relatorio_alunos.xlsx');
    }


    // --- Event Listeners ---
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const params = {};
        for (const [key, value] of formData.entries()) {
            if (value) {
                params[key] = value;
            }
        }
        fetchOrders(params);
    });

    exportButton.addEventListener('click', exportTableToExcel);

    // --- Initial Load ---
    fetchOrders({ status: 'paid' });
    exportButton.style.display = 'none'; // Hide export button initially
});