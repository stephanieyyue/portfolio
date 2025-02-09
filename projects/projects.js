import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("D3 Loaded in Console:", d3);

console.log("projects.js is running!");
// Declare a variable to hold the search query
let query = '';
let projects = [];
let selectedYear = null;
let selectedIndex = -1;
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function embedArcClick(arcsGiven, projectsGiven, dataGiven) {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Get or create the SVG element with fixed dimensions and position
    let svg = d3.select("#pieChart")
        .attr("width", 400)
        .attr("height", 400);
    
    // Clear existing content
    svg.html("");
    
    // Create a group element for the pie chart with fixed transform
    let g = svg.append("g")
        .attr("transform", "translate(200, 200)");  // Center of the SVG
    
    // Clear legend
    d3.select(".legend").html("");

    arcsGiven.forEach((arc, i) => {
        let path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", arc);
        path.setAttribute("fill", colors(i));
        path.setAttribute("stroke", "white");
        path.setAttribute("stroke-width", "2px");
        
        path.addEventListener('click', (event) => {
            selectedIndex = selectedIndex === i ? -1 : i;
            
            // Update all paths
            g.selectAll("path").each(function(d, idx) {
                const pathElement = d3.select(this);
                if (selectedIndex === idx) {
                    pathElement.attr("fill", "#FFD700");
                } else {
                    pathElement.attr("fill", colors(idx));
                }
            });

            // Update legend colors
            d3.select(".legend")
                .selectAll("li")
                .each(function(d, idx) {
                    const li = d3.select(this);
                    const color = selectedIndex === idx ? "#FFD700" : colors(idx);
                    li.select(".swatch").style("background", color);
                    li.attr("style", `--color: ${color}`);
                });

            // Filter and render projects
            if (selectedIndex !== -1) {
                let selectedYear = dataGiven[selectedIndex].label;
                let filteredProjects = projectsGiven.filter(project => 
                    project.year === selectedYear
                );
                renderProjects(filteredProjects, projectsContainer, 'h2');
            } else {
                renderProjects(projectsGiven, projectsContainer, 'h2');
            }
        });

        g.node().appendChild(path);  // Append to the group instead of directly to SVG

        // Create legend item
        const legendContainer = d3.select(".legend");
        const li = legendContainer.append("li")
            .attr("style", `--color: ${colors(i)}`);
        
        li.append("span")
            .attr("class", "swatch")
            .style("background", colors(i));
        
        li.append("span")
            .html(`${dataGiven[i].label} <em>(${dataGiven[i].value})</em>`);
    });
}

// Function to update query and filter projects
function setQuery(newQuery) {
    if (!projects || projects.length === 0) {
        console.warn("🚨 Projects data is not available yet.");
        return;
    }

    query = newQuery.toLowerCase();
    
    // Filter projects based on title
    let filteredProjects = projects.filter(project => 
        project.title.toLowerCase().includes(query)
    );

    const projectsContainer = document.querySelector('.projects');
    projectsContainer.innerHTML = '';

    if (filteredProjects.length > 0) {
        // Update projects display
        renderProjects(filteredProjects, projectsContainer, 'h2');
        
        // Recalculate data for pie chart
        let newRolledData = d3.rollups(
            filteredProjects,
            v => v.length,
            d => d.year
        );

        let newData = newRolledData.map(([year, count]) => ({
            label: year,
            value: count
        }));

        // Generate new arcs
        let pie = d3.pie()
            .value(d => d.value);
        
        let arc = d3.arc()
            .innerRadius(0)
            .outerRadius(100);

        let newArcData = pie(newData);
        let newArcs = newArcData.map(d => arc(d));

        // Reset selected index since we're generating a new chart
        selectedIndex = -1;

        // Clear existing and create new visualization
        embedArcClick(newArcs, filteredProjects, newData);
    } else {
        projectsContainer.innerHTML = "<p>No matching projects found.</p>";
        // Clear pie chart if no results
        d3.select("#pieChart").selectAll("path").remove();
        d3.select(".legend").html("");
    }

    // Update projects title count if it exists
    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `${filteredProjects.length} Projects`;
    }

    return filteredProjects;
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
        .html("")
        .append("g")
        .attr("transform", "translate(200, 200)");

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let pieGenerator = d3.pie().value(d => d.value);
    let arcData = pieGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(100);

    console.log("🎨 Pie Data Generated:", arcData);

    // Append Paths with Click Event for Highlighting
    let paths = svg.selectAll("path")
        .data(arcData)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d, i) => colors(i))
        .attr("data-year", d => d.data.label)
        .style("stroke", "white")
        .style("stroke-width", "2px")
        .style("transition", "opacity 300ms ease-in-out")
        .on("click", function(event, d) {
            console.log(`🟢 Wedge Clicked: ${d.data.label}`);

            // Toggle selection
            if (selectedYear === d.data.label) {
                selectedYear = null;
                // Reset all wedges and legend items to original colors
                paths.attr("fill", (d, i) => colors(i));
                renderProjects(projects, document.querySelector('.projects'), 'h2');
                updateLegendColors(data, colors, null);
            } else {
                selectedYear = d.data.label;
                
                // Update wedge colors - keep original colors except for selected
                paths.attr("fill", (d, i) => 
                    d.data.label === selectedYear ? "#FFD700" : colors(i)
                );
                
                filterAndRenderProjects(selectedYear);
                updateLegendColors(data, colors, selectedYear);
            }
        });

    console.log("✅ Pie Chart Rendered!");
    
    // Initial legend render
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

function updateLegendColors(data, colors, selectedYear) {
    d3.select(".legend")
        .selectAll("li")
        .each(function(d, i) {
            const li = d3.select(this);
            const year = data[i].label;
            // Keep original colors except for selected year
            const color = selectedYear === null ? colors(i) : 
                         year === selectedYear ? "#FFD700" : colors(i);
            
            li.select(".swatch")
                .style("background", color);
            
            li.attr("style", `--color: ${color}`);
        });
}

function renderLegend(data, colors) {
    console.log("🟢 Updating Legend...");

    let legendContainer = d3.select(".legend");
    legendContainer.html("");

    if (data.length === 0) {
        console.log("🛑 No legend to display.");
        return;
    }

    data.forEach((d, i) => {
        legendContainer.append("li")
            .attr("style", `--color: ${colors(i)}`)
            .html(`
                <span class="swatch" style="background:${colors(i)}"></span>
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
