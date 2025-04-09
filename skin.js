d3.csv("heart_2020_cleaned.csv").then(cancer_data => {
    // --- Data Preparation ---
  
    const chartData = prepareChartData(cancer_data, "SkinCancer", "Smoking");
    const chartData2 = prepareChartData(cancer_data, "SkinCancer", "AlcoholDrinking");
    const chartData3 = prepareChartData(cancer_data, "SkinCancer", "PhysicalActivity");

    // --- Render charts ---
    const chart111 = createChart(chartData, "Smoking", "#chart111");
    const chart222 = createChart(chartData2, "AlcoholDrinking", "#chart222");
    const chart333 = createChart(chartData3, "PhysicalActivity", "#chart333");
  
    const cancerSelector = document.getElementById("cancerChartSelector");
    const cancerChartSections = document.querySelectorAll("#cancerChartContainer .chart-section");

    cancerSelector.addEventListener("change", function () {
        const selected = this.value;
        cancerChartSections.forEach(div => {
            div.style.display = div.id === selected ? "block" : "none";
        });
    });
  
    // --- Data Preparation Function ---
    function prepareChartData(data, skinCancerField, categoryField) {
        const grouped = d3.rollup(
            data,
            v => v.length,
            d => d[skinCancerField],
            d => d[categoryField]
        );
  
        const result = [];
  
        for (const [skinCancer, categoryMap] of grouped) {
            const total = d3.sum([...categoryMap.values()]);
            for (const [category, count] of categoryMap) {
                result.push({
                    SkinCancer: skinCancer,
                    [categoryField]: category,
                    count: count,
                    percent: (count / total) * 100
                });
            }
        }
  
        return result;
    }
  
    // --- Chart Rendering Function ---
    function createChart(data, category, container) {
        const margin = { top: 50, right: 30, bottom: 60, left: 70 },
              width = 700 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;
  
        const svg = d3.create("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
  
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
  
        // Scales
        const x0 = d3.scaleBand()
            .domain(["Yes", "No"]) // Skin Cancer
            .range([0, width])
            .padding(0.2);
  
        const x1 = d3.scaleBand()
            .domain(["Yes", "No"]) // Category (e.g., Smoking, AlcoholDrinking)
            .range([0, x0.bandwidth()])
            .padding(0.05);
  
        const y = d3.scaleLinear()
            .domain([0, 100]) // Percent scale
            .nice()
            .range([height, 0]);
  
        const color = d3.scaleOrdinal()
            .domain(["Yes", "No"])
            .range(["#1f77b4", "#ff7f0e"]);
  
        // Axes
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x0));
  
        g.append("g")
            .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"));
  
        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "5px")
            .style("border", "1px solid #ddd")
            .style("font-size", "12px")
            .style("visibility", "hidden");
  
        // Bars
        const groups = g.selectAll("g.bar-group")
            .data(["Yes", "No"])
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d)},0)`);
  
        groups.selectAll("rect")
            .data(hd => data.filter(d => d.SkinCancer === hd))
            .enter().append("rect")
            .attr("x", d => x1(d[category]))
            .attr("y", d => y(d.percent))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.percent))
            .attr("fill", d => color(d[category]))
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(
                        `<strong>Skin Cancer:</strong> ${d.SkinCancer}<br>` +
                        `<strong>${category.replace(/([A-Z])/g, ' $1')}: </strong> ${d[category]}<br>` +
                        `<strong>Percent:</strong> ${d.percent.toFixed(1)}%<br>` + 
                        `<strong>Count:</strong> ${d3.format(",")(d.count)}`
                    )
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
  
        // Axis Labels
        svg.append("text")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top + 45)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Skin Cancer");
  
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 4)
            .attr("x", -height / 2 - margin.top)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Percentage (%)");
  
        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 100}, ${margin.top - 30})`);
  
        ["Yes", "No"].forEach((label, i) => {
            const legendRow = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);
  
            legendRow.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", color(label));
  
            legendRow.append("text")
                .attr("x", 18)
                .attr("y", 10)
                .text(`${category.replace(/([A-Z])/g, ' $1')}: ${label}`)
                .attr("font-size", "12px")
                .attr("alignment-baseline", "middle");
        });
  
        // Return the SVG node for rendering in the container
        d3.select(container).node().appendChild(svg.node());
    }
});
