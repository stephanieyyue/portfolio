import { fetchJSON } from '../global.js';
import * as d3 from 'https://unpkg.com/d3@7?module';

console.log("projects.js is running!");

// Create an arc generator with an inner radius of 0 and an outer radius of 50.
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Generate a full circle (arc path) by specifying the start and end angles in radians.
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

// Append the arc as a new path element to the existing <svg> element.
d3.select('svg')
  .append('path')
  .attr('d', arc)
  .attr('fill', 'red');

async function init() {
    try {
        console.log("Calling fetchJSON...");
        const projects = await fetchJSON('../lib/projects.json');
        console.log("Fetched projects:", projects);
        console.log("Projects length:", projects.length);

        const projectsContainer = document.querySelector('.projects');
        console.log("Projects container:", projectsContainer);

        const projectsTitle = document.querySelector('.projects-title');

        // Clear the container so only dynamic projects are shown.
        if (projectsContainer) {
            projectsContainer.innerHTML = '';
            console.log("Cleared projects container.");
        } else {
            console.error("Projects container not found.");
        }

        if (projectsTitle && projects) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        console.log("About to render projects.");
        renderProjects(projects, projectsContainer, 'h2');
        console.log("renderProjects function called.");
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
        article.style.border = '1px solid red';
        article.style.padding = '10px';
        article.style.margin = '10px 0';

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

        // Create the year element.
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
