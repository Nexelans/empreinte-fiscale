"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from "d3-sankey";
import { ScoreFiscal } from "@/modules/score/types";
import { Button } from "@/components/ui/button";

interface SankeyChartProps {
  score: ScoreFiscal;
  onFlowClick?: (flowId: string) => void;
}

interface SankeyData {
  nodes: Array<{ name: string; category: string }>;
  links: Array<{ source: number; target: number; value: number; color: string }>;
}

function transformScoreToSankey(score: ScoreFiscal): SankeyData {
  const nodes: Array<{ name: string; category: string }> = [
    { name: "Vous", category: "citizen" },
    { name: "État", category: "government" },
    { name: "Éducation", category: "service" },
    { name: "Santé", category: "service" },
    { name: "Sécurité", category: "service" },
    { name: "Infrastructure", category: "service" },
    { name: "Culture", category: "service" },
    { name: "Administration", category: "service" },
  ];

  const links: Array<{ source: number; target: number; value: number; color: string }> = [
    { source: 0, target: 1, value: score.totalPaye, color: "#ef4444" },
    { source: 1, target: 2, value: score.detailRecu.servicesMutualises.education, color: "#10b981" },
    { source: 1, target: 3, value: score.detailRecu.servicesMutualises.sante, color: "#10b981" },
    { source: 1, target: 4, value: score.detailRecu.servicesMutualises.securite, color: "#10b981" },
    { source: 1, target: 5, value: score.detailRecu.servicesMutualises.infrastructure, color: "#10b981" },
    { source: 1, target: 6, value: score.detailRecu.servicesMutualises.culture, color: "#10b981" },
    { source: 1, target: 7, value: score.detailRecu.servicesMutualises.administration, color: "#10b981" },
  ];

  return { nodes, links };
}

export function SankeyChart({ score, onFlowClick }: SankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
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
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const data = transformScoreToSankey(score);

    const sankeyGenerator = sankey<any, any>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[0, 0], [chartWidth, chartHeight]]);

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d })),
    });

    // Links
    g.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("fill", "none")
      .attr("opacity", 0.5)
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.5);
      })
      .on("click", function(event, d: any) {
        if (onFlowClick) {
          const flowId = `${d.source.name}-${d.target.name}`;
          onFlowClick(flowId);
        }
      })
      .style("cursor", "pointer")
      .append("title")
      .text((d: any) => `${d.source.name} → ${d.target.name}\n${d.value.toFixed(0)}€`);

    // Nodes
    const node = g.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => {
        if (d.category === "citizen") return "#3b82f6";
        if (d.category === "government") return "#6b7280";
        return "#10b981";
      })
      .attr("stroke", "#000")
      .append("title")
      .text((d: any) => `${d.name}\n${d.value?.toFixed(0) || 0}€`);

    // Labels
    g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d: any) => (d.x0 < chartWidth / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < chartWidth / 2 ? "start" : "end"))
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .text((d: any) => d.name);

  }, [score, dimensions, onFlowClick]);

  const handleExportPNG = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "empreinte-fiscale-sankey.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Où va votre argent</h3>
        <Button onClick={handleExportPNG} variant="outline" size="sm">
          📥 Exporter PNG
        </Button>
      </div>
      <div ref={containerRef} className="w-full bg-white border border-gray-200 rounded-lg p-4">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Cliquez sur un flux pour voir le détail
      </p>
    </div>
  );
}
