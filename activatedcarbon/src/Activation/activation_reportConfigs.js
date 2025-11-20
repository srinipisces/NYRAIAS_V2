
// Each report config describes its fields, endpoint(s), and how to map filters <-> API.
// Add more reports by pushing new objects to this array.

const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const daysBetween = (from, to) =>
  Math.floor((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));

const reportConfigs = [
  {
    
    id: "kiln_feed_quality",
    name: "Kiln Feed Quality",
    description: "Material outward bag quality entries with filter option optional on date of quality entry / user filters.",
    endpoint: { method: "GET", path: "/api/reports_activation/kiln_feed_quality" },
    csv:      { method: "GET", path: "/api/reports_activation/kiln_feed_quality.csv" },
    pageSize: 50,
    fields: [
        { name: "from",   type: "date",  label: "From (YYYY-MM-DD)" },
        { name: "to",     type: "date",  label: "To (YYYY-MM-DD)" },
        { name: "userid", type: "text",  label: "User (optional)" },
    ],
    buildParams: ({ filters, page, pageSize }) => {
        const params = { page, pageSize, sort: "created_date", dir: "desc" }; // sort hints (if your hub uses them)
        if (filters.from)   params.from   = filters.from;
        if (filters.to)     params.to     = filters.to;
        if (filters.userid) params.userid = filters.userid;
        return { params };
    },
    readResponse: (res) => {
        const { rows = [], total = 0 } = res.data || {};
        return { rows, total };
    },
    // no chart settings

  },
    {
        id: "kiln_feed",
        name: "Kiln Feed",
        description: "Bags loaded into the kiln with optional filters on date, kiln, and grade. Defaults restrict to Rotary A/B grades and non-null load time.",
        endpoint: { method: "GET", path: "/api/reports_activation/kiln_feed" },
        csv:      { method: "GET", path: "/api/reports_activation/kiln_feed.csv" },
        pageSize: 50,
        fields: [
            { name: "from",  type: "date",  label: "From (YYYY-MM-DD)" },
            { name: "to",    type: "date",  label: "To (YYYY-MM-DD)" },
            {
            name: "Kiln",
            type: "select",
            label: "Kiln",
            options: [
                { value: "",         label: "All Kilns" },
                { value: "Kiln A",   label: "Kiln A" },
                { value: "Kiln B",   label: "Kiln B" },
                { value: "Kiln C",   label: "Kiln C" },
            ],
            },
            {
            name: "Grade",
            type: "select",
            label: "Grade",
            options: [
                { value: "",                                   label: "All Grades" },
                { value: "Grade 1st stage - Rotary A",         label: "Grade 1st stage - Rotary A" },
                { value: "Grade 2nd stage - Rotary B",         label: "Grade 2nd stage - Rotary B" },
            ],
            },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "kiln_load_time", dir: "desc" };
            if (filters.from)   params.from  = filters.from;
            if (filters.to)     params.to    = filters.to;
            if (filters.Kiln)   params.kiln  = filters.Kiln;   // exactly "Kiln A"/"Kiln B"/"Kiln C"
            if (filters.Grade)  params.grade = filters.Grade;  // if empty/All, backend applies default IN
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
    },
    {
        id: "kiln_output_records",
        name: "Kiln Output ",
        description: "Kiln output with optional filters on kiln, user, and date range.",
        endpoint: { method: "GET", path: "/api/reports_activation/kiln_output_records" },
        csv:      { method: "GET", path: "/api/reports_activation/kiln_output_records.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Kiln",
            type: "select",
            label: "Kiln",
            options: [
                { value: "",       label: "All Kilns" },
                { value: "Kiln A", label: "Kiln A" },
                { value: "Kiln B", label: "Kiln B" },
                { value: "Kiln C", label: "Kiln C" },
            ],
            },
            { name: "userid", type: "text", label: "User (contains)" },
            { name: "from",   type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",     type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "kiln_output_dt", dir: "desc" };
            if (filters.Kiln)  params.kiln  = filters.Kiln;   // "Kiln A"/"Kiln B"/"Kiln C"
            if (filters.userid) params.userid = filters.userid;
            if (filters.from)   params.from   = filters.from;
            if (filters.to)     params.to     = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
    {
        id: "kiln_feed_vs_output",
        name: "Kiln Feed vs Output — Day Wise",
        description: "Day-wise summary comparing kiln feed (bags/weight) vs kiln output (bags/weight).",
        endpoint: { method: "GET", path: "/api/reports_activation/kiln_feed_vs_output" },
        csv:      { method: "GET", path: "/api/reports_activation/kiln_feed_vs_output.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Kiln",
            type: "select",
            label: "Kiln",
            options: [
                { value: "",       label: "All Kilns" },
                { value: "Kiln A", label: "Kiln A" },
                { value: "Kiln B", label: "Kiln B" },
                { value: "Kiln C", label: "Kiln C" },
            ],
            },
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "date", dir: "desc" };
            if (filters.Kiln) params.kiln = filters.Kiln;  // exact "Kiln A/B/C"
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
        id: "kiln_output_quality",
        name: "Kiln Output Quality",
        description: "Output bags with quality splits and optional filters for date and CTC range.",
        endpoint: { method: "GET", path: "/api/reports_activation/kiln_output_quality" },
        csv:      { method: "GET", path: "/api/reports_activation/kiln_output_quality.csv" },
        pageSize: 50,
        fields: [
            { name: "from",    type: "date",   label: "From (Bag Generated)" },
            { name: "to",      type: "date",   label: "To (Bag Generated)" },
            { name: "ctc_min", type: "number", label: "CTC Min" },
            { name: "ctc_max", type: "number", label: "CTC Max" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "bag_created_time", dir: "desc" };
            if (filters.from)    params.from    = filters.from;
            if (filters.to)      params.to      = filters.to;
            if (filters.ctc_min !== undefined && filters.ctc_min !== "") params.ctc_min = filters.ctc_min;
            if (filters.ctc_max !== undefined && filters.ctc_max !== "") params.ctc_max = filters.ctc_max;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
    {
        id: "destoning_loaded_inque",
        name: "De-Stoning — Bags Loaded / InQue",
        description: "Kiln output bags with De-Stoning status and optional date range.",
        endpoint: { method: "GET", path: "/api/reports_activation/destoning_loaded_inque" },
        csv:      { method: "GET", path: "/api/reports_activation/destoning_loaded_inque.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Status",
            type: "select",
            label: "Status",
            options: [
                { value: "",                  label: "All (De-Stoning + DeStoningCompleted)" },
                { value: "De-Stoning",        label: "De-Stoning" },
                { value: "DeStoningCompleted",label: "DeStoningCompleted" },
            ],
            },
            { name: "from", type: "date", label: "From (De-Stoning Loaded)" },
            { name: "to",   type: "date", label: "To (De-Stoning Loaded)" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "destoning_input_time", dir: "desc" };
            if (filters.Status) params.status = filters.Status; // empty → backend applies default pair
            if (filters.from)   params.from   = filters.from;
            if (filters.to)     params.to     = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
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
        id: "kiln_yield",
        name: "Kiln Yield",
        description: "Daily kiln summary with computed yields and input loss. Filter by date range.",
        endpoint: { method: "POST", path: "/api/reports_activation/kiln_yield" },
        csv:      { method: "POST", path: "/api/reports_activation/kiln_yield.csv" },
        pageSize: 50,
        fields: [
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        // IMPORTANT: for POST, return a "body" with pagination + filters
        buildParams: ({ filters, page, pageSize }) => {
            const body = { page, pageSize };
            if (filters.from) body.start_date = filters.from;   // maps to backend "start_date"
            if (filters.to)   body.end_date   = filters.to;     // maps to backend "end_date"
            return { body };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
    {
        id: "destoning_output",
        name: "De-Stoning Output",
        description: "De-stoning bags with optional date and CTC range filters.",
        endpoint: { method: "GET", path: "/api/reports_activation/destoning_output" },
        csv:      { method: "GET", path: "/api/reports_activation/destoning_output.csv" },
        pageSize: 50,
        fields: [
            { name: "from",   type: "date",   label: "From (YYYY-MM-DD)" },
            { name: "to",     type: "date",   label: "To (YYYY-MM-DD)" },
            { name: "ctcMin", type: "number", label: "CTC Min" },
            { name: "ctcMax", type: "number", label: "CTC Max" },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "bag_gen_date", dir: "desc" };
            if (filters.from)   params.from   = filters.from;
            if (filters.to)     params.to     = filters.to;
            if (filters.ctcMin !== undefined && filters.ctcMin !== "") params.ctcMin = filters.ctcMin;
            if (filters.ctcMax !== undefined && filters.ctcMax !== "") params.ctcMax = filters.ctcMax;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
    },
    {
        id: "kiln_parameters",
        name: "Kiln Parameters",
        description: "Temperatures and operating parameters by entry time, with optional date/kiln filters.",
        endpoint: { method: "GET", path: "/api/reports_activation/kiln_parameters" },
        csv:      { method: "GET", path: "/api/reports_activation/kiln_parameters.csv" },
        pageSize: 50,
        fields: [
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
            {
            name: "Kiln",
            type: "select",
            label: "Kiln",
            options: [
                { value: "",       label: "All Kilns" },
                { value: "Kiln A", label: "Kiln A" },
                { value: "Kiln B", label: "Kiln B" },
                { value: "Kiln C", label: "Kiln C" },
            ],
            },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize, sort: "entry_datetime", dir: "desc" };
            if (filters.from)  params.from = filters.from;
            if (filters.to)    params.to   = filters.to;
            if (filters.Kiln)  params.kiln = filters.Kiln; // exact match when provided
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    }



  // Add more reports here...
];

export default reportConfigs;


