import StandardReport from './StandardReport';
import RawMaterialStockHistory from './RawMaterialStockHistory';
import KilnYieldReport from './kilnYieldReport';

export const reportComponentMap = {
  'RawMaterial In-Stock': {
    component: (props) => <StandardReport endpoint="rawmaterial_in-stock" title="RawMaterial In-Stock" {...props} />,
    needsDateRange: false
  },
  'Granulated Charcoal In-Stock': {
    component: (props) => <StandardReport endpoint="granulated_charcoal_in-stock" title="Granulated Charcoal In-Stock" {...props} />,
    needsDateRange: false
  },
  'Grade wise In-Stock': {
    component: (props) => <StandardReport endpoint="grade_wise_in-stock" title="Grade wise In-Stock" {...props} />,
    needsDateRange: false
  },
  'Crusher Performance': {
    component: (props) => <StandardReport endpoint="crusher_performance" title="Crusher Performance" {...props} />,
    needsDateRange: false
  },
  'RMS Performance': {
    component: (props) => <StandardReport endpoint="rms_performance" title="RMS Performance" {...props} />,
    needsDateRange: false
  },
  'Boiler Performance': {
    component: (props) => <StandardReport endpoint="boiler_performance" title="Boiler Performance" {...props} />,
    needsDateRange: false
  },
  'Supplier Performance': {
    component: (props) => <StandardReport endpoint="supplier_performance" title="Supplier Performance" {...props} />,
    needsDateRange: false
  },
  'DeStoning Summary': {
    component: (props) => <StandardReport endpoint="destoning_summary" title="Destoning Summary" {...props} />,
    needsDateRange: true
  },
  'Bags Waiting For DeStoning': {
    component: (props) => <StandardReport endpoint="bags_waiting_for_destoning" title="Bags Waiting For DeStoning" {...props} />,
    needsDateRange: false
  },
  'Kiln Load': {
    component: (props) => <StandardReport endpoint="kiln_load" title="Kiln Load" {...props} />,
    needsDateRange: true
  },
  'Kiln Output vs DeStoning': {
    component: (props) => <StandardReport endpoint="kiln_output_vs_destoning" title="Kiln Output vs DeStoning" {...props} />,
    needsSingleDate: true
  },
  'Kiln Output Bags Daywise': {
    component: (props) => <StandardReport endpoint="kiln_output_bags_daywise" title="Kiln Output Bags" {...props} />,
    needsDateRange: true
  },
  'Raw-Material Inward at Gate Daywise': {
    component: (props) => <StandardReport endpoint="raw-material_inward_daywise" title="Raw-Material Inward at Gate" {...props} />,
    needsDateRange: true
  },
  'Bagwise Current Stock': {
    component: (props) => <StandardReport endpoint="bagwise_current_stock" title="Bagwise Current Stock" {...props} />,
    needsDateRange: false
  },
  'Bagwise Delivered': {
    component: (props) => <StandardReport endpoint="bagwise_delivered" title="Bagwise Delivered" {...props} />,
    needsDateRange: true
  },
  // History Reports
  'Raw-Material Stock History': {
    component: RawMaterialStockHistory,
    needsDateRange: true
  },
  // History Reports
  'Screening Inward': {
    component: (props) => <StandardReport endpoint="screening_inward" title="Screening Inward Daywise" {...props} />,
    needsDateRange: true
  },
  'Screening Outward': {
    component: (props) => <StandardReport endpoint="screening_outward" title="Screening Outward Daywise" {...props} />,
    needsDateRange: true
  },
  // Yield Report
  'Kiln Yield': {
    component: KilnYieldReport,
    needsDateRange: true
  }
};
