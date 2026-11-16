import { create } from "zustand";
import {
  type NodeChangeset,
  type EdgeChangeset,
  type Connection,
} from "@xyflow/react";
import {
  makeDevice,
  type DeviceKind,
  type DeviceData,
  type LabNode,
  type LabEdge,
} from "../data/types";
import { canConnect, ping, type PingResult } from "../engine/network";
import { decodeTopology } from "../engine/storage";
import {
  scenario,
  networkMissions,
  type NetworkMissionId,
} from "../data/scenarios";
import { requestWebsite } from "../engine/routing";
type State = {
  mission: NetworkMissionId | null;
  startMission: (id: NetworkMissionId) => void;
  website: (source: string, name: string) => void;
  nodes: LabNode[];
  edges: LabEdge[];
  selectedId: string | null;
  message: string;
  result: PingResult | null;
  add: (kind: DeviceKind, position?: { x: number; y: number }) => void;
  select: (id: string | null) => void;
  update: (id: string, data: Partial<DeviceData>) => void;
  remove: (id: string) => void;
  changeNodes: (changes: NodeChangeset<LabNode>) => void;
  changeEdges: (changes: EdgeChangeset<LabEdge>) => void;
  connect: (connection: Connection) => void;
  test: (a: string, b: string) => void;
  save: () => void;
  load: () => void;
  reset: () => void;
};
export const useNetworkStore = create<State>((set, get) => ({
  mission: null,
  startMission: (id) =>
    set({
      ...scenario(id),
      mission: id,
      selectedId: null,
      result: null,
      message:
        "Scenario loaded. Read the ticket, inspect configurations, and repair the faults.",
    }),
  website: (source, name) =>
    set({ result: requestWebsite(source, name, get().nodes, get().edges) }),
  nodes: [],
  edges: [],
  selectedId: null,
  message: "Add two desktop PCs and a switch to begin Mission 02.",
  result: null,
  add: (kind, position) => {
    if (get().nodes.length >= 100) {
      set({
        message:
          "This lab supports up to 100 devices. Remove a device before adding another.",
      });
      return;
    }
    const n = makeDevice(kind, get().nodes.length, position);
    set((s) => ({
      nodes: [...s.nodes, n],
      selectedId: n.id,
      result: null,
      message: `${n.data.name} added. Drag between Ethernet ports to connect devices.`,
    }));
  },
  select: (id) => set({ selectedId: id }),
  update: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
      ),
      result: null,
    })),
  remove: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: null,
      result: null,
    })),
  changeNodes: (changes) =>
    set((s) => {
      const nodes = changes.applyTo(s.nodes);
      return {
        nodes,
        edges: s.edges.filter(
          (e) =>
            nodes.some((n) => n.id === e.source) &&
            nodes.some((n) => n.id === e.target),
        ),
        result: nodes.length !== s.nodes.length ? null : s.result,
      };
    }),
  changeEdges: (changes) =>
    set((s) => ({ edges: changes.applyTo(s.edges), result: null })),
  connect: (c) => {
    const s = get();
    if (
      !canConnect(
        c.source,
        c.target,
        c.sourceHandle,
        c.targetHandle,
        s.nodes,
        s.edges,
      )
    ) {
      set({
        message:
          "Cable rejected. Choose two different devices and an unused Ethernet port on each.",
      });
      return;
    }
    set({
      edges: [
        ...s.edges,
        { ...c, id: crypto.randomUUID(), type: "smoothstep" },
      ],
      result: null,
      message:
        "Ethernet cable connected. Each physical port accepts one cable.",
    });
  },
  test: (a, b) => set({ result: ping(a, b, get().nodes, get().edges) }),
  save: () => {
    try {
      localStorage.setItem(
        "itlab.topology",
        JSON.stringify({
          version: 1,
          nodes: get().nodes,
          edges: get().edges,
          mission: get().mission,
        }),
      );
      set({ message: "Topology saved in this browser." });
    } catch {
      set({ message: "Save failed. Browser storage is unavailable or full." });
    }
  },
  load: () => {
    try {
      const raw = localStorage.getItem("itlab.topology");
      if (!raw) {
        set({ message: "No saved topology was found in this browser." });
        return;
      }
      const data = decodeTopology(raw);
      set({
        ...data,
        mission: networkMissions.some((m) => m.id === JSON.parse(raw).mission)
          ? JSON.parse(raw).mission
          : null,
        selectedId: null,
        result: null,
        message: "Saved topology loaded and schema validated.",
      });
    } catch {
      set({
        message:
          "Unable to load: saved data is invalid or storage is unavailable. Your current topology was preserved.",
      });
    }
  },
  reset: () =>
    set({
      nodes: [],
      mission: null,
      edges: [],
      selectedId: null,
      result: null,
      message: "Canvas cleared. The previously saved topology is unchanged.",
    }),
}));
