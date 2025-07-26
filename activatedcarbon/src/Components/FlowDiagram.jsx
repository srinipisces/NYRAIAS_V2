import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import GroupedBoxNode from './GroupedBoxNode';

const nodeTypes = {
  grouped: GroupedBoxNode,
};

const nodes = [
  {
    id: '1',
    type: 'grouped',
    data: { label: 'Security' },
    position: { x: 0, y: 100 },
    sourcePosition: 'right',
  },
  {
    id: '2',
    type: 'grouped',
    data: { label: 'Lab', children: ['Approved', 'Rejected'] },
    position: { x: 200, y: 80 },
    sourcePosition: 'right',
    targetPosition: 'left',
  },
  {
    id: '3',
    type: 'grouped',
    data: { label: 'Raw Material Inward' },
    position: { x: 420, y: 100 },
    sourcePosition: 'right',
    targetPosition: 'left',
  },
  {
    id: '4',
    type: 'grouped',
    data: { label: 'Raw Material Outward', children: ['GCharcoal', 'Wastage'] },
    position: { x: 640, y: 80 },
    sourcePosition: 'right',
    targetPosition: 'left',
  },
];

const edges = [
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: 'arrowclosed' } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: 'arrowclosed' } },
  { id: 'e3-4', source: '3', target: '4', markerEnd: { type: 'arrowclosed' } },
];

export default function MaterialFlowDiagram() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ width: '1000px', height: '300px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll={false}
          panOnDrag={[1, 0]}   // horizontal only
          zoomOnScroll={false}
        >
          <Controls position="bottom-left" showInteractive={false} />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
