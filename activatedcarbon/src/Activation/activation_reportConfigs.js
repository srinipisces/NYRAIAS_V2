
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
    id: "loaded_bags_summary",
    name: "Loaded Bags - Day Wise Summary",
    description:
        "Bags Loaded operations (Screening/Crushing/Blending/De-Dusting/De-Magnetize) wise. Day-wise summary.",
    endpoint: { method: "GET", path: "/api/reports_postactivation/operations_loaded_summary" },
    csv:      { method: "GET", path: "/api/reports_postactivation/operations_loaded_summary.csv" },
    pageSize: 50,
    fields: [
        {
        name: "Operation",
        type: "select",
        label: "Operation",
        options: [
            { value: "",                    label: "All Operations" },
            { value: "Screening_Loaded",    label: "Screening" },
            { value: "Crushing_Loaded",     label: "Crushing"  },
            { value: "Blending_Loaded",     label: "Blending"  },
            { value: "De-Magnetize_Loaded", label: "De-Magnetize" },
            { value: "De-Dusting_Loaded",   label: "De-Dusting"   },
        ],
        },
        { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
        { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
    ],
    buildParams: ({ filters, page, pageSize, sort, dir }) => {
        const params = { page, pageSize, sort: sort || "loaded_date", dir: dir || "desc" };
        if (filters.Operation) params.operations = filters.Operation; // omit for "All"
        if (filters.from)      params.from       = filters.from;
        if (filters.to)        params.to         = filters.to;
        return { params };
    },
    readResponse: (res) => {
        const { rows = [], total = 0 } = res.data || {};
        return { rows, total };
    },
    /* shouldShowChart: (filters) => {
        const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
        const daysBetween = (a,b) => Math.floor((new Date(b) - new Date(a)) / (1000*60*60*24));
        const { from, to } = filters || {};
        return isValidYMD(from) && isValidYMD(to) && daysBetween(from, to) <= 30;
    },
    buildChart: (rows) => {
        // sum by day across all machines/status (or adjust to split by machine)
        const byDay = new Map();
        rows.forEach(r => {
        const k = String(r.loaded_date).slice(0,10);
        const n = Number(r.num_bags || 0);
        byDay.set(k, (byDay.get(k) || 0) + n);
        });
        return Array.from(byDay.entries())
        .sort((a,b)=>a[0].localeCompare(b[0]))
        .map(([day, count]) => ({ day, count }));
    }, */
    },
    {
        id: "output_bags",
        name: "Output Bags",
        description:
            "Bags generated operations wise (Screening/Crushing/Blending/De-Dusting/De-Magnetize).",
        endpoint: { method: "GET", path: "/api/reports_postactivation/operations_output_bags" },
        csv:      { method: "GET", path: "/api/reports_postactivation/operations_output_bags.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",                    label: "All Operations" },
                { value: "Screening",    label: "Screening" },
                { value: "Crushing",     label: "Crushing"  },
                { value: "Blending",     label: "Blending"  },
                { value: "De-Magnetize", label: "De-Magnetize" },
                { value: "De-Dusting",   label: "De-Dusting"   },
            ],
            },
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize, sort, dir }) => {
            const params = { page, pageSize, sort: sort || "loaded_date", dir: dir || "desc" };
            if (filters.Operation) params.operations = filters.Operation; // omit for "All"
            if (filters.from)      params.from       = filters.from;
            if (filters.to)        params.to         = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        /* shouldShowChart: (filters) => {
            const isValidYMD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
            const daysBetween = (a,b) => Math.floor((new Date(b) - new Date(a)) / (1000*60*60*24));
            const { from, to } = filters || {};
            return isValidYMD(from) && isValidYMD(to) && daysBetween(from, to) <= 30;
        },
        buildChart: (rows) => {
            // sum by day across all machines/status (or adjust to split by machine)
            const byDay = new Map();
            rows.forEach(r => {
            const k = String(r.loaded_date).slice(0,10);
            const n = Number(r.num_bags || 0);
            byDay.set(k, (byDay.get(k) || 0) + n);
            });
            return Array.from(byDay.entries())
            .sort((a,b)=>a[0].localeCompare(b[0]))
            .map(([day, count]) => ({ day, count }));
        }, */
    },
    {
        id: "output_bags_daywise",
        name: "Output Bags — Day Wise Summary",
        description: "Operations vs Date summary of output bags.",
        endpoint: { method: "GET", path: "/api/reports_postactivation/operations_output_bags_summary" },
        csv:      { method: "GET", path: "/api/reports_postactivation/operations_output_bags_summary.csv" },
        pageSize: 50,
        fields: [
            { name: "Operation", type: "select", label: "Operation", options: [
            { value: "",           label: "All Operations" },
            { value: "Screening",  label: "Screening" },
            { value: "Crushing",   label: "Crushing"  },
            { value: "Blending",   label: "Blending"  },
            { value: "De-Magnetize", label: "De-Magnetize" },
            { value: "De-Dusting", label: "De-Dusting" },
            ]},
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize, sort, dir }) => {
            const params = { page, pageSize, sort: "date", dir: "desc" };
            if (filters.Operation) params.operations = filters.Operation;
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
        id: "loaded_vs_output_scr_cru",
        name: "Loaded vs Output (Screening/Crushing)",
        description:
            "Per day comparison of bags/weight Loaded vs same-day Output, limited to Screening and Crushing.",
        endpoint: { method: "GET", path: "/api/reports_postactivation/loaded_vs_output_scr_cru" },
        csv:      { method: "GET", path: "/api/reports_postactivation/loaded_vs_output_scr_cru.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",          label: "All" },
                { value: "Screening", label: "Screening" },
                { value: "Crushing",  label: "Crushing"  },
            ],
            },
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize, sort, dir }) => {
            const params = {
            page,
            pageSize,
            // Backend orders by date DESC, operations DESC; these are informational here.
            sort: sort || "date",
            dir:  dir  || "desc",
            };
            if (filters.Operation) params.operations = filters.Operation; // "Screening" | "Crushing"; omit => All
            if (filters.from)      params.from       = filters.from;
            if (filters.to)        params.to         = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // No chart for this report
    },
    {
        id: "loaded_vs_output_bld_dd_dm",
        name: "Loaded vs Output (Blending / De-Dusting / De-Magnetize)",
        description:
            "Day-wise sums of Loaded Weight vs Output Weight for Blending, De-Dusting, and De-Magnetize.",
        endpoint: { method: "GET", path: "/api/reports_postactivation/loaded_vs_output_bld_dd_dm" },
        csv:      { method: "GET", path: "/api/reports_postactivation/loaded_vs_output_bld_dd_dm.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",             label: "All Operations" },
                { value: "Blending",     label: "Blending" },
                { value: "De-Dusting",   label: "De-Dusting" },
                { value: "De-Magnetize", label: "De-Magnetize" },
            ],
            },
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],
        buildParams: ({ filters, page, pageSize, sort, dir }) => {
            const params = {
            page,
            pageSize,
            sort: sort || "date",  // backend orders by date desc, operations desc
            dir:  dir  || "desc",
            };
            if (filters.Operation) params.operations = filters.Operation; // omit for All (backend uses IN for all three)
            if (filters.from)      params.from       = filters.from;
            if (filters.to)        params.to         = filters.to;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart for this report
    },
    {
        id: "lots_day",
        name: "Lots — Day View",
        description:
            "Shows lots loaded on a single day, with loaded vs output counts/weights and bag lists.",
        endpoint: { method: "GET", path: "/api/reports_postactivation/lots" },
        csv:      { method: "GET", path: "/api/reports_postactivation/lots.csv" },
        pageSize: 50,

        // Fields: exactly one calendar day + optional operation filter
        fields: [
            { name: "date", type: "date", label: "Date (YYYY-MM-DD)", required: true },
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",             label: "All Operations" },   // empty → no op filter
                { value: "Blending",     label: "Blending" },
                { value: "De-Dusting",   label: "De-Dusting" },
                { value: "De-Magnetize", label: "De-Magnetize" },
            ],
            },
        ],

        // Build query params exactly as the backend expects
        buildParams: ({ filters, page, pageSize }) => {
            const params = {
            page,
            pageSize,
            };
            // Required single-day filter
            if (filters.date) params.date = filters.date;

            // Optional operation filter
            // (Backend supports "operations" or legacy "ops")
            if (filters.Operation) params.operations = filters.Operation;

            return { params };
        },

        // Parse the backend response into { rows, total }
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },

        // UX rules for this report UI:
        shouldDeferUntilGenerate: true,   // don't auto-fetch; wait for Generate
        clearEmptiesTheTable: true,       // Clear resets UI and shows no data
    },


    {
        id: "reprocessed_bags",
        name: "Reprocessed Bags",
        description:
            "Bags which are re-processed, optionally filtered by Operations and Quality Updated date range.",
        endpoint: { method: "GET", path: "/api/reports_postactivation/reprocessed_bags" },
        csv:      { method: "GET", path: "/api/reports_postactivation/reprocessed_bags.csv" },
        pageSize: 50,

        // Filters: operations (optional), and date range on quality_upd_dttime (optional pair)
        fields: [
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",             label: "All Operations" },  // omit param => no op filter
                { value: "Screening",    label: "Screening" },
                { value: "Crushing",     label: "Crushing" },
                { value: "Blending",     label: "Blending" },
                { value: "De-Dusting",   label: "De-Dusting" },
                { value: "De-Magnetize", label: "De-Magnetize" },
            ],
            },
            { name: "from", type: "date", label: "From (YYYY-MM-DD)" },
            { name: "to",   type: "date", label: "To (YYYY-MM-DD)" },
        ],

        // Optional: FE validation hook (used by your Reports component, if supported)
        validateFilters: (filters) => {
            const hasFrom = !!filters.from;
            const hasTo   = !!filters.to;
            if (hasFrom !== hasTo) {
            return "Please select both From and To dates (or leave both empty).";
            }
            return null;
        },

        // Build query params the backend expects
        buildParams: ({ filters, page, pageSize, sort, dir }) => {
            const params = { page, pageSize, sort: sort || "quality_upd_dttime", dir: dir || "desc" };
            if (filters.Operation) params.operations = filters.Operation; // omit => no op filter
            if (filters.from)      params.from       = filters.from;
            if (filters.to)        params.to         = filters.to;
            return { params };
        },

        // Parse backend response
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total }; // total = total rows matching filters across all pages
        },

        // UX flags your component already supports
        shouldDeferUntilGenerate: true,  // don't auto-fetch until user clicks Generate
        clearEmptiesTheTable: true,      // Clear resets filters & empties results
    },
    {
        id: "waiting_to_process",
        name: "Bags — Waiting to be Processed",
        description: "Bags queued by operation (Destoning final_destination or PostActivation stock_status).",
        endpoint: { method: "GET", path: "/api/reports_postactivation/waiting_to_process" },
        csv:      { method: "GET", path: "/api/reports_postactivation/waiting_to_process.csv" },
        pageSize: 50,
        fields: [
            {
            name: "Operation",
            type: "select",
            label: "Operation",
            options: [
                { value: "",            label: "All Operations" },
                { value: "Screening",   label: "Screening" },
                { value: "Crushing",    label: "Crushing" },
                { value: "Blending",    label: "Blending" },
                { value: "De-Magnetize",label: "De-Magnetize" },
                { value: "De-Dusting",  label: "De-Dusting" },
            ],
            },
        ],
        buildParams: ({ filters, page, pageSize }) => {
            const params = { page, pageSize };
            // Only send 'operation' when a specific op is chosen; empty means "All"
            if (filters.Operation) params.operation = filters.Operation;
            return { params };
        },
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
        // no chart settings
    },
    {
        id: "quality_report",
        name: "Grade Quality Report",
        description: "Filter by Grade (required), and it gives the quality report for Bags which are not sent to packaging",
        endpoint: { method: "POST", path: "/api/reports_postactivation/quality_report" },
        csv:      { method: "POST", path: "/api/reports_postactivation/quality_report.csv" },
        pageSize: 50,

        // Custom component instead of fields[]
        component: "QualityReport",

        // Hub uses this to read the grid data
        readResponse: (res) => {
            const { rows = [], total = 0 } = res.data || {};
            return { rows, total };
        },
    }


  // Add more reports here...
];

export default reportConfigs;


