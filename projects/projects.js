import { fetchJSON } from '../global.js';
import * as d3 from 'https://unpkg.com/d3@7?module';

console.log("projects.js is running!");

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

async function init() {
  try {
    console.log("Calling fetchJSON...");
    const projects = await fetchJSON('../lib/projects.json');
    console.log("Fetched projects:", projects);

    // Select the container that holds your projects.
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');

    // Clear the container so only dynamic projects from JSON are shown.
    projectsContainer.innerHTML = '';

    // Update the heading text with the project count.
    if (projectsTitle && projects) {
      projectsTitle.textContent = `${projects.length} Projects`;
    }

    // Render the projects dynamically.
    projects.forEach(project => {
      const projectElement = document.createElement('div');
      projectElement.classList.add('project');
      projectElement.textContent = project.name; // Assuming each project has a 'name' property
      projectsContainer.appendChild(projectElement);
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
}

init();

function renderProjects(projects, container, headingLevel = 'h2') {
  projects.forEach(project => {
    console.log("Rendering project:", project);
    const article = document.createElement('article');
    
    // Create the heading with the project title.
    const heading = document.createElement(headingLevel);
    heading.textContent = project.title;
    
    // Create the image element.
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    
    // Create a div to wrap the description and the year.
    const textDiv = document.createElement('div');
    textDiv.className = 'project-text';
    
    // Create the description paragraph.
    const description = document.createElement('p');
    description.textContent = project.description;
    
    // Create the year paragraph with the desired styling.
    const yearText = document.createElement('p');
    yearText.textContent = `c. ${project.year}`;
    yearText.style.fontFamily = 'Baskerville, "Baskerville Old Face", serif';
    yearText.style.fontVariantNumeric = 'oldstyle-nums';
    yearText.style.fontStyle = 'italic';
    yearText.style.color = '#666';
    
    // Append description and year to the text div.
    textDiv.appendChild(description);
    textDiv.appendChild(yearText);
    
    // Append heading, image, and text div to the article.
    article.appendChild(heading);
    article.appendChild(img);
    article.appendChild(textDiv);
    
    // Append the article to the container.
    container.appendChild(article);
  });
}