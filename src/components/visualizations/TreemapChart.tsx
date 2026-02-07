"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface TreemapData {
  name: string;
  value?: number;
  children?: TreemapData[];
}

interface TreemapChartProps {
  budgetData: TreemapData;
}

export function TreemapChart({ budgetData }: TreemapChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(800, window.innerWidth - 40);
      const height = Math.min(600, window.innerHeight * 0.6);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    const root = d3.hierarchy(budgetData)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<TreemapData>()
      .size([width, height])
      .padding(1)
      .round(true)
      (root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("fill", (d: any) => color(d.parent?.data.name || ""))
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8);
      })
      .append("title")
      .text((d: any) => `${d.data.name}\n${d.value?.toFixed(0)}€`);

    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 16)
      .text((d: any) => {
        const width = d.x1 - d.x0;
        return width > 60 ? d.data.name : "";
      })
      .attr("font-size", "11px")
      .attr("fill", "#fff")
      .attr("font-weight", "500");

  }, [budgetData, dimensions]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Budget de votre mini-État
      </h3>
      <div className="w-full bg-white border border-gray-200 rounded-lg p-4">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}
