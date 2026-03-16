import type { Payload } from "payload";

type FigureSeed = {
  title: string;
  type: "fbd" | "truss" | "beam";
  description: string;
  width: number;
  height: number;
  figureData: Record<string, unknown>;
};

const templates: FigureSeed[] = [
  {
    title: "Block on Horizontal Surface",
    type: "fbd",
    description: "Rectangular body with weight, normal, friction, and applied force.",
    width: 600,
    height: 380,
    figureData: {
      type: "fbd",
      body: { shape: "rect", label: "Block", x: 220, y: 160, width: 120, height: 70 },
      forces: [
        { id: "W", label: "W", origin: [280, 230], angle: 270, magnitude: 1, color: "#ef4444" },
        { id: "N", label: "N", origin: [280, 160], angle: 90, magnitude: 1, color: "#2563eb" },
        { id: "Ff", label: "F_f", origin: [220, 195], angle: 180, magnitude: 0.7, color: "#f59e0b" },
        { id: "P", label: "P", origin: [340, 195], angle: 0, magnitude: 0.9, color: "#16a34a" },
      ],
      dimensions: [{ from: [200, 270], to: [360, 270], label: "L" }],
    },
  },
  {
    title: "Block on Inclined Plane",
    type: "fbd",
    description: "Body on an incline with weight, normal, and friction.",
    width: 600,
    height: 380,
    figureData: {
      type: "fbd",
      body: {
        shape: "polygon",
        label: "Block",
        x: 0,
        y: 0,
        points: [
          [210, 180],
          [310, 140],
          [340, 210],
          [240, 250],
        ],
      },
      forces: [
        { id: "W", label: "W", origin: [275, 195], angle: 270, magnitude: 1, color: "#ef4444" },
        { id: "N", label: "N", origin: [245, 220], angle: 30, magnitude: 1, color: "#2563eb" },
        { id: "Ff", label: "F_f", origin: [245, 220], angle: 210, magnitude: 0.7, color: "#f59e0b" },
      ],
      dimensions: [{ from: [140, 300], to: [430, 190], label: "θ" }],
    },
  },
  {
    title: "Hanging Mass (Single Cable)",
    type: "fbd",
    description: "Single cable tension balancing a hanging mass.",
    width: 500,
    height: 360,
    figureData: {
      type: "fbd",
      body: { shape: "circle", label: "m", x: 250, y: 190, radius: 34 },
      forces: [
        { id: "W", label: "W", origin: [250, 224], angle: 270, magnitude: 1, color: "#ef4444" },
        { id: "T", label: "T", origin: [250, 156], angle: 90, magnitude: 1, color: "#2563eb" },
      ],
    },
  },
  {
    title: "Hanging Mass (Two Cables)",
    type: "fbd",
    description: "Mass suspended by two cables at symmetric angles.",
    width: 560,
    height: 360,
    figureData: {
      type: "fbd",
      body: { shape: "circle", label: "m", x: 280, y: 210, radius: 32 },
      forces: [
        { id: "W", label: "W", origin: [280, 242], angle: 270, magnitude: 1, color: "#ef4444" },
        { id: "T1", label: "T_1", origin: [256, 190], angle: 140, magnitude: 1, color: "#2563eb" },
        { id: "T2", label: "T_2", origin: [304, 190], angle: 40, magnitude: 1, color: "#16a34a" },
      ],
      angles: [{ vertex: [280, 210], from: 90, to: 140, label: "θ" }],
    },
  },
  {
    title: "Simply-Supported Beam",
    type: "beam",
    description: "Pin and roller supports with one central point load.",
    width: 640,
    height: 360,
    figureData: {
      type: "beam",
      length: 8,
      scale: 60,
      supports: [
        { x: 0, type: "pin" },
        { x: 8, type: "roller" },
      ],
      pointLoads: [{ x: 4, magnitude: 20, angle: 270, label: "P" }],
      dimensions: true,
    },
  },
  {
    title: "Cantilever Beam",
    type: "beam",
    description: "Fixed support at left with tip load.",
    width: 640,
    height: 360,
    figureData: {
      type: "beam",
      length: 6,
      scale: 65,
      supports: [{ x: 0, type: "fixed" }],
      pointLoads: [{ x: 6, magnitude: 15, angle: 270, label: "P" }],
      dimensions: true,
    },
  },
  {
    title: "Beam with Distributed Load",
    type: "beam",
    description: "Simply-supported beam with uniform distributed load.",
    width: 640,
    height: 360,
    figureData: {
      type: "beam",
      length: 8,
      scale: 60,
      supports: [
        { x: 0, type: "pin" },
        { x: 8, type: "roller" },
      ],
      distributedLoads: [{ xStart: 0, xEnd: 8, wStart: 5, wEnd: 5, label: "w" }],
      dimensions: true,
    },
  },
  {
    title: "Simple Pin-Jointed Truss",
    type: "truss",
    description: "Three-node triangular truss with apex load.",
    width: 620,
    height: 380,
    figureData: {
      type: "truss",
      nodes: [
        { id: "A", x: 150, y: 280, support: "pin" },
        { id: "B", x: 470, y: 280, support: "roller" },
        { id: "C", x: 310, y: 130 },
      ],
      members: [
        { from: "A", to: "B", id: "AB" },
        { from: "A", to: "C", id: "AC" },
        { from: "B", to: "C", id: "BC" },
      ],
      loads: [{ node: "C", angle: 270, magnitude: 10, label: "P" }],
    },
  },
  {
    title: "Pratt Truss (6-panel)",
    type: "truss",
    description: "Pratt truss with panel-point loads.",
    width: 780,
    height: 420,
    figureData: {
      type: "truss",
      nodes: [
        { id: "A", x: 90, y: 300, support: "pin" },
        { id: "B", x: 180, y: 300 },
        { id: "C", x: 270, y: 300 },
        { id: "D", x: 360, y: 300 },
        { id: "E", x: 450, y: 300 },
        { id: "F", x: 540, y: 300 },
        { id: "G", x: 630, y: 300, support: "roller" },
        { id: "H", x: 180, y: 220 },
        { id: "I", x: 270, y: 220 },
        { id: "J", x: 360, y: 220 },
        { id: "K", x: 450, y: 220 },
        { id: "L", x: 540, y: 220 },
      ],
      members: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "D" },
        { from: "D", to: "E" },
        { from: "E", to: "F" },
        { from: "F", to: "G" },
        { from: "H", to: "I" },
        { from: "I", to: "J" },
        { from: "J", to: "K" },
        { from: "K", to: "L" },
        { from: "A", to: "H" },
        { from: "H", to: "B" },
        { from: "B", to: "I" },
        { from: "I", to: "C" },
        { from: "C", to: "J" },
        { from: "J", to: "D" },
        { from: "D", to: "K" },
        { from: "K", to: "E" },
        { from: "E", to: "L" },
        { from: "L", to: "F" },
        { from: "F", to: "G" },
      ],
      loads: [
        { node: "I", angle: 270, magnitude: 12, label: "P1" },
        { node: "J", angle: 270, magnitude: 16, label: "P2" },
        { node: "K", angle: 270, magnitude: 12, label: "P3" },
      ],
    },
  },
];

export default async function seedFigureTemplates(payload: Payload) {
  payload.logger.info("Seeding engineering figure templates...");

  for (const template of templates) {
    const existing = await payload.find({
      collection: "engineering-figures",
      where: {
        and: [
          { title: { equals: template.title } },
          { isTemplate: { equals: true } },
        ],
      },
      limit: 1,
      depth: 0,
    });

    if (existing.docs.length > 0) {
      payload.logger.info(`Template exists: ${template.title}`);
      continue;
    }

    await payload.create({
      collection: "engineering-figures",
      data: {
        ...template,
        isTemplate: true,
      },
      depth: 0,
    });

    payload.logger.info(`Created template: ${template.title}`);
  }

  payload.logger.info("Engineering figure templates seeded.");
}

