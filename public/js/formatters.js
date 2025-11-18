// Client-side formatters

function formatDate(dateString) {
    if (!dateString) return '';
    // Handles both 'YYYY-MM-DD' and ISO 'YYYY-MM-DDTHH:mm:ss.sssZ'
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
    if (value === null || value === undefined) return '';
    
    const number = Number(value);
    if (isNaN(number)) return value;

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(number);
}

function formatCPF(value) {
    if (!value) return '';
    const cleanedValue = String(value).replace(/\D/g, ''); // Remove all non-digit characters

    if (cleanedValue.length === 11) {
        // CPF format: XXX.XXX.XXX-XX
        return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cleanedValue.length === 14) {
        // CNPJ format: XX.XXX.XXX/XXXX-XX
        return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value; // Return original if not a valid CPF or CNPJ length
}
