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
const yScale = d3.scaleLinear().domain([0, 24]).range([usableHeight, 0]);

function processCommits() {
    commits = d3.groups(data, d => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];

            return {
                id: commit,
                url: `https://github.com/stephanieyyue/portfolio/commit/${commit}`,
                author: first.author,
                date: first.date,
                time: first.time,
                timezone: first.timezone,
                datetime: first.datetime,
                hourFrac: (parseInt(first.time.split(':')[0]) + parseInt(first.time.split(':')[1]) / 60),
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
    // Update scales with domain values from the data
    xScale.domain(d3.extent(commits, d => d.datetime));
    yScale.domain([0, 24]); // Ensuring the Y-axis represents time of day

    // Append circles for each commit
    svg.selectAll("circle")
        .data(commits)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", 5)
        .attr("fill", "steelblue");

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${usableHeight})`) // Move to bottom
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")));  // Format date labels

    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(6)); // Displaying time in 6 intervals

    console.log("Scatter plot added.");
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
