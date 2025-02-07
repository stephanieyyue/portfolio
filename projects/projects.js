import { fetchJSON } from '../global.js';
import * as d3 from 'https://unpkg.com/d3@7?module';

// Define data for the pie chart
let data = [1, 2, 3, 4, 5, 5];

// Create a pie chart generator
let pieGenerator = d3.pie();

// Generate pie chart data
let pieData = pieGenerator(data); // Moved this after the generator is defined

// Define an arc generator for each slice
let arcGenerator = d3.arc()
    .innerRadius(0)  // Pie chart (0 for no hole, donut chart otherwise)
    .outerRadius(50); // Radius of the pie

// Define a color scale using d3.schemeTableau10
let colors = d3.scaleOrdinal(d3.schemeTableau10); // Corrected: This is a function

// Select the SVG element
let svg = d3.select("svg");

// Append the slices to the SVG
svg.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arcGenerator)
    .attr("fill", (d, i) => colors(i)) // Use colors(i) instead of colors[i]
    .attr("stroke", "white") // Optional: Adds a white border between slices
    .attr("stroke-width", 1)
    .attr("transform", "translate(50,50)"); // Center the pie chart

    
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
