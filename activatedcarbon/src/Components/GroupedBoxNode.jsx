// GroupedBoxNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

export default function GroupedBoxNode({ data }) {
  const { label, children = [] } = data;

  return (
    <div
      style={{
        border: '2px solid #333',
        borderRadius: 4,
        padding: 6,
        width: 140,
        background: '#f9f9f9',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={() => alert(label)}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>{label}</div>

      {children.length > 0 && (
        <div>
          {children.map((child, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                alert(child);
              }}
              style={{
                border: '1px dotted #666',
                borderRadius: 2,
                padding: '4px 6px',
                marginBottom: 4,
                textAlign: 'center',
                fontSize: 12,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {child}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
