import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("D3 Loaded in Console:", d3);

console.log("projects.js is running!");
// Declare a variable to hold the search query
let query = '';
let projects = [];
let selectedYear = null;


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

function updatePieChart(selectedYear) {
    console.log(`🔄 Updating Pie Chart for Selected Year: ${selectedYear}`);

    let filteredData = selectedYear 
        ? [{ label: selectedYear, value: projects.filter(p => p.year === selectedYear).length }]
        : d3.rollups(projects, v => v.length, d => d.year)
            .map(([year, count]) => ({ label: year, value: count }));

    renderPieChart(filteredData);
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

    let svg = d3.select("#pieChart")
        .attr("width", 400)
        .attr("height", 400)
        .html("")  // ✅ Clear old chart before updating
        .append("g")
        .attr("transform", "translate(200, 200)");

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let pieGenerator = d3.pie().value(d => d.value);
    let arcData = pieGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(100);

    console.log("🎨 Pie Data Generated:", arcData);

    // ✅ Append Paths with Click Event for Highlighting
    let paths = svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors(i))  // Default color
        .attr("data-year", d => d.data.label)  // Store year for reference
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("transition", "opacity 300ms ease-in-out")
        .on("click", function(event, d) {
            console.log(`🟢 Wedge Clicked: ${d.data.label}`);

            // Toggle selection (if the same year clicked again, reset)
            if (selectedYear === d.data.label) {
                selectedYear = null; // Reset selection
                paths.attr("fill", (d, i) => colors(i)); // Restore original colors
                renderProjects(projects, document.querySelector('.projects'), 'h2'); // Show all projects
            } else {
                selectedYear = d.data.label;

                // Reset colors and highlight only the selected wedge
                paths.attr("fill", (d, i) => colors(i)); // Reset all wedges
                d3.select(this).attr("fill", "#FFD700"); // Highlight selected wedge (Gold)

                filterAndRenderProjects(selectedYear); // Filter projects
            }
        });

    console.log("✅ Pie Chart Rendered!");
    
    // ✅ ADD LEGEND RENDERING
    renderLegend(data, colors);
}



function filterAndRenderProjects(year) {
    console.log(`Filtering projects for year: ${year}`);
    let filteredProjects = projects.filter(project => project.year === year);

    console.log("Filtered Projects:", filteredProjects);

    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = ''; // Clear existing projects
    renderProjects(filteredProjects, projectsContainer, 'h2');
}



function renderLegend(data, colors, selectedYear = null) {
    console.log("🟢 Updating Legend...");

    let legendContainer = d3.select(".legend");
    legendContainer.html("");

    if (data.length === 0) {
        console.log("🛑 No legend to display.");
        return;
    }

    data.forEach((d, i) => {
        const isSelected = selectedYear === null || d.label === selectedYear;
        const color = isSelected ? colors(i) : "#808080"; // Use gray for non-selected years
        
        legendContainer.append("li")
            .attr("style", `--color: ${color}`)
            .html(`
                <span class="swatch" style="background:${color}"></span>
                ${d.label} <em>(${d.value})</em>
            `);
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
