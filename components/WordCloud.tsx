'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import d3Cloud from 'd3-cloud';
import * as d3 from 'd3';

interface Word {
  word: string;
  count: number;
}

export default function WordCloud({ words }: { words: Word[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Create a stable key from words to prevent unnecessary re-renders
  const wordsKey = useMemo(() => {
    return words.map(w => `${w.word}:${w.count}`).sort().join('|');
  }, [words]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
        setScaleFactor(1); // Reset scale factor on resize
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current || words.length === 0 || dimensions.width === 0) return;

    const { width, height } = dimensions;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Try to fit all words with dynamic scaling
    let currentScale = scaleFactor;
    let attempts = 0;
    const maxAttempts = 5;

    const tryLayout = (scale: number) => {
      const layout = d3Cloud()
        .size([width, height])
        .words(words.map(d => ({ 
          text: d.word, 
          size: (20 + Math.sqrt(d.count) * 15) * scale,
          word: d.word 
        })))
        .padding(20)
        .rotate(0)
        .spiral('archimedean')
        .font("Impact")
        .fontSize((d: any) => d.size)
        .random(() => 0.5)
        .on("end", (data: any[]) => {
          // Check if all words were placed
          if (data.length < words.length && attempts < maxAttempts) {
            attempts++;
            const newScale = scale * 0.85; // Reduce by 15%
            setScaleFactor(newScale);
            tryLayout(newScale);
          } else {
            draw(data);
          }
        });

      layout.start();
    };

    tryLayout(currentScale);

    function draw(data: any[]) {
      // Sort by size so larger words are drawn on top
      const sortedData = [...data].sort((a, b) => a.size - b.size);
      
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      svg.selectAll("text")
        .data(sortedData)
        .enter().append("text")
        .style("font-size", (d: any) => `${d.size}px`)
        .style("font-family", "var(--font-brand-heading)")
        .style("font-weight", "900")
        .style("fill", (d: any, i: number) => {
          const colors = ["#13454c", "#eca508", "#f97070", "#262424"];
          return colors[i % colors.length];
        })
        .attr("text-anchor", "middle")
        .attr("transform", (d: any) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d: any) => d.text)
        .style("text-transform", "uppercase")
        .style("opacity", 0)
        .transition()
        .duration(2000)
        .style("opacity", 0.9);
    }
  }, [wordsKey, scaleFactor, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
