import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("D3 Loaded in Console:", d3);

console.log("projects.js is running!");
// Declare a variable to hold the search query
let query = '';
let projects = [];

// Function to update query and filter projects
function setQuery(newQuery) {
    query = newQuery.toLowerCase();
    let filteredProjects = projects.filter(project => {
        return Object.values(project).join('\n').toLowerCase().includes(query);
    });

    console.log("Filtered Projects:", filteredProjects);
    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
}

let searchInput = document.getElementsByClassName('searchBar')[0];

searchInput.addEventListener('input', (event) => {
    if (projects.length > 0) {
        setQuery(event.target.value);
    } else {
        console.warn("Search attempted before projects loaded.");
    }
});

async function renderPieChart(data) {
    console.log("🔴 renderPieChart function is executing! Data received:", data);

    let svg = d3.select("#pieChart")
        .attr("width", 400)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(200, 200)");

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let pieGenerator = d3.pie().value(d => d.value);
    let arcData = pieGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(100);

    console.log("🎨 Pie Data Generated:", arcData);

    svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors(i))
        .style("stroke", "white")
        .style("stroke-width", "2px");

    svg.selectAll("text")
        .data(arcData)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text(d => d.data.label);

    console.log("✅ Pie Chart Rendered!");
    
    // ✅ ADD LEGEND RENDERING
    renderLegend(data, colors);
}

function renderLegend(data, colors) {
    console.log("🟢 Adding Legend...");
    
    let legendContainer = d3.select(".legend");
    legendContainer.html(""); // Clear previous legend

    data.forEach((d, i) => {
        legendContainer.append("li")
            .attr("style", `--color: ${colors(i)}`)
            .html(`<span class="swatch" style="background:${colors(i)}"></span> ${d.label} <em>(${d.value})</em>`);
    });

    console.log("✅ Legend successfully added!");
}





async function fetchProjectData() {
    try {
        console.log("Fetching project data...");
        const projects = await fetchJSON('../lib/projects.json');
        console.log("Fetched projects:", projects);

        // Group projects by year and count occurrences
        let rolledData = d3.rollups(
            projects,
            v => v.length,  // Count projects per year
            d => d.year
        );

        console.log("Processed Pie Chart Data:", rolledData);

        // Convert to the required format for the pie chart
        let data = rolledData.map(([year, count]) => ({
            value: count,
            label: year
        }));

        // Ensure the function exists before calling
        if (typeof renderPieChart === "function") {
            console.log("🔵 Calling renderPieChart...");
            renderPieChart(data);
        } else {
            console.error("Error: renderPieChart function is not defined!");
        }

    } catch (error) {
        console.error("Error fetching project data:", error);
    }
}


fetchProjectData();

console.log("Pie chart successfully rendered!");

async function init() {
  try {
    console.log("Calling fetchJSON...");
    const projects = await fetchJSON('../lib/projects.json');
    console.log("Fetched projects:", projects);

    // Select the container that holds your projects.
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');

    // For debugging: set a background color on the container so we know it's visible.
    projectsContainer.style.backgroundColor = 'lightyellow';

    // Clear the container so only dynamic projects from JSON are shown.
    projectsContainer.innerHTML = '';
    console.log("Cleared projects container. InnerHTML now:", projectsContainer.innerHTML);

    // Update the heading text with the project count.
    if (projectsTitle && projects) {
      projectsTitle.textContent = `${projects.length} Projects`;
    }

    console.log("About to render projects...");
    renderProjects(projects, projectsContainer, 'h2');
    console.log("After rendering projects, container innerHTML:", projectsContainer.innerHTML);
  } catch (error) {
    console.error('Error in init():', error);
  }
}

init();

function renderProjects(projects, container, headingLevel = 'h2') {
  console.log("Inside renderProjects. Number of projects to render:", projects.length);
  projects.forEach((project, index) => {
    console.log(`Rendering project ${index + 1}:`, project);

    const article = document.createElement('article');
    // Add styles for debugging so the articles are clearly visible.
    article.style.border = '1px solid red';
    article.style.padding = '10px';
    article.style.margin = '10px 0';
    article.style.backgroundColor = 'white';

    const heading = document.createElement(headingLevel);
    heading.textContent = project.title;

    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    img.style.maxWidth = '100%';

    const textDiv = document.createElement('div');
    textDiv.className = 'project-text';

    const description = document.createElement('p');
    description.textContent = project.description;

    // Create the year element with your desired styling.
    const yearText = document.createElement('p');
    yearText.textContent = `c. ${project.year}`;
    yearText.style.fontFamily = 'Baskerville, "Baskerville Old Face", serif';
    yearText.style.fontVariantNumeric = 'oldstyle-nums';
    yearText.style.fontStyle = 'italic';
    yearText.style.color = '#666';

    textDiv.appendChild(description);
    textDiv.appendChild(yearText);

    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(textDiv);

    container.appendChild(article);
  });
  console.log("Finished rendering projects.");
}
