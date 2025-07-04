// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export const scenarios = [
  {
    description: '',
    id: 'annotations',
    name: 'Annotations',
    stringInput: '',
  },
  {
    description: '',
    id: 'arrow',
    name: 'Load Apache Arrow Data',
    stringInput: '',
  },
  {
    description: '',
    id: 'csv_metric_values',
    name: 'CSV Metric Values',
    stringInput: '1,20,90,30,5,0',
  },
  {
    description: '',
    id: 'datapoints_outside_range',
    name: 'Datapoints Outside Range',
    stringInput: '',
  },
  {
    description: '',
    id: 'exponential_heatmap_bucket_data',
    name: 'Exponential heatmap bucket data',
    stringInput: '',
  },
  {
    description: '',
    id: 'grafana_api',
    name: 'Grafana API',
    stringInput: '',
  },
  {
    description: '',
    id: 'linear_heatmap_bucket_data',
    name: 'Linear heatmap bucket data',
    stringInput: '',
  },
  {
    description: '',
    id: 'logs',
    name: 'Logs',
    stringInput: '',
  },
  {
    description: '',
    id: 'manual_entry',
    name: 'Manual Entry',
    stringInput: '',
  },
  {
    description: '',
    id: 'no_data_points',
    name: 'No Data Points',
    stringInput: '',
  },
  {
    description: '',
    id: 'predictable_csv_wave',
    name: 'Predictable CSV Wave',
    stringInput: '',
  },
  {
    description:
      'Predictable Pulse returns a pulse wave where there is a datapoint every timeStepSeconds.\nThe wave cycles at timeStepSeconds*(onCount+offCount).\nThe cycle of the wave is based off of absolute time (from the epoch) which makes it predictable.\nTimestamps will line up evenly on timeStepSeconds (For example, 60 seconds means times will all end in :00 seconds).',
    id: 'predictable_pulse',
    name: 'Predictable Pulse',
    stringInput: '',
  },
  {
    description: '',
    id: 'random_walk',
    name: 'Random Walk',
    stringInput: '',
  },
  {
    description: '',
    id: 'random_walk_table',
    name: 'Random Walk Table',
    stringInput: '',
  },
  {
    description: '',
    id: 'random_walk_with_error',
    name: 'Random Walk (with error)',
    stringInput: '',
  },
  {
    description: '',
    id: 'server_error_500',
    name: 'Server Error (500)',
    stringInput: '',
  },
  {
    description: '',
    id: 'slow_query',
    name: 'Slow Query',
    stringInput: '5s',
  },
  {
    description: '',
    id: 'streaming_client',
    name: 'Streaming Client',
    stringInput: '',
  },
  {
    description: '',
    id: 'table_static',
    name: 'Table Static',
    stringInput: '',
  },
];
