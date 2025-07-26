import React from 'react';

export default function DiamondNode({ data }) {
  return (
    <div style={{
      width: 60,
      height: 60,
      transform: 'rotate(45deg)',
      background: '#fff',
      border: '2px solid #999',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{ transform: 'rotate(-45deg)', fontSize: 10, textAlign: 'center' }}>
        {data.label}
      </div>
    </div>
  );
}
