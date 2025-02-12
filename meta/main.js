let data = [];
let commits = [];

// Process commits from the data
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
                hourFrac: (parseInt(first.time.split(':')[0]) + parseInt(first.time.split(':')[1]) / 60),  // Convert time to decimal
                totalLines: lines.length,  // Number of lines modified
            };
        });

    console.log("Grouped Commits:", commits);
}


async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log("Raw Data:", data);
    processCommits();  // Call function to process commit data
    console.log("Processed Commits:", commits);
  }

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
