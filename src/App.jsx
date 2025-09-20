import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import yaml from 'js-yaml';

// Simple node type components (could be expanded)
const DefaultNode = ({ data }) => {
  return (
    <div className="p-2 rounded shadow-sm bg-white border">
      <div className="font-semibold">{data.label}</div>
      <div className="text-xs text-gray-600">{data.meta || 'default'}</div>
    </div>
  );
};

const TaskNode = ({ data }) => {
  return (
    <div className="p-2 rounded shadow-sm bg-indigo-50 border border-indigo-200">
      <div className="font-semibold text-indigo-700">{data.label}</div>
      <div className="text-xs text-indigo-600">
        Task • {data.meta || 'work'}
      </div>
    </div>
  );
};

const nodeTypes = {
  defaultNode: DefaultNode,
  taskNode: TaskNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'defaultNode',
    position: { x: 250, y: 5 },
    data: { label: 'Source', meta: 'csv' },
  },
  {
    id: '2',
    type: 'taskNode',
    position: { x: 100, y: 100 },
    data: { label: 'Preprocess', meta: 'normalize' },
  },
  {
    id: '3',
    type: 'taskNode',
    position: { x: 400, y: 150 },
    data: { label: 'Train', meta: 'model:v1' },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    markerEnd: { type: MarkerType.Arrow },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    markerEnd: { type: MarkerType.Arrow },
  },
];

export default function DagDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedType, setSelectedType] = useState('defaultNode');
  const [counter, setCounter] = useState(4);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.Arrow } }, eds)
      ),
    [setEdges]
  );

  const addNewNode = useCallback(() => {
    const id = String(counter);
    const newNode = {
      id,
      type: selectedType,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      data: { label: `${selectedType}-${id}`, meta: '' },
    };
    setCounter((c) => c + 1);
    setNodes((nds) => nds.concat(newNode));
  }, [counter, selectedType, setNodes]);

  const exportYaml = useCallback(() => {
    // Build a simple YAML structure from nodes + edges
    const nodesForYaml = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.data.label,
      meta: n.data.meta || null,
    }));
    const edgesForYaml = edges.map((e) => ({
      id: e.id,
      from: e.source,
      to: e.target,
    }));
    const doc = { workflow: { nodes: nodesForYaml, edges: edgesForYaml } };
    const y = yaml.dump(doc);

    // Trigger download
    const blob = new Blob([y], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.yaml';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Node type:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="defaultNode">Default</option>
            <option value="taskNode">Task</option>
          </select>
          <button
            className="ml-2 px-3 py-1 rounded bg-sky-600 text-white"
            onClick={addNewNode}
          >
            Add node
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-emerald-600 text-white"
            onClick={exportYaml}
          >
            Export YAML
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
