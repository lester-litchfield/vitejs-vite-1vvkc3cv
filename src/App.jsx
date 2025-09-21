import React, { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import yaml from 'js-yaml'

// Node components with handles
const DefaultNode = ({ data }) => (
  <div style={{ padding: 8, borderRadius: 6, background: '#fff', border: '1px solid #ccc' }}>
    <div>{data.label}</div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
)

const TaskNode = ({ data }) => (
  <div style={{ padding: 8, borderRadius: 6, background: '#eef2ff', border: '1px solid #c7d2fe' }}>
    <div style={{ fontWeight: 600, color: '#3730a3' }}>{data.label}</div>
    <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
    <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
  </div>
)

const nodeTypes = { defaultNode: DefaultNode, taskNode: TaskNode }

const initialNodes = [
  { id: '1', type: 'defaultNode', position: { x: 250, y: 5 }, data: { label: 'Source' } },
  { id: '2', type: 'taskNode', position: { x: 100, y: 100 }, data: { label: 'Preprocess' } },
  { id: '3', type: 'taskNode', position: { x: 400, y: 150 }, data: { label: 'Train' } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.Arrow } },
  { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.Arrow } },
]

export default function DagDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedType, setSelectedType] = useState('defaultNode')
  const [counter, setCounter] = useState(4)

  // Called when user drags from a handle to another
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.Arrow } }, eds)),
    [setEdges]
  )

  // Add new node
  const addNewNode = useCallback(() => {
    const id = String(counter)
    const newNode = {
      id,
      type: selectedType,
      position: { x: 250 + (counter % 5) * 40, y: 80 + (Math.floor(counter / 5) % 5) * 40 },
      data: { label: `${selectedType}-${id}` },
    }
    setCounter((c) => c + 1)
    setNodes((nds) => nds.concat(newNode))
  }, [counter, selectedType, setNodes])

  // Export nodes & edges to YAML
  const exportYaml = useCallback(() => {
    const nodesForYaml = nodes.map((n) => ({ id: n.id, type: n.type, label: n.data.label }))
    const edgesForYaml = edges.map((e) => ({ id: e.id, from: e.source, to: e.target }))
    const doc = { workflow: { nodes: nodesForYaml, edges: edgesForYaml } }
    const y = yaml.dump(doc)
    const blob = new Blob([y], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.yaml'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid #e6edf3', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Node type:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="defaultNode">Default</option>
            <option value="taskNode">Task</option>
          </select>
          <button style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 6, background: '#0ea5e9', color: '#fff' }} onClick={addNewNode}>
            Add node
          </button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ padding: '6px 10px', borderRadius: 6, background: '#059669', color: '#fff' }} onClick={exportYaml}>
            Export YAML
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
