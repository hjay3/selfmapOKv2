// Function to flatten the nested JSON structure
function flattenSelfMap(data) {
  const flattened = [];
  const selfMap = Object.values(data)[0]; // Get the first (and only) self map

  // Process each major category
  Object.entries(selfMap).forEach(([category, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      // If the value has a "Strength" property, use it
      if ('Strength' in value) {
        flattened.push({
          category: category,
          value: value.Strength,
          details: JSON.stringify(value),
        });
      }
      // For nested numerical values (like in Family or Closest Relationships)
      else {
        Object.entries(value).forEach(([subCategory, subValue]) => {
          if (typeof subValue === 'number') {
            flattened.push({
              category: `${category}: ${subCategory}`,
              value: subValue,
              details: `${subCategory}: ${subValue}`,
            });
          }
        });
      }
    }
  });

  return flattened;
}

// Main visualization function
function createVisualization(jsonData) {
  const data = flattenSelfMap(jsonData);

  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const width = 960 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3
    .select('#visualization')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Create color scale
  const colorScale = d3
    .scaleSequential()
    .domain([0, 10])
    .interpolator(d3.interpolateViridis);

  // Create pack layout
  const pack = d3.pack().size([width, height]).padding(3);

  // Prepare hierarchical data
  const hierarchy = d3.hierarchy({ children: data }).sum((d) => d.value);

  // Create the pack layout
  const root = pack(hierarchy);

  // Create tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', 'rgba(255, 255, 255, 0.9)')
    .style('padding', '10px')
    .style('border', '1px solid #ddd')
    .style('border-radius', '5px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  // Create circles for each data point
  const nodes = svg
    .selectAll('circle')
    .data(root.leaves())
    .join('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', (d) => d.r)
    .style('fill', (d) => colorScale(d.data.value))
    .style('opacity', 0.7)
    .style('stroke', '#fff')
    .style('stroke-width', 2)
    .on('mouseover', function (event, d) {
      d3.select(this).style('opacity', 1).style('stroke', '#000');

      tooltip.transition().duration(200).style('opacity', 0.9);

      tooltip
        .html(
          `
              <strong>${d.data.category}</strong><br/>
              Strength: ${d.data.value}<br/>
              ${d.data.details}
          `
        )
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 10 + 'px');
    })
    .on('mouseout', function () {
      d3.select(this).style('opacity', 0.7).style('stroke', '#fff');

      tooltip.transition().duration(500).style('opacity', 0);
    });

  // Add labels
  svg
    .selectAll('text')
    .data(root.leaves())
    .join('text')
    .attr('x', (d) => d.x)
    .attr('y', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', (d) => d.r / 4)
    .style('fill', 'white')
    .text((d) => d.data.category.split(':')[0]);

  // Add title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('font-weight', 'bold')
    .text('Self Map Visualization');
}

// CSS styles to add to your HTML
const styles = `
  .tooltip {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      pointer-events: none;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
  }
`;
