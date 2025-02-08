import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("D3 Loaded in Console:", d3);

console.log("projects.js is running!");
// Declare a variable to hold the search query
let query = '';
let projects = [];

// Function to update query and filter projects
function setQuery(newQuery) {
    if (!projects || projects.length === 0) {
        console.warn("🚨 Projects data is not available yet.");
        return;
    }

    query = newQuery.toLowerCase();

    // ✅ Filter projects based on title
    let filteredProjects = projects.filter(project => {
        return project.title.toLowerCase().includes(query);
    });

    console.log("🔍 Searching for:", query);
    console.log("✅ Filtered Projects:", filteredProjects);

    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = ''; // ✅ Clear old projects

    if (filteredProjects.length > 0) {
        renderProjects(filteredProjects, projectsContainer, 'h2'); // ✅ Render filtered projects

        // ✅ Update Pie Chart & Legend
        updatePieChart(filteredProjects);
    } else {
        projectsContainer.innerHTML = "<p>No matching projects found.</p>";
        updatePieChart([]); // ✅ Reset chart if no projects are found
    }
}

function updatePieChart(filteredProjects) {
    console.log("🔄 Updating Pie Chart with Filtered Projects...");

    // ✅ Clear old SVG content before rendering new chart
    let svg = d3.select("#pieChart");
    svg.selectAll("*").remove();

    // ✅ If no filtered projects, just return and clear the chart
    if (filteredProjects.length === 0) {
        console.log("🛑 No projects match search. Pie chart cleared.");
        return;
    }

    // ✅ Recalculate the aggregated data (projects per year)
    let newRolledData = d3.rollups(
        filteredProjects,
        v => v.length,
        d => d.year
    );

    let newData = newRolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    console.log("📊 New Pie Chart Data:", newData);

    // ✅ Render new Pie Chart
    renderPieChart(newData);
}




let searchInput = document.getElementsByClassName('searchBar')[0];

searchInput.addEventListener('input', (event) => {
    if (projects.length > 0) {
        setQuery(event.target.value);
    } else {
        console.warn("🚨 Search attempted before projects loaded.");
    }
});



async function renderPieChart(data) {
    console.log("🔴 renderPieChart function is executing! Data received:", data);

    let svg = d3.select("#pieChart");
    svg.selectAll("*").remove(); // ✅ Clear old chart

    if (data.length === 0) {
        console.log("🛑 No data to render in pie chart.");
        return;
    }

    let width = 400, height = 400;
    let radius = Math.min(width, height) / 2;

    let g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let pieGenerator = d3.pie().value(d => d.value);
    let arcData = pieGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    console.log("🎨 Pie Data Generated:", arcData);

    g.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors(i))
        .style("stroke", "white")
        .style("stroke-width", "2px");

    g.selectAll("text")
        .data(arcData)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text(d => d.data.label);

    console.log("✅ Pie Chart Rendered!");

    // ✅ Update legend
    renderLegend(data, colors);
}


function renderLegend(data, colors) {
    console.log("🟢 Updating Legend...");

    let legendContainer = d3.select(".legend");
    legendContainer.html(""); // ✅ Clear previous legend

    if (data.length === 0) {
        console.log("🛑 No legend to display.");
        return;
    }

    data.forEach((d, i) => {
        legendContainer.append("li")
            .attr("style", `--color: ${colors(i)}`)
            .html(`<span class="swatch" style="background:${colors(i)}"></span> ${d.label} <em>(${d.value})</em>`);
    });

    console.log("✅ Legend successfully updated!");
}


async function fetchProjectData() {
    try {
        console.log("Fetching project data...");
        projects = await fetchJSON('../lib/projects.json'); // ✅ Assign to global variable
        console.log("Fetched projects:", projects);

        let rolledData = d3.rollups(
            projects,
            v => v.length,  
            d => d.year
        );

        let data = rolledData.map(([year, count]) => ({
            value: count,
            label: year
        }));

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
        projects = await fetchJSON('../lib/projects.json');  // ✅ Assign to global variable
        console.log("Fetched projects:", projects);

        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        projectsContainer.innerHTML = '';

        if (projectsTitle) {
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

function renderProjects(filteredProjects, container, headingLevel = 'h2') {
    console.log("🖌 Rendering Projects: Number to Render →", filteredProjects.length);
    
    container.innerHTML = ''; // ✅ CLEAR PREVIOUS PROJECTS

    filteredProjects.forEach((project, index) => {
        console.log(`🎨 Rendering project ${index + 1}:`, project.title);

        const article = document.createElement('article');
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

    console.log("✅ Finished Rendering Projects");
}
