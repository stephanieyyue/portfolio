import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
const githubData = await fetchGitHubData('stephanieyyue');
const profileStats = document.querySelector('#profile-stats');

if (projectsContainer && latestProjects) {
    renderProjects(latestProjects, projectsContainer, 'h2');
}

if (profileStats) {
    profileStats.innerHTML = `
        <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}