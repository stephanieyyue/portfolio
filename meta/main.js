let data = [];
let commits = [];
const width = 1000;
const height = 600;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };  // Adjusted for axes
const usableWidth = width - margin.left - margin.right;
const usableHeight = height - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

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
            };
        });

    console.log("Grouped Commits:", commits);
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

    // ✅ FIX: Set Y-axis scale before using it
    yScale.domain([new Date(2023, 0, 1, 0, 0), new Date(2023, 0, 1, 23, 59)]); // 24-hour format
    xScale.domain(d3.extent(commits, d => d.datetime));

    // ✅ Add grid lines BEFORE axes
    const gridlines = svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(0, 0)`);

    gridlines.call(d3.axisLeft(yScale)
        .tickFormat("")  // Remove text labels
        .tickSize(-usableWidth)); // Full-width grid lines

    // ✅ Append circles for each commit
    svg.selectAll("circle")
        .data(commits)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.datetime)) 
        .attr("cy", d => yScale(d.time)) 
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseenter", (event, commit) => updateTooltipContent(commit, event))
        .on("mouseleave", () => updateTooltipContent(null)); // Clear tooltip on exit

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${usableHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));

    // Add Y-axis
    svg.append("g").call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%H:%M")));

    console.log("Scatter plot with tooltips added.");
}

function updateTooltipContent(commit, event) {
    const tooltip = document.getElementById('commit-tooltip');
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');

    if (!commit || Object.keys(commit).length === 0) {
        tooltip.style.display = "none"; // Hide tooltip when leaving a dot
        return;
    }

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleString('en', { dateStyle: 'full' });

    // Position tooltip near the mouse pointer
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY + 10) + "px";
    tooltip.style.display = "block";
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
});
