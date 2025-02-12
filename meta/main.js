let data = [];
let commits = [];

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
    console.log("Checking if #stats exists:", document.getElementById("stats")); // Debug
    if (!document.getElementById("stats")) {
        console.error("Error: #stats div not found in the DOM.");
        return;
    }
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Total Lines of Code
    dl.append('dt').html('Total <abbr title="Lines of Code">LOC</abbr>:');
    dl.append('dd').text(data.length);

    // Total Commits
    dl.append('dt').text('Total Commits:');
    dl.append('dd').text(commits.length);

    // Max Depth
    dl.append('dt').text('Max Depth:');
    dl.append('dd').text(d3.max(data, d => d.depth));

    // Longest Line
    dl.append('dt').text('Longest Line:');
    dl.append('dd').text(d3.max(data, d => d.length));

    // Max Lines in a Commit
    dl.append('dt').text('Max Lines in a Commit:');
    dl.append('dd').text(d3.max(commits, d => d.totalLines));
}

async function loadData() {
    data = await d3.csv('./meta/loc.csv', (row) => ({
      ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log("Raw Data:", data);
    console.log("Checking first row of data:", data[0]); // Ensure we have data
    processCommits();
    displayStats();  // Call display function
    console.log("Processed Commits:", commits);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
