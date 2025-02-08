import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let selectedIndex = -1; // Track the current selection

function renderPieChart(filteredProjects) {
    let svg = d3.select('svg');
    svg.selectAll('path').remove();
    d3.select('.legend').selectAll('*').remove();

    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));

    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .on('click', () => handleArcClick(idx, data));
    });

    let legend = d3.select('.legend');
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

function handleArcClick(idx, data) {
    let svg = d3.select('svg');
    let legend = d3.select('.legend');

    // Toggle the selection state
    selectedIndex = selectedIndex === idx ? -1 : idx;

    svg.selectAll('path')
        .attr('class', (_, arcIdx) => (arcIdx === selectedIndex ? 'selected' : ''));

    legend.selectAll('li')
        .attr('class', (_, arcIdx) => (arcIdx === selectedIndex ? 'selected' : ''));

    if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
    } else {
        let selectedYear = data[selectedIndex].label;
        let filteredProjects = projects.filter((project) => project.year === selectedYear);
        renderProjects(filteredProjects, projectsContainer, 'h2');
    }
}

let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    query = event.target.value;

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

// Initial render
renderPieChart(projects);
