"use client";

import React, { memo, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  Handle,
  MiniMap,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisData } from "@/components/SpeechInput";

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const PARENT_WIDTH = 220;
const PARENT_HEIGHT = 70;
const CHILD_WIDTH = 170;
const CHILD_HEIGHT = 54;
const MIN_RADIUS = 240;
const RADIUS_PER_CHILD = 26;
const CLUSTER_PADDING = 220;

type HandleSide = "top" | "right" | "bottom" | "left";

const HANDLE_POSITION: Record<HandleSide, Position> = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
};

const ALL_SIDES: HandleSide[] = ["top", "right", "bottom", "left"];

function angleToSide(angle: number): HandleSide {
  const twoPi = Math.PI * 2;
  const normalized = ((angle % twoPi) + twoPi) % twoPi;
  const deg = (normalized * 180) / Math.PI;
  if (deg >= 45 && deg < 135) return "bottom";
  if (deg >= 135 && deg < 225) return "left";
  if (deg >= 225 && deg < 315) return "top";
  return "right";
}

/* ------------------------------------------------------------------ */
/*  Node data types                                                    */
/* ------------------------------------------------------------------ */

interface NodeLabelData {
  label: string;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Custom nodes                                                       */
/* ------------------------------------------------------------------ */

const ParentNode = memo(function ParentNode({
  data,
}: NodeProps<NodeLabelData>) {
  return (
    <div style={{ width: PARENT_WIDTH }} className="relative">
      {ALL_SIDES.map((side) => (
        <Handle
          key={side}
          id={side}
          type="source"
          position={HANDLE_POSITION[side]}
          className="h-2 w-2 border-0 bg-primary opacity-0"
        />
      ))}
      <div className="glow-primary flex min-h-16 items-center justify-center rounded-2xl border border-primary/40 bg-linear-to-br from-primary via-primary to-primary/70 px-5 py-4 text-center shadow-lg">
        <p className="text-[15px] leading-snug font-semibold tracking-wide text-primary-foreground">
          {data.label}
        </p>
      </div>
    </div>
  );
});
ParentNode.displayName = "ParentNode";

const ChildNode = memo(function ChildNode({
  data,
}: NodeProps<NodeLabelData>) {
  return (
    <div style={{ width: CHILD_WIDTH }} className="relative">
      {ALL_SIDES.map((side) => (
        <Handle
          key={side}
          id={side}
          type="target"
          position={HANDLE_POSITION[side]}
          className="h-1.5 w-1.5 border-0 bg-primary/40 opacity-0"
        />
      ))}
      <div className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-center shadow-sm transition-colors duration-150 hover:border-primary/50 hover:bg-muted/60 hover:shadow-md">
        <p className="text-[13px] leading-snug text-foreground">
          {data.label}
        </p>
      </div>
    </div>
  );
});
ChildNode.displayName = "ChildNode";

const nodeTypes: NodeTypes = {
  parentNode: ParentNode,
  childNode: ChildNode,
};

/* ------------------------------------------------------------------ */
/*  Layout builder                                                     */
/* ------------------------------------------------------------------ */

interface MindMapTopic {
  topic: string;
  children: string[];
}

function buildLayout(topics: MindMapTopic[]): {
  nodes: Node<NodeLabelData>[];
  edges: Edge[];
} {
  const nodes: Node<NodeLabelData>[] = [];
  const edges: Edge[] = [];

  const clusterCount = topics.length;
  if (clusterCount === 0) {
    return { nodes, edges };
  }

  const radii = topics.map((topicData) =>
    Math.max(MIN_RADIUS, 90 + topicData.children.length * RADIUS_PER_CHILD)
  );
  const maxRadius = Math.max(...radii);
  const cellSize = maxRadius * 2 + CLUSTER_PADDING;
  const columns = Math.max(1, Math.ceil(Math.sqrt(clusterCount)));

  topics.forEach((topicData, clusterIndex) => {
    const col = clusterIndex % columns;
    const row = Math.floor(clusterIndex / columns);
    const centerX = col * cellSize + cellSize / 2;
    const centerY = row * cellSize + cellSize / 2;
    const radius = radii[clusterIndex];

    const parentId = `topic-${clusterIndex}`;
    nodes.push({
      id: parentId,
      type: "parentNode",
      position: {
        x: centerX - PARENT_WIDTH / 2,
        y: centerY - PARENT_HEIGHT / 2,
      },
      data: { label: topicData.topic },
    });

    const childCount = topicData.children.length;
    topicData.children.forEach((childLabel, childIndex) => {
      const angle =
        childCount > 0
          ? (2 * Math.PI * childIndex) / childCount - Math.PI / 2
          : 0;
      const childX = centerX + radius * Math.cos(angle);
      const childY = centerY + radius * Math.sin(angle);
      const childId = `topic-${clusterIndex}-child-${childIndex}`;

      nodes.push({
        id: childId,
        type: "childNode",
        position: {
          x: childX - CHILD_WIDTH / 2,
          y: childY - CHILD_HEIGHT / 2,
        },
        data: { label: childLabel },
      });

      const sourceSide = angleToSide(angle);
      const targetSide = angleToSide(angle + Math.PI);

      edges.push({
        id: `edge-${clusterIndex}-${childIndex}`,
        source: parentId,
        target: childId,
        sourceHandle: sourceSide,
        targetHandle: targetSide,
        type: "smoothstep",
        style: { stroke: "var(--accent-1)", strokeWidth: 1.75, opacity: 0.7 },
      });
    });
  });

  return { nodes, edges };
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

interface MindMapProps {
  data: AnalysisData | null;
}

export default function MindMap({ data }: MindMapProps) {
  const topics: MindMapTopic[] = useMemo(() => {
    if (!data || !data.topic || data.topic.trim().length === 0) {
      return [];
    }
    return [
      {
        topic: data.topic,
        children: data.children.map((child) => child.name),
      },
    ];
  }, [data]);

  const { nodes, edges } = useMemo(() => buildLayout(topics), [topics]);

  const isEmpty = topics.length === 0;

  return (
    <Card
      dir="rtl"
      className="glass w-full border-border bg-transparent shadow-sm"
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Brain className="h-5 w-5 text-primary" />
          الخريطة الذهنية
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              في انتظار بدء الشرح لرسم الخريطة الذهنية...
            </p>
          </div>
        ) : (
          <div className="h-150 w-full overflow-hidden rounded-xl border border-border bg-muted/10">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              nodesConnectable={false}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="var(--border)"
              />
              <Controls className="rounded-lg! border! border-border! shadow-md!" />
              <MiniMap
                nodeColor={(node) =>
                  node.type === "parentNode"
                    ? "var(--accent-1)"
                    : "var(--accent-2)"
                }
                maskColor="color-mix(in oklch, var(--background) 80%, transparent)"
                className="rounded-lg! border! border-border!"
              />
            </ReactFlow>
          </div>
        )}
      </CardContent>
    </Card>
  );
}