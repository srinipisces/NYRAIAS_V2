
// Each report config describes its fields, endpoint(s), and how to map filters <-> API.
// Add more reports by pushing new objects to this array.

const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const daysBetween = (from, to) =>
  Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));

const reportConfigs = [
  {
        id: "stock_in_packaging",
        name: "Stock in Packaging",
        description: "Bags currently in Packaging from De-Stoning and Post-Activation sources.",
        endpoint: { method: "GET", path: "/api/delivery/stock_in_packaging" },
        csv:      { method: "GET", path: "/api/delivery/stock_in_packaging.csv" },
        pageSize: 50,
        fields: [
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "stock_upd_dt", dir: "desc" };
            if (filters.from) params.from = filters.from;
            if (filters.to)   params.to   = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
    },




  // Add more reports here...
];

export default reportConfigs;


