let data = [];
let commits = [];
let brushSelection = null;
const width = 1000;
const height = 600;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };  // Adjusted for axes
const usableWidth = width - margin.left - margin.right;
const usableHeight = height - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", 600)  // Adjust as needed
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");  // Keeps aspect ratio


const xScale = d3.scaleTime().range([0, usableWidth]);
const yScale = d3.scaleTime().range([usableHeight, 0]);

function processCommits() {
    commits = d3.groups(data, d => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];

            // Extract hour and minute from the commit time
            let [hours, minutes] = first.time.split(':').map(Number);

            return {
                id: commit,
                url: `https://github.com/stephanieyyue/portfolio/commit/${commit}`,
                author: first.author,
                date: first.date,
                timezone: first.timezone,
                datetime: new Date(first.datetime), // Keep full datetime for X-axis
                time: new Date(2023, 0, 1, hours, minutes), // Convert hour+minute to Date object for Y-axis
                totalLines: lines.length,
                lines: lines.map(d => ({ type: d.type || "unknown", length: d.length || 0 })) // ✅ Ensure lines exist
            };
        });

    console.log("Processed Commits:", commits);
}



function displayStats() {
    console.log("Checking if #stats exists:", document.getElementById("stats")); 
    if (!document.getElementById("stats")) {
        console.error("Error: #stats div not found in the DOM.");
        return;
    }

    const statsContainer = d3.select('#stats')
        .append('div')
        .attr('class', 'stats-container');

    const stats = [
        { label: 'Commits', value: commits.length },
        { label: 'Files', value: new Set(data.map(d => d.file)).size }, // Unique file count
        { label: 'Total LOC', value: data.length },
        { label: 'Max Depth', value: d3.max(data, d => d.depth) || "N/A" },
        { label: 'Longest Line', value: d3.max(data, d => d.length) || "N/A" },
        { label: 'Max Lines', value: d3.max(commits, d => d.totalLines) || "No commits found" }
    ];

    stats.forEach(stat => {
        let statBox = statsContainer.append('div').attr('class', 'stat-box');
        statBox.append('dt').text(stat.label);
        statBox.append('dd').text(stat.value);
    });

    console.log("Stats added to the page");
}

// Function to create the scatter plot
function createScatterPlot() {
    if (commits.length === 0) {
        console.error("No commits to display.");
        return;
    }

    // ✅ Fix Y-axis scale as time scale
    yScale.domain([new Date(2023, 0, 1, 0, 0), new Date(2023, 0, 1, 23, 59)]);
    xScale.domain(d3.extent(commits, d => d.datetime));

    // ✅ Calculate min/max total lines edited
    const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);

    // ✅ Use a square root scale for radius
    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]); // Experiment with min/max values

    // ✅ Sort commits by total lines edited in descending order
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // ✅ Call brushSelector() BEFORE rendering dots
    brushSelector();

    // ✅ Add grid lines BEFORE axes
    const gridlines = svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(0, 0)`);

    gridlines.call(d3.axisLeft(yScale)
        .tickFormat("")  // Remove text labels
        .tickSize(-usableWidth)); // Full-width grid lines

    // ✅ Append circles using sortedCommits
    const dots = svg.selectAll("circle")
        .data(sortedCommits)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.time))
        .attr("r", d => rScale(d.totalLines))  // ✅ Scaled dot sizes
        .attr("fill", "steelblue")
        .style("fill-opacity", 0.7) // ✅ Make overlapping dots visible
        .on("mouseenter", (event, commit) => {
            updateTooltipContent(commit, event);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            d3.select(event.currentTarget).style("fill-opacity", 1); // Highlight hovered dot
        })
        .on("mousemove", (event) => updateTooltipPosition(event)) // Track mouse movement
        .on("mouseleave", (event) => {
            updateTooltipContent(null, null);
            updateTooltipVisibility(false);
            d3.select(event.currentTarget).style("fill-opacity", 0.7); // Restore opacity
        });

    // ✅ Fix tooltip disappearance by bringing dots to the top layer
    d3.select(svg.node()).selectAll('.dots, .overlay ~ *').raise();

    // ✅ Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${usableHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));

    // ✅ Add Y-axis with proper Time format
    svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%H:%M")));

    console.log("Scatter plot with brushing, tooltips, and improved dot scaling added.");
}


function brushSelector() {
    const svgElement = document.querySelector('svg');

    d3.select(svgElement)
        .call(d3.brush()
            .extent([[0, 0], [usableWidth, usableHeight]]) 
            .on("start brush end", (event) => {
                console.log("Brush event detected:", event.selection);

                brushSelection = event.selection;

                if (!brushSelection) {
                    d3.selectAll("circle").style("fill", "steelblue");
                    updateSelectionCount();
                    return;
                }

                brushed(event);  // ✅ Ensure this is called on brush event
            })
        );
}






function brushed(event) {
    brushSelection = event.selection;
    
    updateSelection();        // ✅ Update dot colors
    updateSelectionCount();   // ✅ Update commit count
    updateLanguageBreakdown();  // ✅ Should now run every time a brush event happens

    console.log("Brushed event triggered!");  // ✅ Debugging log
}



function isCommitSelected(commit) {
    if (!brushSelection) return false;

    const [[x0, y0], [x1, y1]] = brushSelection;

    const x = xScale(commit.datetime);
    const y = yScale(commit.time);

    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}


function updateSelection() {
    d3.selectAll("circle")
        .style("fill", d => isCommitSelected(d) ? "orange" : "steelblue")
        .style("stroke", d => isCommitSelected(d) ? "white" : "none")
        .style("stroke-width", d => isCommitSelected(d) ? 2 : 0);
}


function updateSelectionCount() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];

    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;

    return selectedCommits; // Optional: Can be used for additional processing
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
        ? commits.filter(isCommitSelected)
        : [];

    console.log("🟢 Selected Commits:", selectedCommits);

    const container = document.getElementById("language-breakdown");

    if (selectedCommits.length === 0) {
        container.innerHTML = "No commits selected";
        return;
    }

    // ✅ Extract lines safely inside the function
    const lines = selectedCommits.flatMap(d => d.lines || []);

    console.log("🟡 Extracted Lines Data:", lines); // 🔴 If this is empty, problem is here!

    if (lines.length === 0) {
        container.innerHTML = "No language data available";
        return;
    }

    // ✅ Ensure only valid `type` properties
    const breakdown = d3.rollup(
        lines.filter(d => d.type),  // 🔴 Fix: Ensure `type` is not undefined
        (v) => v.length,
        (d) => d.type
    );

    console.log("🔵 Language Breakdown Data:", breakdown);

    container.innerHTML = "";
    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format(".1%")(proportion);

        container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
    }

    return breakdown;
}







function updateTooltipContent(commit, event) {
    const tooltip = document.getElementById('commit-tooltip');
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');

    if (!commit || Object.keys(commit).length === 0 || !event) {
        tooltip.classList.remove("show"); // Hide tooltip smoothly
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });

    // ✅ Check if event is provided before using `pageX` and `pageY`
    if (event) {
        tooltip.style.left = (event.pageX + 15) + "px";
        tooltip.style.top = (event.pageY + 15) + "px";
    }

    tooltip.classList.add("show");
}


function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible; // Show or hide based on isVisible flag
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');

    tooltip.style.left = `${event.clientX + 10}px`; // Offset tooltip 10px to the right
    tooltip.style.top = `${event.clientY + 10}px`;  // Offset tooltip 10px down
}

async function loadData() {
    data = await d3.csv('../meta/loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log("Raw Data:", data);
    console.log("Checking first row of data:", data[0]); // Ensure we have data
    processCommits();
    displayStats(); 
    createScatterPlot();
    console.log("Processed Commits:", commits);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    updateLanguageBreakdown();
});
