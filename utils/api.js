import { sanitizeObject } from './helpers.js';

const BASE_URL_ORDERS = 'https://{{tenant}}.pay.nova.money/api/v1/orders';
const BASE_URL_CHECKOUT_PAGES = 'https://{{tenant}}.pay.nova.money/api/v1/checkout_pages';

async function fetchWithAuth(url) {
  const token = process.env.NOVA_TOKEN;
  if (!token || token === 'your_token_here') {
    throw new Error('NOVA_TOKEN não configurado no arquivo .env');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Falha na requisição à API: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}

function getTenantUrl(baseUrl) {
    const tenant = process.env.NOVA_TENANT;
    if (!tenant || tenant === 'your_tenant_here') {
        throw new Error('NOVA_TENANT não configurado no arquivo .env');
    }
    return baseUrl.replace('{{tenant}}', tenant);
}

async function fetchAllWithPagination(initialUrl) {
    console.log(`Fetching initial page: ${initialUrl}`);
    const initialData = await fetchWithAuth(initialUrl);
    
    let allItems = initialData.data || [];
    const totalPages = initialData.meta ? initialData.meta.total_pages : 1;
  
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = new URL(initialUrl);
        pageUrl.searchParams.append('page', page);
        console.log(`Adding page to fetch queue: ${pageUrl}`);
        pagePromises.push(fetchWithAuth(pageUrl.toString()));
      }
      
      const allPageResults = await Promise.all(pagePromises);
      allPageResults.forEach(pageResult => {
        allItems = allItems.concat(pageResult.data || []);
      });
    }
    return allItems;
}

async function fetchCheckoutPages() {
    const url = getTenantUrl(BASE_URL_CHECKOUT_PAGES);
    console.log('Fetching all checkout pages...');
    const checkoutPagesData = await fetchWithAuth(url);
    const checkoutPages = checkoutPagesData.data || checkoutPagesData || []; // Adjusted to handle direct array return
    console.log(`Total de ${checkoutPages.length} páginas de checkout recebidas.`);
    return checkoutPages;
}


function getOrdersApiUrl(queryParams) {
    const url = new URL(getTenantUrl(BASE_URL_ORDERS));
    
    // Default status if not provided
    if (queryParams.status) {
        url.searchParams.append('status[]', queryParams.status);
    } else {
        url.searchParams.append('status[]', 'paid');
    }

    if (queryParams.initial_date) {
        url.searchParams.append('initial_date', queryParams.initial_date);
    }
    if (queryParams.final_date) {
        url.searchParams.append('final_date', queryParams.final_date); // Fixed typo
    }

    return url.toString();
}

export async function fetchAndProcessOrders(queryParams) {
  // Fetch orders and checkout pages in parallel
  const [allOrders, allCheckoutPages] = await Promise.all([
    fetchAllWithPagination(getOrdersApiUrl(queryParams)),
    fetchCheckoutPages()
  ]);

  // Create a map for quick lookup
  const checkoutPageMap = new Map(allCheckoutPages.map(page => [page.id, page.page_title]));

  console.log(`Total de ${allOrders.length} pedidos recebidos. Processando...`);
  
  // Sanitize and enrich each order
  const processedOrders = allOrders.map(order => {
    const sanitizedOrder = sanitizeObject(order);
    const pageTitle = checkoutPageMap.get(order.checkout_page_id);
    if (pageTitle) {
      sanitizedOrder.page_title = pageTitle;
    }
    return sanitizedOrder;
  });
  
  console.log('Processamento concluído.');
  return processedOrders;
}
