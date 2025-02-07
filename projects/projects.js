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
        const projects = await fetchJSON('../lib/projects.json');
        console.log("projects.js project!");
        console.log("Fetched projects:", projects); // Debug log

        const dynamicContainer = document.querySelector('.dynamic-projects');
        const projectsTitle = document.querySelector('.projects-title');

        if (projectsTitle && projects) {
            projectsTitle.textContent = `${projects.length} Projects`;
        }

        if (dynamicContainer && projects) {
            renderProjects(projects, dynamicContainer, 'h2');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


init();

function renderProjects(projects, container, headingLevel = 'h2') {
    projects.forEach(project => {
        console.log("Project year:", project.year);
        console.log("Rendering project:", project); // Debug log
        const article = document.createElement('article');
        
        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;
        
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'project-text';
        
        const description = document.createElement('p');
        description.textContent = project.description;
        
        // Create the year element.
        const yearText = document.createElement('p');
        yearText.textContent = `c. ${project.year}`;
        yearText.style.fontFamily = 'serif';
        yearText.style.fontStyle = 'italic';
        yearText.style.color = '#666';
        
        textDiv.appendChild(description);
        textDiv.appendChild(yearText);
        
        article.appendChild(heading);
        article.appendChild(img);
        article.appendChild(textDiv);
        
        container.appendChild(article);
    });
}
