
// Each report config describes its fields, endpoint(s), and how to map filters <-> API.
// Add more reports by pushing new objects to this array.

const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const daysBetween = (from, to) =>
  Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));

const reportConfigs = [
  
    {
        id: "rms_performance",
        name: "RMS Performance",
        description: "Legacy RMS performance report with pagination and optional date range on material arrival time.",
        endpoint: { method: "GET", path: "/api/reports_activation/rms_performance" },
        csv:      { method: "GET", path: "/api/reports_activation/rms_performance.csv" },
        pageSize: 50,
        fields: [
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "material_arrivaltime", dir: "desc" };
            if (filters.from) params.from = filters.from;
            if (filters.to)   params.to   = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
    
    {
        id: "inward_bags",
        name: "Inward Bags",
        description: "Inward bag entries with optional date range and inward number search.",
        endpoint: { method: "GET", path: "/api/rms_reports/inward_bags" },
        csv:      { method: "GET", path: "/api/rms_reports/inward_bags.csv" },
        pageSize: 50,
        fields: [
            { name: "from",          type: "date",  label: "From (YYYY-MM-DD)" },
            { name: "to",            type: "date",  label: "To (YYYY-MM-DD)" },
            { name: "inward_number", type: "text",  label: "Inward Number (contains)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "bag_created_datetime", dir: "desc" };
            if (filters.from)           params.from = filters.from;
            if (filters.to)             params.to   = filters.to;
            if (filters.inward_number)  params.inward_number = filters.inward_number;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },

    {
        id: "material_outward",
        name: "Material Outward",
        description: "Material outward bags with optional date, inward number, and grade filters. Default grades limited to Stones, Rotary A/B, -20 stages, and Unburnt.",
        endpoint: { method: "GET", path: "/api/rms_reports/material_outward" },
        csv:      { method: "GET", path: "/api/rms_reports/material_outward.csv" },
        pageSize: 50,
        fields: [
            { name: "from",          type: "date",  label: "From (YYYY-MM-DD)" },
            { name: "to",            type: "date",  label: "To (YYYY-MM-DD)" },
            { name: "inward_number", type: "text",  label: "Inward Number (contains)" },
            {
            name: "Grade",
            type: "select",
            label: "Grade",
            options: [
                { value: "",                                   label: "All Grades" },
                { value: "Stones",                             label: "Stones" },
                { value: "Grade 2nd stage - Rotary B",         label: "Grade 2nd stage - Rotary B" },
                { value: "Grade 1st stage - Rotary A",         label: "Grade 1st stage - Rotary A" },
                { value: "-20 2nd Stage - Rotary B",           label: "-20 2nd Stage - Rotary B" },
                { value: "-20  1st Stage - Rotary A",          label: "-20  1st Stage - Rotary A" },
                { value: "Unburnt",                            label: "Unburnt" },
            ],
            },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "bag_created_datetime", dir: "desc" };
            if (filters.from)           params.from = filters.from;
            if (filters.to)             params.to   = filters.to;
            if (filters.inward_number)  params.inward_number = filters.inward_number;
            if (filters.Grade !== undefined) params.grade = filters.Grade; // "" (All) triggers default set on backend
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
    },
    {
        id: "material_outward_summary",
        name: "Material Outward — Summarised",
        description: "Grouped by Date, Inward Number, and Grade with totals for bags and weight.",
        endpoint: { method: "GET", path: "/api/rms_reports/material_outward_summary" },
        csv:      { method: "GET", path: "/api/rms_reports/material_outward_summary.csv" },
        pageSize: 50,
        fields: [
            { name: "from",          type: "date",  label: "From (YYYY-MM-DD)" },
            { name: "to",            type: "date",  label: "To (YYYY-MM-DD)" },
            { name: "inward_number", type: "text",  label: "Inward Number (contains)" },
            {
            name: "Grade",
            type: "select",
            label: "Grade",
            options: [
                { value: "",                                   label: "All Grades" },
                { value: "Stones",                             label: "Stones" },
                { value: "Grade 2nd stage - Rotary B",         label: "Grade 2nd stage - Rotary B" },
                { value: "Grade 1st stage - Rotary A",         label: "Grade 1st stage - Rotary A" },
                { value: "-20 2nd Stage - Rotary B",           label: "-20 2nd Stage - Rotary B" },
                { value: "-20  1st Stage - Rotary A",          label: "-20  1st Stage - Rotary A" },
                { value: "Unburnt",                            label: "Unburnt" },
            ],
            },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "date_str", dir: "desc" };
            if (filters.from)           params.from = filters.from;
            if (filters.to)             params.to   = filters.to;
            if (filters.inward_number)  params.inward_number = filters.inward_number;
            if (filters.Grade !== undefined) params.grade = filters.Grade; // "" (All) triggers default set on backend
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },



  // Add more reports here...
];

export default reportConfigs;


