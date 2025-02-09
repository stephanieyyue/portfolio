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
const svg = d3.select("#pieChart")
    .attr("width", 400)
    .attr("height", 400)
    .style("position", "fixed")  // Keep the chart in place
    .style("top", "50px")       // Adjust these values as needed
    .style("left", "50px");     // Adjust these values as needed

    function setQuery(newQuery) {
        if (!projects || projects.length === 0) {
            console.warn("🚨 Projects data is not available yet.");
            return;
        }
    
        query = newQuery.toLowerCase();
        const projectsContainer = document.querySelector('.projects');
        
        // Filter projects based on search query
        let filteredProjects = projects.filter(project => 
            project.title.toLowerCase().includes(query)
        );
    
        // Update projects display
        if (filteredProjects.length > 0) {
            // Update projects title
            const projectsTitle = document.querySelector('.projects-title');
            if (projectsTitle) {
                projectsTitle.textContent = `${filteredProjects.length} Projects`;
            }
    
            // Calculate pie chart data from filtered projects
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
            let pie = d3.pie().value(d => d.value);
            let arc = d3.arc().innerRadius(0).outerRadius(100);
            let newArcData = pie(newData);
            let newArcs = newArcData.map(d => arc(d));
    
            // Reset selection state
            selectedIndex = -1;
    
            // Update the pie chart
            updateVisualization(newArcs, filteredProjects, newData);
    
            // Display filtered projects
            renderProjects(filteredProjects, projectsContainer, 'h2');
        } else {
            // Handle no results
            projectsContainer.innerHTML = "<p>No matching projects found.</p>";
            const projectsTitle = document.querySelector('.projects-title');
            if (projectsTitle) {
                projectsTitle.textContent = "0 Projects";
            }
            
            // Clear pie chart
            d3.select("#pieChart").selectAll("*").remove();
            d3.select(".legend").html("");
        }
    }
    


    function updateVisualization(arcs, projectsData, data) {
        const svg = d3.select("#pieChart")
            .attr("width", 400)
            .attr("height", 400);
        
        // Clear existing content
        svg.selectAll("*").remove();
        
        // Create centered group
        const g = svg.append("g")
            .attr("transform", `translate(${400/2},${400/2})`);
    
        // Add paths
        arcs.forEach((arc, i) => {
            g.append("path")
                .attr("d", arc)
                .attr("fill", colors(i))
                .attr("stroke", "white")
                .attr("stroke-width", "2px")
                .on("click", () => {
                    const projectsContainer = document.querySelector('.projects');
                    selectedIndex = selectedIndex === i ? -1 : i;
                    
                    // Update wedge colors
                    g.selectAll("path")
                        .attr("fill", (_, idx) => 
                            idx === selectedIndex ? "#FFD700" : colors(idx)
                        );
    
                    // Update legend
                    updateLegend(data, selectedIndex);
    
                    // Filter and update projects based on both search and year selection
                    if (selectedIndex !== -1) {
                        const selectedYear = data[selectedIndex].label;
                        // Apply both search filter and year filter
                        const yearFilteredProjects = projectsData.filter(p => p.year === selectedYear);
                        renderProjects(yearFilteredProjects, projectsContainer, 'h2');
                        
                        // Update project count
                        const projectsTitle = document.querySelector('.projects-title');
                        if (projectsTitle) {
                            projectsTitle.textContent = `${yearFilteredProjects.length} Projects`;
                        }
                    } else {
                        // If no year selected, show all projects that match search
                        renderProjects(projectsData, projectsContainer, 'h2');
                        
                        // Update project count
                        const projectsTitle = document.querySelector('.projects-title');
                        if (projectsTitle) {
                            projectsTitle.textContent = `${projectsData.length} Projects`;
                        }
                    }
                });
        });
    
        // Update legend
        updateLegend(data);
    }

function updateLegend(data, selectedIdx = -1) {
    const legendContainer = d3.select(".legend");
    legendContainer.html("");

    data.forEach((d, i) => {
        const color = i === selectedIdx ? "#FFD700" : colors(i);
        const li = legendContainer.append("li")
            .attr("style", `--color: ${color}`);
        
        li.append("span")
            .attr("class", "swatch")
            .style("background", color);
        
        li.append("span")
            .html(`${d.label} <em>(${d.value})</em>`);
    });
}


function updatePieChart(selectedYear) {
    console.log(`🔄 Updating Pie Chart for Selected Year: ${selectedYear}`);

    let filteredData = selectedYear 
        ? [{ label: selectedYear, value: projects.filter(p => p.year === selectedYear).length }]
        : d3.rollups(projects, v => v.length, d => d.year)
            .map(([year, count]) => ({ label: year, value: count }));

    renderPieChart(filteredData);
}


let searchInput = document.querySelector('.searchBar');
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

//async function fetchProjectData() {
    //try {
        //console.log("Fetching project data...");
        //projects = await fetchJSON('../lib/projects.json'); // ✅ Assign to global variable
        //console.log("Fetched projects:", projects);

        //let rolledData = d3.rollups(
           // projects,
            //v => v.length,  
            //d => d.year
       // );

        //let data = rolledData.map(([year, count]) => ({
         //   value: count,
        //   label: year
        //}));

        //if (typeof renderPieChart === "function") {
        //    console.log("🔵 Calling renderPieChart...");
        //    renderPieChart(data);
        //} else {
         //   console.error("Error: renderPieChart function is not defined!");
        //}

    //} catch (error) {
    //    console.error("Error fetching project data:", error);
    //}
//}




//fetchProjectData();

console.log("Pie chart successfully rendered!");

async function init() {
    try {
        console.log("Calling fetchJSON...");
        projects = await fetchJSON('../lib/projects.json');
        console.log("Fetched projects:", projects);

        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');

        // Update the title
        if (projectsTitle) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        // Generate pie chart data
        let rolledData = d3.rollups(
            projects,
            v => v.length,
            d => d.year
        );

        let data = rolledData.map(([year, count]) => ({
            label: year,
            value: count
        }));

        // Create pie chart generators
        let pie = d3.pie()
            .value(d => d.value);
        
        let arc = d3.arc()
            .innerRadius(0)
            .outerRadius(100);

        // Generate arc data
        let arcData = pie(data);
        let arcs = arcData.map(d => arc(d));

        // Initialize pie chart with click behavior
        embedArcClick(arcs, projects, data);

        // Render all projects initially
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

// Create an arc generator with an inner radius of 0 and an outer radius of 50.
const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Generate a full circle (arc path) by specifying the start and end angles in radians.
const arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// Append the arc as a new path element to the existing <svg> element.
d3.select('svg')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');
