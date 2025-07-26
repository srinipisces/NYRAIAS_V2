export async function fetchOptionsFromUrl(urlPath, params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${import.meta.env.VITE_API_URL}/api/${urlPath}${query ? `?${query}` : ''}`;
    
    const res = await fetch(fullUrl,{
        method: 'GET', // or 'POST', etc.
        credentials: 'include' // ✅ sends cookies with request
      });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const data = await res.json(); // expects ['A', 'B', 'C']
    

    return data.map(item => ({
      label: item,
      value: item,
    }));
  } catch (err) {
    console.error(`Error fetching options from ${urlPath}:`, err);
    return [];
  }
}
