import { fetchJSON } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log("D3 Loaded in Console:", d3);

console.log("projects.js is running!");

async function fetchProjectData() {
    try {
        console.log("Fetching project data...");
        const projects = await fetchJSON('../lib/projects.json');
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

        console.log("Processed Pie Chart Data:", data);

        renderPieChart(data);
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
